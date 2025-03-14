const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OTP = sequelize.define(
  'OTP',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null for pre-registration OTPs
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM('REGISTRATION', 'LOGIN', 'RESET_PASSWORD'),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = OTP;
