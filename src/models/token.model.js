const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { tokenTypes } = require('../config/tokens');

const Token = sequelize.define('Token', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM,
    allowNull: true,
    values: Object.values(tokenTypes),
  },
  blacklisted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

module.exports = Token;
