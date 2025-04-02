const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cdms_inventory',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Initialize models and their associations
const initializeDatabase = async () => {
  try {
    // Import models
    const User = require('../models/User');
    const AuditLog = require('../models/AuditLog');

    // Setup associations
    AuditLog.belongsTo(User, {
      foreignKey: 'user_id',
      targetKey: 'id_user',
      as: 'user',
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION'
    });

    User.hasMany(AuditLog, {
      foreignKey: 'user_id',
      sourceKey: 'id_user',
      as: 'auditLogs'
    });

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Force sync in development mode to recreate tables
    const force = process.env.NODE_ENV === 'development';
    await sequelize.sync({ force });
    console.log('Database synced successfully');

    return true;
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initializeDatabase
};