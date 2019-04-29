function deepCopyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

function objectIsNotEmpty(object) {
  return Object.keys(object).length !== 0;
}

module.exports = {
  deepCopyObject,
  objectIsNotEmpty
};
