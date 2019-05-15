const path = require("path");

module.exports = {
  port: process.env.PORT || 3000,
  dbURI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  indexFilePath: path.join(process.cwd(), "index.html")
};
