'use strict';

const JSData = require('js-data');
const DSSqlAdapter = require('js-data-sql');

let dbConn = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};

if (process.env.DB_DRIVER === 'sqlite3') {
  dbConn = {
    filename: process.env.DB_NAME
  };
}

let jsDataOpts = {
  client: process.env.DB_DRIVER,
  connection: dbConn
}
if (process.env.DB_DRIVER === 'sqlite3') {
  jsDataOpts.useNullAsDefault = true;
}

const store = new JSData.DS();
const adapter = new DSSqlAdapter(jsDataOpts);
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
