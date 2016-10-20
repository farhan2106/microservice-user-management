'use strict'

const Mockgoose = require('mockgoose')
const Models = require('./../app/db').Models
const Mongoose = require('./../app/db').Mongoose
const encrypt = require('./../app/utils').encrypt

Mockgoose(Mongoose).then(function () {
  Mongoose.connect('mongodb://localhost/test', function (err) {
    // done(err);
    console.log(err)
  })
})

let testUserId = null
let testUser = {
  username: 'testUser',
  email: 'testUser@gmail.com',
  password: 'abcdabcda',
  active: 1,
  secret: null
}
let createUser = function () {
  return Models.User.create({
    username: testUser.username,
    email: testUser.email,
    password: encrypt(testUser.password),
    active: testUser.active,
    secret: testUser.secret
  })
  .then(function (user) {
    testUserId = user.id
    return user
  }).catch(function (err) {
    console.log(err)
  })
}
let delUser = function () {
  return Models.Blacklist.remove({}).then(function () {
    return Models.User.remove(testUserId)
      .catch(function (err) {
        console.log(err)
      })
  })
  .catch(function (err) {
    console.log(err)
  })
}

// Delete test user if any
Models.User.find({
  username: testUser.username
})
.then(function (users) {
  if (users.length > 0) {
    Models.User.remove(users[0].id)
  }
})
.catch(function (err) {
  console.log(err)
})

module.exports = {
  testUser: testUser,
  createUser: createUser,
  delUser: delUser,
  Models: {
    User: Models.User,
    Blacklist: Models.Blacklist
  }
}
