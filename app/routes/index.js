'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const errorCodes = require("./../../app/error_codes");
const encrypt = require("./../../app/utils").encrypt;
const UserModel = require("./../models/user");

/**
 * POST: /login
 * POST: /logout
 * POST: /register
 * POST: /socialRegister -  can also be used to do social login
 * GET: /activate/{secret} - to activate user
 * POST: /verifyToken
 * POST: /resetPassword
 */
module.exports = [{
  method: 'POST',
  path: '/login',
  config: {
    auth: false,
    cors: true,
    handler: (req, reply) => {
      let usernameOrEmail = req.payload.usernameOrEmail,
        password = req.payload.password,
        issuer = req.payload.issuer,
        expiresIn = req.payload.expiresIn,
        User = req.Models.User;

      User.find({
        $and: [
          {socialId: null, socialSource: null, active: 1},
          {$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]}
        ]
      })
      .then(users => {
        if (users.length === 0) {
          reply(Boom.unauthorized(errorCodes['E1']));
        }
        return users;
      })
      .then(users => {
        let user = users.pop();
        if (Bcrypt.compareSync(password, user.password)) {
          delete user._doc.password;
          delete user._doc.__v;
          let token = Jwt.sign(user._doc, process.env.SECRET, {
            expiresIn: expiresIn,
            issuer: issuer
            // audience
            // subject
          });
          reply(token);
        } else {
          reply(Boom.unauthorized(errorCodes['E2']));
        }
      }).catch(err => {
        reply(err);
      });
    },
    validate: {
      payload: Joi.object({
        usernameOrEmail: Joi.string().required(),
        password: Joi.string().required(),
        expiresIn: Joi.string().required(),
        issuer: Joi.string().required()
      })
    }
  }
}, {
  method: 'POST',
  path: '/logout',
  config: {
    cors: true,
    handler: (req, reply) => {
      let token = req.headers.authorization,
        Blacklist = req.Models.Blacklist;

      try {
        let decoded = Jwt.verify(token, process.env.SECRET);
        Blacklist.create({
          token: token,
          iss: decoded.iss,
          iat: decoded.iat,
          exp: decoded.exp
        })
        .then(blacklist => {
          reply('Logged out.');
        }).catch(function(err) {
          reply(Boom.serverUnavailable(err));
        });
      } catch (jwtErr) {
        reply(Boom.unauthorized(jwtErr));
      }
    }
  }
}, {
  method: 'POST',
  path: `/register`,
  config: {
    auth: false,
    cors: true,
    handler: (req, reply) => {
      let username = req.payload.username,
        email = req.payload.email,
        password = req.payload.password;

      UserModel.create(username, email, password)
      .then(user => {
        reply(user);
      })
      .catch(err => {
        reply(err);
      });
    },
    validate: {
      payload: Joi.object({
        username: Joi.string().regex(new RegExp(process.env.REGEX_USERNAME)),
        email: Joi.string().regex(UserModel.emailRegex),
        password: Joi.string().regex(new RegExp(process.env.REGEX_PASSWORD))
      })
    }
  }
}, {
  method: 'POST',
  path: `/socialRegister`,
  config: {
    auth: false,
    cors: true,
    handler: (req, reply) => {
      let socialId = req.payload.socialId,
        socialSource = req.payload.socialSource,
        email = req.payload.email

      UserModel.socialCreate(socialId, socialSource, email)
      .then(user => {
        reply(user);
      })
      .catch(err => {
        reply(err);
      });
    },
    validate: {
      payload: Joi.object({
        socialId: Joi.string().required(),
        socialSource: Joi.string().required(),
        email: Joi.string().regex(UserModel.emailRegex)
      })
    }
  }
}, {
  method: 'GET',
  path: `/activate/{secret}`,
  config: {
    auth: false,
    cors: true,
    handler: (req, reply) => {
      let secret = encodeURIComponent(req.params.secret),
        User = req.Models.User;

      User.find({
        secret: secret,
        active: 0
      })
      .then(users => {
        if (users.length > 0) {
          let user = users.shift();
          return User.update({
            _id: user._id
          }, {
            active: 1,
            secret: null
          }).then(status => {
            reply(status);
          });
        }
        reply(Boom.notFound(errorCodes['E1']));
      }).catch(err => {
        reply(Boom.serverUnavailable(err));
      });
    },
    validate: {
      params: Joi.object({
        secret: Joi.string().required()
      })
    }
  }
}, {
  method: 'POST',
  path: '/verifyToken',
  config: {
    auth: false,
    cors: true,
    handler: (req, reply) => {
      let token = req.headers.authorization;

      // @todo: if token is in blacklist, then token is invalid. throw error
      try {
        let decoded = Jwt.verify(token, process.env.SECRET);
        reply(decoded);
      } catch (jwtErr) {
        reply(Boom.unauthorized(jwtErr));
      }
    }
  }
}, {
  method: 'POST',
  path: '/resetPassword',
  config: {
    auth: false,
    cors: true,
    handler: (req, reply) => {
      let usernameOrEmail = req.payload.usernameOrEmail,
        secret = req.payload.secret,
        password = req.payload.password,
        User = req.Models.User;

      /**
       * When secret && password, it will really reset password
       * Otherwise, it will just create a secret to reset password
       */
      if (secret && password) {
        User.find({
          active: 0,
          secret: secret
        })
        .then(function(users) {
          if (users.length === 0) {
            reply(Boom.notFound(errorCodes['E1']));
          }
          return users.shift();
        }).then(function(user) {
          return User.update({
            _id: user.id
          }, {
            active: 1,
            password: encrypt(password),
            secret: null
          }).then(function(status) {
            reply(status);
          });
        }).catch(err => {
          reply(Boom.serverUnavailable(err));
        });
      } else if (usernameOrEmail) {
        let secret = UserModel.genSecret();
        User.find({
          $and: [
            {active: 1},
            {$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]}
          ]
        })
        .then(function(users) {
          if (users.length === 0) {
            reply(Boom.notFound(errorCodes['E1']));
          }
          return users;
        }).then(function(users) {
          let user = users.shift();
          return User.update({
            _id: user.id
          }, {
            active: 0,
            secret: secret
          }).then(function(status) {
            status.secret = secret;
            reply(status);
          });
        }).catch(err => {
          reply(Boom.serverUnavailable(err));
        });
      } else {
        reply(Boom.badImplementation(errorCodes['E3']));
      }
    },
    validate: {
      payload: Joi.object({
        usernameOrEmail: Joi.string(),
        secret: Joi.string(),
        password: Joi.string().regex(new RegExp(process.env.REGEX_PASSWORD))
      })
    }
  }
}];
