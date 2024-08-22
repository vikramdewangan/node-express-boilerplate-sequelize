const sequelize = require('../config/database');
const User = require('./user.model');
const Token = require('./token.model');
const ErrorLog = require('./error.model')
// Associations can be set up here if needed
User.hasMany(Token, { foreignKey: 'userId' });
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Token,
  ErrorLog,
  sequelize,
};
