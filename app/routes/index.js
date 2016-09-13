'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const encrypt = require("./../../app/utils").encrypt;
const UserModel = require("./../models/user");

/**
 * POST: /login
 * POST: /logout
 * POST: /register
 * POST: /socialRegister
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

      User.findAll({
        where: {
          active: {
            '==': 1
          },
          username: {
            '==': usernameOrEmail
          },
          email: {
            '|==': usernameOrEmail
          }
        }
      })
      .then(function(user) {
        if (user.length === 0) {
          reply(Boom.unauthorized('User not found.'));
        }
        return user;
      })
      .then(function(user) {
        user = user.pop();
        if (Bcrypt.compareSync(password, user.password)) {
          delete user.password;
          let token = Jwt.sign(user, process.env.SECRET, {
            expiresIn: expiresIn,
            issuer: issuer
            // audience
            // subject
          });
          reply(token);
        } else {
          reply(Boom.unauthorized('Invalid password.'));
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
      UserModel.create(req, reply);
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
      UserModel.socialCreate(req, reply);
    },
    validate: {
      payload: Joi.object({
        socialId: Joi.string().required(),
        socialSource: Joi.string().required()
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

      User.findAll({
        where: {
          secret: {
            '==': secret
          }
        }
      })
      .then(user => {
        if (user.length > 0) {
          user = user.shift();
          return User.update(user.id, {
            active: 1,
            secret: null
          });
        }
        reply(Boom.notFound('User not found.'));
      }).then(user => {
        delete user.password;
        reply(user);
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
    cors: true,
    handler: (req, reply) => {
      let token = req.headers.authorization;

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

      if (secret && password) {
        User.findAll({
          where: {
            active: {
              '==': 0
            },
            secret: {
              '==': secret
            }
          }
        })
        .then(function(user) {
          if (user.length === 0) {
            reply(Boom.notFound('User not found.'));
          }
          return user;
        }).then(function(user) {
          user = user.shift();
          return User.update(user.id, {
            active: 1,
            password: encrypt(password),
            secret: null
          });
        }).then(function(user) {
          delete user.password;
          reply(user);
        }).catch(err => {
          reply(Boom.serverUnavailable(err));
        });
      } else if (usernameOrEmail) {
        User.findAll({
          where: {
            active: {
              '==': 1
            },
            username: {
              '==': usernameOrEmail
            },
            email: {
              '|==': usernameOrEmail
            }
          }
        })
        .then(function(user) {
          if (user.length === 0) {
            reply(Boom.notFound('User not found.'));
          }
          return user;
        }).then(function(user) {
          user = user.shift();
          return User.update(user.id, {
            active: 0,
            secret: UserModel.genSecret()
          });
        }).then(function(user) {
          delete user.password;
          reply(user);
        }).catch(err => {
          reply(Boom.serverUnavailable(err));
        });
      } else {
        reply(Boom.badImplementation('Invalid parameters.'));
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
