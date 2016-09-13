let encrypt = require("./../../app/utils").encrypt;

exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function() {
      return Promise.all([
        knex('users').insert({
          username: 'farhan_ghazali',
          email: 'farhan_ghazali@yahoo.com',
          password: encrypt('12341234'),
          active: 1
        })
      ]);
    });
};
