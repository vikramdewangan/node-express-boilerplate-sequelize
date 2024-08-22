User.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());

  delete values.password;  // Exclude sensitive fields
  return values;
};
