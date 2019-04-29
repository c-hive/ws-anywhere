const path = require("path");

module.exports = {
  port: process.env.PORT || 3000,
  indexFilePath: path.join(process.cwd(), "index.html")
};
