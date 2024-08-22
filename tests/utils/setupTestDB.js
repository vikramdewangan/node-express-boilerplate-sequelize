const { Sequelize } = require('sequelize');
const config = require('../../src/config/config');
const { User, ErrorLog, Token } = require('../../src/models'); // Import all your models

const sequelize = new Sequelize(config.database.url, config.database.options);

const setupTestDB = () => {
  beforeAll(async () => {
    // Connect to the test database
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database schema has been synchronized.');
  });

  afterEach(async () => {
    // Optionally, you can truncate all tables after each test to ensure a clean state
    await Promise.all(Object.values(sequelize.models).map(async (model) => model.destroy({ truncate: true, cascade: true })));
  });

  afterAll(async () => {
    // Disconnect from the test database
    await sequelize.close();
    console.log('Database connection has been closed.');
  });
};

module.exports = setupTestDB;
