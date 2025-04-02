const AuditLog = require('../models/AuditLog');

const auditMiddleware = (entity) => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;

    // Override the send function
    res.send = async function (data) {
      // Restore original send
      res.send = originalSend;

      try {
        // Parse response data
        const responseData = JSON.parse(data);
        
        // Only audit if the request was successful
        if (responseData.status === 'success') {
          const logEntry = {
            user_id: req.user?.id || 'system', // Assuming user info is added by auth middleware
            aksi: determineAction(req.method),
            entity,
            entity_id: req.params.id || (responseData.data?.id_barang || ''),
            before: req.method === 'PUT' ? req.originalData : null,
            after: req.method !== 'DELETE' ? responseData.data : null,
            ip_address: req.ip,
            user_agent: req.get('user-agent')
          };

          await AuditLog.create(logEntry);
        }
      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't block the response if audit logging fails
      }

      // Call the original send
      return originalSend.call(this, data);
    };

    // For PUT/DELETE requests, get the original data
    if (['PUT', 'DELETE'].includes(req.method) && req.params.id) {
      try {
        const Model = require(`../models/${entity}`);
        const originalData = await Model.findByPk(req.params.id);
        if (originalData) {
          req.originalData = originalData.toJSON();
        }
      } catch (error) {
        console.error('Error fetching original data for audit:', error);
      }
    }

    next();
  };
};

const determineAction = (method) => {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'READ';
  }
};

module.exports = auditMiddleware;