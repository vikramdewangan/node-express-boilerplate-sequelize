const paginate = (model) => {
  return async function (filter = {}, options = {}) {
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;
    const offset = (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll({
      where: filter,
      limit,
      offset,
      order: options.sortBy ? [options.sortBy.split(':')] : undefined,
      ...options
    });

    return {
      results: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      totalResults: count,
    };
  };
};

module.exports = paginate;
