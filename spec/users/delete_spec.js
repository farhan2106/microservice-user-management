const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

/**
 * DELETE: /users/{data} - delete, where data is id (actually PUT)
 */
let userId = null;

describe('DELETE /users', function () {

  beforeEach(function (done) {
    fixtures.createUser()
    .then(function (user) {
      userId = user.id;
      done();
    })
  });

  afterEach(function (done) {
    fixtures.delUser()
    .then(function () {
      done();
    })
  });

  it("Valid", (done) => {
    let options = {
      method: "POST",
      url: "/login",
      payload: {
        usernameOrEmail: fixtures.testUser.email,
        password: fixtures.testUser.password,
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    };

    server.inject(options, function(response) {
      options = {
        method: "DELETE",
        url: "/users/" + userId,
        headers: {
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  });

});
