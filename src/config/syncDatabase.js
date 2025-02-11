const { sequelize } = require('../models');
const logger = require('./logger');

const syncDatabase = async () => {
  try {
    // Use alter: true to allow column additions
    const syncOptions = {
      alter: true,
      // Only use force in development and when explicitly requested
      force: process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true',
    };

    await sequelize.sync(syncOptions);
    logger.info('Database synchronized successfully.');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = syncDatabase;
