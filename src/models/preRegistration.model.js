const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const PreRegistration = sequelize.define('PreRegistration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  countryCode: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 5],
    },
  },
  password: {
    type: DataTypes.STRING,
  },
  otp: {
    type: DataTypes.STRING,
  },
  otpExpiry: {
    type: DataTypes.DATE,
  },
  verificationToken: {
    type: DataTypes.STRING,
  },
  verificationTokenExpiry: {
    type: DataTypes.DATE,
  },
  registrationType: {
    type: DataTypes.ENUM('EMAIL', 'PHONE_PASSWORD', 'PHONE_OTP'),
    allowNull: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastAttempt: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  paranoid: true, // Soft deletes
});

// Hash password before saving
PreRegistration.beforeSave(async (preReg) => {
  if (preReg.changed('password') && preReg.password) {
    preReg.password = await bcrypt.hash(preReg.password, 10);
  }
});

module.exports = PreRegistration;
