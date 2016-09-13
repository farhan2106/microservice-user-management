const Models = require('./../app/db').Models;
const encrypt = require('./../app/utils').encrypt;
const JSData = require('js-data');

Models.User.bypassCache = true;
Models.Blacklist.bypassCache = true;

let testUserId = null,
    testUser = {
      username: 'testUser',
      email: 'testUser@gmail.com',
      password: 'abcd!1234A',
      active: 1,
      secret: null
    },
    createUser = function () {
      return Models.User.create({
        username: testUser.username,
        email: testUser.email,
        password: encrypt(testUser.password),
        active: testUser.active,
        secret: testUser.secret,
      })
      .then(function (user) {
        testUserId = user.id;
        return user;
      }).catch(function (err) {
        console.log(err)
      });
    },
    delUser = function () {
      return Models.Blacklist.destroyAll().then(function () {
        return Models.User.destroy(testUserId)
        .catch(function (err) {
          console.log(err);
        });
      })
      .catch(function (err) {
        console.log(err);
      });
    };

// Delete test user if any
Models.User.findAll({
  where: {
    username: {
      '==': testUser.username
    }
  }
})
.then(function (user) {
  if (user.length > 0)
    Models.User.destroy(user[0].id);
})
.catch(function (err) {
  console.log(err);
});

module.exports = {
  testUser: testUser,
  createUser: createUser,
  delUser: delUser,
  Models: {
    User: Models.User,
    Blacklist: Models.Blacklist
  }
}
