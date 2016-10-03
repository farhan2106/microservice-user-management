'use strict';

require('dotenv').config();
const server = require('./server.js').server;

server.start(err => {
  if (err) {
    throw err;
  }
  server.log('info', 'Server running at: ' + server.info.uri);
});
