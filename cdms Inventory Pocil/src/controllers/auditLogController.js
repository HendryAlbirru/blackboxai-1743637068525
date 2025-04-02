const { Op, Sequelize } = require('sequelize');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

class AuditLogController {
  // Get all audit logs with filtering and pagination
  async getAuditLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        userId,
        action,
        entity,
        userAgent,
        search
      } = req.query;

      // Build where clause
      const where = {};
      
      // Date range filter
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate);
      }
      
      // Basic filters
      if (userId) where.user_id = userId;
      if (action) where.aksi = action;
      if (entity) where.entity = entity;
      
      // User agent search
      if (userAgent) {
        where.user_agent = {
          [Op.iLike]: `%${userAgent}%`
        };
      }

      // General search across multiple fields
      if (search) {
        where[Op.or] = [
          { entity: { [Op.iLike]: `%${search}%` } },
          { aksi: { [Op.iLike]: `%${search}%` } },
          { ip_address: { [Op.iLike]: `%${search}%` } },
          Sequelize.literal(`"user"."username" ILIKE '%${search}%'`)
        ];
      }

      const offset = (page - 1) * limit;

      // Get audit logs with user details
      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username', 'email', 'role']
        }],
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Format response
      const formattedLogs = rows.map(log => ({
        id: log.id_log,
        timestamp: log.timestamp,
        action: log.aksi,
        entity: log.entity,
        entityId: log.entity_id,
        username: log.user ? log.user.username : null,
        userRole: log.user ? log.user.role : null,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        changes: {
          before: log.before,
          after: log.after
        }
      }));

      return res.status(200).json({
        status: 'success',
        data: formattedLogs,
        pagination: {
          total: count,
          page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get audit log by ID
  async getAuditLogById(req, res) {
    try {
      const auditLog = await AuditLog.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['username', 'email', 'role']
        }]
      });

      if (!auditLog) {
        return res.status(404).json({
          status: 'error',
          message: 'Audit log not found'
        });
      }

      // Format response
      const formattedLog = {
        id: auditLog.id_log,
        timestamp: auditLog.timestamp,
        action: auditLog.aksi,
        entity: auditLog.entity,
        entityId: auditLog.entity_id,
        username: auditLog.user ? auditLog.user.username : null,
        userRole: auditLog.user ? auditLog.user.role : null,
        ipAddress: auditLog.ip_address,
        userAgent: auditLog.user_agent,
        changes: {
          before: auditLog.before,
          after: auditLog.after
        }
      };

      return res.status(200).json({
        status: 'success',
        data: formattedLog
      });
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new AuditLogController();