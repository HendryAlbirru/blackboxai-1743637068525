const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Protect all audit log routes with authentication
router.use(authenticateToken);

// Only admin and auditor can access audit logs
router.use(authorizeRole('admin', 'auditor'));

// Get all audit logs with filtering and pagination
router.get('/', auditLogController.getAuditLogs);

// Get audit log by ID
router.get('/:id', auditLogController.getAuditLogById);

module.exports = router;