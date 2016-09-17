'use strict';

const Boom = require('boom');
const encrypt = require("./../utils").encrypt;

const genSecret = function() {
  return Math.random().toString(36).substring(7);
};

const create = function(req, reply) {
  let username = req.payload.username,
    email = req.payload.email,
    password = req.payload.password,
    User = req.Models.User;

  return User.find({
    $or: [{username: username}, {email: password}]
  })
  .then(users => {
    if (users.length > 0) {
      reply(Boom.unauthorized('Username or email already exist.'));
    } else {
      User.create({
        username: username,
        email: email,
        password: encrypt(password),
        secret: genSecret()
      })
      .then(user => {
        user.password = '';
        reply(user);
      }).catch(function(err) {
        reply(Boom.serverUnavailable(err));
      });
    }
  }).catch(function(err) {
    reply(err);
  });
};

const socialCreate = function(req, reply) {
  let socialId = req.payload.socialId,
    socialSource = req.payload.socialSource,
    email = req.payload.email,
    User = req.Models.User;

  return User.find({
    socialId: socialId,
    socialSource: socialSource
  })
  .then(users => {
    if (users.length > 0) {
      return users.shift();
    }
    // the secret in the password is important
    return User.create({
      username: `${socialId}.${socialSource}`,
      password: encrypt(`${socialId}.${socialSource}.${process.env.SECRET}`),
      email: email,
      socialId: socialId,
      socialSource: socialSource,
      active: 1
    }).then(result => {
      return result;
    }).catch(function(err) {
      reply(Boom.serverUnavailable(err));
    });
  }).then(user => {
    user.password = '';
    reply(user);
  }).catch(function(err) {
    reply(Boom.serverUnavailable(err));
  });
};

const emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

module.exports = {
  create: create,
  socialCreate: socialCreate,
  emailRegex: emailRegex,
  genSecret: genSecret
};
