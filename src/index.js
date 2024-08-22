const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const sequelize = require('./config/database');
let server;

// Function to synchronize database and start the server
// Synchronize models with the database
sequelize.sync({ alter: true }) // Use `force: true` only in development to drop and recreate tables
  .then(() => {
    logger.info('Database schema synchronized');

    // Authenticate Sequelize connection
    return sequelize.authenticate();
  })
  .then(() => {
    logger.info('Connection to PostgreSQL has been established successfully.');

    // Start the Express server
    server = app.listen(config.port, () => {
      logger.info(`Server is listening on port ${config.port}`);
    });
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
    process.exit(1); // Exit process with failure code
  });

// Error handling for uncaught exceptions and unhandled rejections
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0); // Exit with success code
    });
  } else {
    process.exit(0); // Exit with success code
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitHandler();
});
