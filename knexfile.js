'use strict';

require('dotenv').config();

let dbConf = {
  client: process.env.DB_DRIVER,
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  },
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
  }
};

module.exports = {

  development: dbConf,

  staging: dbConf,

  production: dbConf

};
