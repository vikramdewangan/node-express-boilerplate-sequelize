const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');

// Initialize Sequelize (use your actual configuration here)
const sequelize = new Sequelize('sqlite::memory:'); // Or your database configuration

const password = 'password1';

const userOne = {
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password: User.hashPassword(password),
  role: 'user',
  isEmailVerified: false,
};

const userTwo = {
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password: User.hashPassword(password),
  role: 'user',
  isEmailVerified: false,
};

const admin = {
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password: User.hashPassword(password),
  role: 'admin',
  isEmailVerified: false,
};

const insertUsers = async (users) => {
  await sequelize.sync(); // Ensure database is synced
  await User.bulkCreate(users, { validate: true });
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};
