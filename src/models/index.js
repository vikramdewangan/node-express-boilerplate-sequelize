const sequelize = require('../config/database');
const User = require('./user.model');
const PreRegistration = require('./preRegistration.model');
const OTP = require('./otp.model');
const Token = require('./token.model');
const ErrorLog = require('./error.model')
// Associations can be set up here if needed
User.hasMany(Token, { foreignKey: 'userId' });
Token.belongsTo(User, { foreignKey: 'userId' });

const models = {
  User,
  PreRegistration,
  OTP,
  Token,
  ErrorLog,
};

// Add model associations here if needed
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
