'use strict';

const JSData = require('js-data');
const DSSqlAdapter = require('js-data-sql');

const store = new JSData.DS();
const adapter = new DSSqlAdapter({
  client: process.env.DB_DRIVER,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
});
store.registerAdapter('sql', adapter, {default: true});

// init models
let User = store.defineResource('users'),
  Blacklist = store.defineResource('blacklisted_tokens');

// background service for db
let removeOldTokens = function() {
  let now = parseInt(Date.now().toString().substring(0, 10), 10),
    params = {
      where: {
        exp: {
          '<=': now
        }
      }
    };
  Blacklist.destroyAll(params);
};
setInterval(removeOldTokens, 86400); // 24h
removeOldTokens();

module.exports = {
  Models: {
    User: User,
    Blacklist: Blacklist
  }
};
