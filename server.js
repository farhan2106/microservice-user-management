'use strict';

require('dotenv').config();
const Good = require('good');
const Hapi = require('hapi');
const Models = require('./app/db').Models;
const Boom = require('boom');

const server = new Hapi.Server({
  debug: {request: ['error']}
});
server.connection({port: 3000});

server.register([
  require('hapi-auth-jwt2'),
  {
    register: Good,
    options: {
      reporters: {
        console: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{
            response: '*',
            log: '*'
          }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  }
]);

server.auth.strategy('jwt', 'jwt', {
  key: process.env.SECRET,
  validateFunc: function(decoded, req, callback) {
    // invalid if decoded data doesn't belong to existing users
    // invalid if token in blacklisted

    Models.Blacklist.findAll({
      where: {
        token: {
          '==': req.headers.authorization
        }
      }
    }).then(blacklist => {
      if (blacklist.length > 0) {
        callback(Boom.unauthorized('Token has expired.'), false);
      }

      return Models.User.findAll({
        where: {
          id: {
            '==': decoded.id
          }
        }
      });
    }).then(user => {
      if (user.length > 0) {
        callback(null, true);
      } else {
        callback(Boom.unauthorized('User not found.'), false);
      }
    }).catch(err => {
      callback(err, false);
    });
  },
  verifyOptions: {algorithms: ['HS256']}
});

server.auth.default('jwt');

server.route(require('./app/routes/index.js'));
server.route(require('./app/routes/users.js'));

server.ext('onRequest', (req, reply) => {
  req.Models = Models;
  reply.continue();
});

module.exports = {
  server: server
};
