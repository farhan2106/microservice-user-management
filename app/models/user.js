'use strict';

const Boom = require('boom');
const nodemailer = require('nodemailer');
const Q = require('q');
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
      throw Boom.unauthorized(errorCodes.E9);
    }

    return Models.User.create({
      username: username,
      email: email,
      password: encrypt(password),
      secret: genSecret()
    })
    .then(user => {
      user = user.toObject();
      delete user.password;
      //delete user.secret;
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
    user = user.toObject();
    delete user.password;
    delete user.secret;
    return user;
  }).catch(function(err) {
    return Boom.serverUnavailable(err);
  });
};

const emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

const sendEmail = function(user, data) {
  let deferred = Q.defer(),
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE, // use SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

  if (typeof user.toObject === 'function') {
    user = user.toObject();
  }
  delete user.password;
  delete user.secret;

  // should we mock it here? or in the unit test, we expect that email is not sent?
  if (process.mainModule.filename.indexOf('spec/run.js') > -1) {
    let nodemailerMock = require('nodemailer-mock');
    transporter = nodemailerMock.createTransport();
  }

  transporter.sendMail({
    from: 'admin@fgnet.tech',
    to: data.email,
    subject: data.title,
    html: data.message
  }, (err, info) => {
    if (err === null) {
      deferred.resolve(user);
    } else {
      deferred.reject(err);
    }
  });
  return deferred.promise;
};

const sendPasswordResetEmail = function(user, redirectUrl) {
  return sendEmail(user, {
    email: user.email,
    secret: user.secret,
    title: `${process.env.APP_NAME}: Reset your password`,
    message: `Please click on the following link to reset your password.<br />
    <a href="${redirectUrl}/${user.secret}">Reset Password</a>`
  });
};

const sendActivationEmail = function(user, redirectUrl) {
  return sendEmail(user, {
    email: user.email,
    secret: user.secret,
    title: `${process.env.APP_NAME}: Activate your account`,
    message: `Please click on the following link to activate your account.<br />
    <a href="${process.env.DOMAIN}/activate/${user.secret}/${redirectUrl}">Activate</a>`
  });
};

module.exports = {
  create: create,
  socialCreate: socialCreate,
  emailRegex: emailRegex,
  genSecret: genSecret,
  sendActivationEmail: sendActivationEmail,
  sendPasswordResetEmail: sendPasswordResetEmail
};
