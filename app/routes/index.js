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
 * PUT: /activate/{secret}- to activate user
 * POST: /activate - resend activation email
 * POST: /verifyToken
 * POST: /resetPassword
 */
module.exports = [{
  method: 'POST',
  path: '/login',
  config: {
    auth: false,
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
          throw Boom.unauthorized(errorCodes.E1);
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
          throw Boom.unauthorized(errorCodes.E2);
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
          throw Boom.serverUnavailable(err);
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
    handler: (req, reply) => {
      let username = req.payload.username,
        email = req.payload.email,
        password = req.payload.password;

      UserModel.create(username, email, password)
      .then(user => {
        // delete user.secret; // secret is require for activation
        delete user.password;
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
    handler: (req, reply) => {
      let socialId = req.payload.socialId,
        socialSource = req.payload.socialSource,
        email = req.payload.email;

      UserModel.socialCreate(socialId, socialSource, email)
      .then(user => {
        // user = user.toObject();
        delete user.password;
        delete user.secret;
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
  method: 'POST',
  path: `/activate`,
  config: {
    auth: false,
    handler: (req, reply) => {
      let usernameOrEmail = req.payload.usernameOrEmail,
        User = req.Models.User;

      User.find({
        active: 0,
        $or: [{username: usernameOrEmail}, {email: usernameOrEmail}]
      })
      .then(users => {
        if (users.length > 0) {
          let user = users.shift();
          return user;
        }
        throw Boom.notFound(errorCodes.E1);
      })
      .then(user => {
        if (typeof user.toObject === 'function') {
          user = user.toObject();
        }
        delete user.password;
        reply(user);
      }).catch(err => {
        reply(err);
      });
    },
    validate: {
      payload: Joi.object({
        usernameOrEmail: Joi.string().required()
      })
    }
  }
}, {
  method: 'PUT',
  path: `/activate/{secret}`,
  config: {
    auth: false,
    handler: (req, reply) => {
      let secret = req.params.secret,
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
        throw Boom.notFound(errorCodes.E1);
      }).catch(err => {
        reply(err);
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
    handler: (req, reply) => {
      let token = req.headers.authorization,
        User = req.Models.User,
        Blacklist = req.Models.Blacklist;

      try {
        let decoded = Jwt.verify(token, process.env.SECRET);

        Blacklist.find({
          token: req.headers.authorization
        }).then(blacklist => {
          if (blacklist.length > 0) {
            throw Boom.unauthorized(errorCodes.E8);
          }
          return User.find({
            id: decoded.id
          });
        }).then(users => {
          if (users) {
            reply(decoded);
          } else {
            throw Boom.unauthorized(errorCodes.E1);
          }
        }).catch(err => {
          reply(err);
        });
      } catch (jwtErr) {
        reply(jwtErr);
      }
    }
  }
}, {
  method: 'POST',
  path: '/resetPassword',
  config: {
    auth: false,
    handler: (req, reply) => {
      let usernameOrEmail = req.payload.usernameOrEmail,
        secret = req.payload.secret,
        password = req.payload.password,
        password2 = req.payload.password2,
        User = req.Models.User;

      /**
       * When secret && password, it will really reset password
       * Otherwise, it will just create a secret to reset password
       */
      if (secret && password && password2) {
        if (password !== password2) {
          throw Boom.notFound(errorCodes.E11);
        }

        User.find({
          // active: 0,
          secret: secret
        })
        .then(function(users) {
          if (users.length === 0) {
            throw Boom.notFound(errorCodes.E1);
          }
          return users.shift();
        }).then(function(user) {
          return User.update({
            _id: user.id
          }, {
            // active: 1,
            password: encrypt(password),
            secret: null
          }).then(function(status) {
            reply(status);
          });
        }).catch(err => {
          reply(err);
        });
      } else if (usernameOrEmail) {
        let secret = UserModel.genSecret();
        User.find({
          $and: [
            // {active: 1},
            {$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]}
          ]
        })
        .then(function(users) {
          if (users.length === 0) {
            throw Boom.notFound(errorCodes.E1);
          }
          return users;
        }).then(function(users) {
          let user = users.shift();
          return User.update({
            _id: user.id
          }, {
            // active: 0,
            secret: secret
          }).then(function(status) {
            user.secret = secret;
            reply(user);
          }).catch(err => {
            reply(err);
          });
        }).catch(err => {
          reply(err);
        });
      } else {
        reply(Boom.badImplementation(errorCodes.E3));
      }
    },
    validate: {
      payload: Joi.object({
        usernameOrEmail: Joi.string(),
        secret: Joi.string(),
        password: Joi.string().regex(new RegExp(process.env.REGEX_PASSWORD)),
        password2: Joi.string().regex(new RegExp(process.env.REGEX_PASSWORD))
      })
    }
  }
}];
