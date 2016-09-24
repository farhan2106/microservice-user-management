'use strict';

const Boom = require('boom');
const encrypt = require("./../utils").encrypt;
const errorCodes = require("./../error_codes");

const genSecret = function() {
  return Math.random().toString(36).substring(7);
};

const create = function(username, email, password) {
  let Models = require('./../db').Models;

  return Models.User.find({
    $or: [{username: username}, {email: email}]
  })
  .then(users => {
    if (users.length > 0) {
      return Boom.unauthorized(errorCodes.E9);
    }

    return Models.User.create({
      username: username,
      email: email,
      password: encrypt(password),
      secret: genSecret()
    })
    .then(user => {
      user.password = '';
      return user;
    }).catch(function(err) {
      return Boom.serverUnavailable(err);
    });
  }).catch(function(err) {
    return err;
  });
};

const socialCreate = function(socialId, socialSource, email) {
  let Models = require('./../db').Models;

  return Models.User.find({
    socialId: socialId,
    socialSource: socialSource
  })
  .then(users => {
    if (users.length > 0) {
      return users.shift();
    }
    // the secret in the password is important
    return Models.User.create({
      username: `${socialId}.${socialSource}`,
      password: encrypt(`${socialId}.${socialSource}.${process.env.SECRET}`),
      email: email,
      socialId: socialId,
      socialSource: socialSource,
      active: 1
    }).then(result => {
      return result;
    }).catch(function(err) {
      return Boom.serverUnavailable(err);
    });
  }).then(user => {
    user.password = '';
    return user;
  }).catch(function(err) {
    return Boom.serverUnavailable(err);
  });
};

const emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

module.exports = {
  create: create,
  socialCreate: socialCreate,
  emailRegex: emailRegex,
  genSecret: genSecret
};
