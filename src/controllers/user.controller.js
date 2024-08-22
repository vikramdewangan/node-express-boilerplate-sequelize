const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models'); // Import your Sequelize model

const createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const whereClause = {};
  if (filter.name) {
    whereClause.name = filter.name;
  }
  if (filter.role) {
    whereClause.role = filter.role;
  }

  const limit = parseInt(options.limit, 10) || 10;
  const offset = (parseInt(options.page, 10) - 1) * limit || 0;
  const order = options.sortBy ? [options.sortBy.split(':')] : [['createdAt', 'DESC']];

  const result = await User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order,
  });

  res.send({
    users: result.rows,
    totalPages: Math.ceil(result.count / limit),
    currentPage: parseInt(options.page, 10) || 1,
    totalUsers: result.count,
  });
});

const getUser = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const [updated] = await User.update(req.body, {
    where: { id: req.params.userId },
    returning: true, // Sequelize will return the updated rows
  });

  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedUser = await User.findByPk(req.params.userId);
  res.send(updatedUser);
});

const deleteUser = catchAsync(async (req, res) => {
  const deleted = await User.destroy({
    where: { id: req.params.userId },
  });

  if (!deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
