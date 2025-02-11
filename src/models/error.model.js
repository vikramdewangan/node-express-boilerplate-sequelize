const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ErrorLog = sequelize.define('ErrorLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  errorId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: () => `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  stack: {
    type: DataTypes.TEXT,
  },
  statusCode: {
    type: DataTypes.INTEGER,
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  path: {
    type: DataTypes.STRING,
  },
  method: {
    type: DataTypes.STRING,
  },
  requestBody: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  requestQuery: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  userAgent: {
    type: DataTypes.STRING,
  },
  ip: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['errorId'] },
    { fields: ['statusCode'] },
    { fields: ['createdAt'] },
    { fields: ['userId'] },
  ],
});

// Hook to update existing records after sync
ErrorLog.afterSync(async () => {
  try {
    // Update any existing records that don't have errorId
    await sequelize.query(`
      UPDATE "ErrorLogs"
      SET "errorId" = 'err_' || extract(epoch from "createdAt")::text || '_' || md5(random()::text)
      WHERE "errorId" IS NULL;
    `);
  } catch (error) {
    console.error('Failed to update existing error logs:', error);
  }
});

module.exports = ErrorLog;
