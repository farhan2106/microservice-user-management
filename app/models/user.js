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

  return User.findAll({
    where: {
      username: {
        '==': username
      },
      email: {
        '|==': email
      }
    }
  })
  .then(user => {
    if (user.length > 0) {
      reply(Boom.unauthorized('Username or email already exist.'));
    } else {
      User.create({
        username: username,
        email: email,
        password: encrypt(password),
        secret: genSecret()
      })
      .then(user => {
        delete user.password;
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
    User = req.Models.User;

  return User.findAll({
    where: {
      socialId: {
        '==': socialId
      },
      socialSource: {
        '==': socialSource
      }
    }
  })
  .then(user => {
    if (user.length > 0) {
      return user.shift();
    }
    return User.create({
      username: `${socialId}.${socialSource}`,
      email: socialId,
      socialId: socialId,
      socialSource: socialSource,
      active: 1
    }).catch(function(err) {
      reply(Boom.serverUnavailable(err));
    });
  }).then(user => {
    delete user.password;
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
