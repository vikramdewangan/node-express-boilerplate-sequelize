const users = await User.findAll({
  limit: 10,
  offset: 0,  // Start at the first record
});
