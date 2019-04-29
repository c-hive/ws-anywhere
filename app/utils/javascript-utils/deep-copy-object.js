module.exports = function(object) {
  return JSON.parse(JSON.stringify(object));
};
