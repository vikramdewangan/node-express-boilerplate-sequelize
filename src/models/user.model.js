const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    countryCode: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 5],
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: [8, 100],
        isValidPassword(value) {
          if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            throw new Error('Password must contain at least 1 letter and 1 number');
          }
        },
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    authMethods: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isValidAuthMethod(value) {
          const validMethods = ['EMAIL_PASSWORD', 'PHONE_PASSWORD', 'PHONE_OTP'];
          if (!value.every((method) => validMethods.includes(method))) {
            throw new Error('Invalid authentication method');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED'),
      defaultValue: 'ACTIVE',
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Soft deletes
  }
);

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Instance methods
User.prototype.validPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
