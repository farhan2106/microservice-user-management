let tableName = 'blacklisted_tokens';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, function(table) {
      table.increments();
      table.text('token').notNullable();
      table.string('iss').notNullable();
      table.integer('iat').notNullable();
      table.integer('exp').notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName)
  ]);
};
