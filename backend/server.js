const path = require('path');
const express = require('express');

const port = process.env.PORT || 3000;

const INDEX = path.join(process.cwd(), 'frontend/index.html');

express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(port);
