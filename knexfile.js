'use strict';

require('dotenv').config();

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

const dbConf = {
  client: process.env.DB_DRIVER,
  connection: dbConn,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'migrations',
    directory: './database/migrations'
  },
  seeds: {
    directory: './database/seeds'
  },
  useNullAsDefault: true
};

module.exports = {

  development: dbConf,

  staging: dbConf,

  production: dbConf

};
