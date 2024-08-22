const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ErrorLog = sequelize.define('ErrorLog', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stack: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = ErrorLog;
