'use strict';

const Joi = require('joi');
const Boom = require('boom');
const encrypt = require("./../utils").encrypt;
const UserModel = require("./../models/user");

/**
 * POST: /users - create
 * GET: /users/{data} - read, where data is id, username or email
 * PUT: /users/{data} - update, where data is id
 * DELETE: /users/{data} - delete, where data is id
 */
let root = require('path').basename(__filename).split('.').shift();
module.exports = [{
  method: 'POST',
  path: `/${root}`,
  config: {
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
  method: 'GET',
  path: `/${root}/{finder}`,
  config: {
    cors: true,
    handler: (req, reply) => {
      let idUsernameEmail = decodeURIComponent(req.params.finder),
        User = req.Models.User;

      User.findAll({
        where: {
          id: {
            '==': idUsernameEmail
          },
          username: {
            '|==': idUsernameEmail
          },
          email: {
            '|==': idUsernameEmail
          }
        }
      })
      .then(user => {
        if (user.length > 0) {
          user = user.shift();
          delete user.password;
          reply(user);
        } else {
          throw Boom.notFound('User not found.');
        }
      }).catch(err => {
        reply(err);
      });
    },
    validate: {
      params: Joi.object({
        finder: Joi.required()
      })
    }
  }
}, {
  method: 'PUT',
  path: `/${root}/{id}`,
  config: {
    cors: true,
    handler: (req, reply) => {
      let id = encodeURIComponent(req.params.id),
        username = req.payload.username,
        email = req.payload.email,
        password = req.payload.password,
        active = parseInt(req.payload.active, 10),
        User = req.Models.User;

      User.findAll({
        where: {
          id: {
            '==': id
          }
        }
      })
      .then(user => {
        if (username &&
            !new RegExp(process.env.REGEX_USERNAME).test(username)) {
          throw Boom.badData('Invalid username string.');
        }
        if (password &&
            !new RegExp(process.env.REGEX_PASSWORD).test(password)) {
          throw Boom.badData('Invalid password string.');
        }
        if (email && !UserModel.emailRegex.test(email)) {
          throw Boom.badData('Invalid email string.');
        }
        Joi.validate({
          active: active
        }, {
          active: Joi.number().min(0).max(1)
        }, (err, value) => {
          if (err) {
            throw Boom.badData(err);
          }
        });

        let data = {};
        if (username) data.username = username;
        if (password) data.password = encrypt(password);
        if (email) data.email = email;
        data.active = active;
        return User.update(id, data);
      }).then(user => {
        delete user.password;
        reply(user);
      }).catch(err => {
        reply(err);
      });
    },
    validate: {
      params: Joi.object({
        id: Joi.required()
      }),
      payload: Joi.object({
        username: Joi.any(),
        email: Joi.any(),
        password: Joi.any(),
        active: Joi.any()
      })
    }
  }
}, {
  method: 'DELETE',
  path: `/${root}/{id}`,
  config: {
    cors: true,
    handler: (req, reply) => {
      let id = req.params.id,
        User = req.Models.User;

      User.update(id, {
        active: 0
      }).then(user => {
        delete user.password;
        reply(user);
      }).catch(err => {
        reply(err);
      });
    },
    validate: {
      params: Joi.object({
        id: Joi.required()
      })
    }
  }
}];
