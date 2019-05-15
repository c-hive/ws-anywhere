const path = require("path");

require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  dbURI: process.env.MONGODB_URI || process.env.DEV_MONGODB_URI,
  indexFilePath: path.join(process.cwd(), "index.html")
};
