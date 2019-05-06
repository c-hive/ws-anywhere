function deepCopyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

function isDefined(value) {
  return typeof value !== "undefined" && value !== null;
}

module.exports = {
  deepCopyObject,
  isDefined
};
