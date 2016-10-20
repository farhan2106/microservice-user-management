'use strict'

const Joi = require('joi')
const Boom = require('boom')
const errorCodes = require('./../../app/error_codes')
const encrypt = require('./../utils').encrypt
const UserModel = require('./../models/user')
const Id = require('valid-objectid')

/**
 * POST: /users - create
 * GET: /users/{data} - read, where data is id, username or email
 * PUT: /users/{data} - update, where data is id
 * DELETE: /users/{data} - delete, where data is id
 */
let root = require('path').basename(__filename).split('.').shift()
module.exports = [{
  method: 'POST',
  path: `/${root}`,
  config: {
    handler: (req, reply) => {
      let username = req.payload.username
      let email = req.payload.email
      let password = req.payload.password

      UserModel.create(username, email, password)
      .then(user => {
        // user = user.toObject();
        delete user.password
        delete user.secret
        reply(user)
      })
      .catch(err => {
        reply(err)
      })
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
    handler: (req, reply) => {
      let idUsernameEmail = decodeURIComponent(req.params.finder)
      let finder = [{username: idUsernameEmail}, {email: idUsernameEmail}]
      let User = req.Models.User

      if (Id.isValid(idUsernameEmail)) {
        finder.push({_id: idUsernameEmail})
      }

      User.find({
        $or: finder
      })
      .then(users => {
        if (users.length > 0) {
          let user = users.shift()
          user = user.toObject()
          delete user.password
          delete user.secret
          reply(user)
        } else {
          throw Boom.notFound(errorCodes.E1)
        }
      }).catch(err => {
        reply(err)
      })
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
    handler: (req, reply) => {
      let id = encodeURIComponent(req.params.id)
      let username = req.payload.username
      let email = req.payload.email
      let password = req.payload.password
      let active = parseInt(req.payload.active, 10)
      let User = req.Models.User

      User.find({
        _id: id
      })
      .then(user => {
        if (username &&
            !new RegExp(process.env.REGEX_USERNAME).test(username)) {
          throw Boom.badData(errorCodes.E4)
        }
        if (password &&
            !new RegExp(process.env.REGEX_PASSWORD).test(password)) {
          throw Boom.badData(errorCodes.E5)
        }
        if (email && !UserModel.emailRegex.test(email)) {
          throw Boom.badData(errorCodes.E6)
        }
        Joi.validate({
          active: active
        }, {
          active: Joi.number().min(0).max(1)
        }, (err, value) => {
          if (err) {
            throw Boom.badData(err)
          }
        })

        let data = {}
        if (username) data.username = username
        if (password) data.password = encrypt(password)
        if (email) data.email = email
        data.active = active
        return User.update({
          _id: id
        }, data)
      }).then(status => {
        reply(status)
      }).catch(err => {
        reply(err)
      })
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
    handler: (req, reply) => {
      let id = req.params.id
      let User = req.Models.User

      User.update({
        _id: id
      }, {
        active: 0
      }).then(status => {
        reply(status)
      }).catch(err => {
        reply(err)
      })
    },
    validate: {
      params: Joi.object({
        id: Joi.required()
      })
    }
  }
}]
