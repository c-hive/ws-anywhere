const path = require("path");
const express = require("express");

const port = process.env.PORT || 3000;

const indexFilePath = path.join(__dirname, "index.html");

express()
  .use((req, res) => res.sendFile(indexFilePath))
  .listen(port);
