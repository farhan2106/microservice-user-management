const Mockgoose = require('mockgoose');
const Models = require('./../app/db').Models;
const Mongoose = require('./../app/db').Mongoose;
const encrypt = require('./../app/utils').encrypt;

Mockgoose(Mongoose).then(function() {
  Mongoose.connect('mongodb://example.com/TestingDB', function(err) {
    //done(err);
  });
});

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
      return Models.Blacklist.remove({}).then(function () {
        return Models.User.remove(testUserId)
        .catch(function (err) {
          console.log(err);
        });
      })
      .catch(function (err) {
        console.log(err);
      });
    };

// Delete test user if any
Models.User.find({
  username: testUser.username
})
.then(function (users) {
  if (users.length > 0)
    Models.User.remove(users[0].id);
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
