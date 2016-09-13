const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

/**
 * POST: /users - create
 */
let token = null;

describe('/users', function () {

  beforeEach(function (done) {
    fixtures.createUser()
    .then(function () {
      done();
    })
  });

  afterEach(function (done) {
    fixtures.delUser()
    .then(function () {
      done();
    })
  });

  it("Username or email already exist.", (done) => {
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
        method: "POST",
        url: "/users",
        payload: {
          username: fixtures.testUser.username,
          email: fixtures.testUser.email,
          password: fixtures.testUser.password
        },
        headers: {
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(401);
        expect(response.result.message).toContain('Username or email already exist.');
        done();
      });
    });
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
      let newFakeUser = fixtures.testUser;
      newFakeUser.username = 'a' + newFakeUser.username;
      newFakeUser.email = 'a' + newFakeUser.email;
      newFakeUser.password = 'a' + newFakeUser.password;

      options = {
        method: "POST",
        url: "/users",
        payload: {
          username: newFakeUser.username,
          email: newFakeUser.email,
          password: newFakeUser.password
        },
        headers: {
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(200);
        Models.User.destroy(response.result.id)
        .then(function () {
          done();
        });
      });
    });
  });

});
