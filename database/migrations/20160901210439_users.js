let tableName = 'users';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, function(table) {
      table.increments();
      table.string('username');
      table.string('email');
      table.string('password');
      table.boolean('active').notNullable().defaultTo(0);
      table.string('secret');
      table.string('socialId').defaultTo(null);
      table.string('socialSource').defaultTo(null);
      table.timestamps();
    }),
    knex.raw(`
      ALTER TABLE \`${tableName}\`
      CHANGE COLUMN \`username\` \`username\` VARCHAR(255) NOT NULL,
      CHANGE COLUMN \`email\` \`email\` VARCHAR(255) NOT NULL,
      CHANGE COLUMN \`password\` \`password\` VARCHAR(255) NOT NULL,
      CHANGE COLUMN \`created_at\` \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN \`updated_at\` \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `),
    knex.raw(`
      ALTER TABLE \`${tableName}\`
      ADD UNIQUE INDEX \`username_UNIQUE\` (\`username\` ASC),
      ADD UNIQUE INDEX \`email_UNIQUE\` (\`email\` ASC);
    `)
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName)
  ]);
};
