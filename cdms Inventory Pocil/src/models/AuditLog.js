const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id_log: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true
  },
  user_id: {
    type: DataTypes.UUID,  // Changed from STRING to UUID to match User model
    allowNull: false
  },
  aksi: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  before: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  after: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tbl_audit_log',
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id_log']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['entity', 'entity_id']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['aksi']
    },
    {
      fields: ['user_agent']
    }
  ]
});

module.exports = AuditLog;