const sequelize = require('../config/database');
const { ErrorLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const cleanupOldErrors = async (daysToKeep = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await ErrorLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });
  } catch (error) {
    logger.error('Error cleanup failed:', error);
  }
};

const getErrorStats = async (timeframe = '24h') => {
  const cutoffDate = new Date();
  switch (timeframe) {
    case '24h':
      cutoffDate.setHours(cutoffDate.getHours() - 24);
      break;
    case '7d':
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      break;
    default:
      cutoffDate.setHours(cutoffDate.getHours() - 24);
  }

  const stats = await ErrorLog.findAll({
    where: {
      createdAt: {
        [Op.gte]: cutoffDate,
      },
    },
    attributes: [
      'statusCode',
      [sequelize.fn('COUNT', '*'), 'count'],
      [sequelize.fn('array_agg', sequelize.col('path')), 'paths'],
    ],
    group: ['statusCode'],
  });

  return stats;
};

module.exports = {
  cleanupOldErrors,
  getErrorStats,
};
