const path = require("path");
const express = require("express");

const port = process.env.PORT || 3000;

const indexFilePath = path.join(process.cwd(), "index.html");

express()
  .use((req, res) => res.sendFile(indexFilePath))
  .listen(port);
