let tableName = 'users';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, function(table) {
      table.increments();
      table.string('username').unique().notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.boolean('active').notNullable().defaultTo(0);
      table.string('secret');
      table.string('socialId').defaultTo(null);
      table.string('socialSource').defaultTo(null);
      table.timestamps(true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName)
  ]);
};
