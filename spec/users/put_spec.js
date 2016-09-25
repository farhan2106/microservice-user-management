const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

/**
 * PUT: /users/{data} - update, where data is id
 */
let userId = null;

describe('PUT /users', function () {

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

  it("Invalid username string.", (done) => {
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
        method: "PUT",
        url: "/users/" + userId,
        payload: {
          username: '__aaaaa',
          email: fixtures.testUser.email,
          password: fixtures.testUser.password,
          active: 1
        },
        headers: {
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(422);
        expect(response.result.message).toContain('Invalid username string.');
        done();
      });
    });
  });

  it("Invalid password string.", (done) => {
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
        method: "PUT",
        url: "/users/" + userId,
        payload: {
          username: fixtures.testUser.username,
          email: fixtures.testUser.email,
          password: 'aaaa',
          active: 1
        },
        headers: {
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(422);
        expect(response.result.message).toContain('Invalid password string.');
        done();
      });
    });
  });

  it("Invalid email string.", (done) => {
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
        method: "PUT",
        url: "/users/" + userId,
        payload: {
          username: fixtures.testUser.username,
          email: 'aasdasdasd@asdasd',
          password: fixtures.testUser.password,
          active: 1
        },
        headers: {
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(422);
        expect(response.result.message).toContain('Invalid email string.');
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
      options = {
        method: "PUT",
        url: "/users/" + userId,
        payload: {
          username: 'a' + fixtures.testUser.username,
          email: 'a' + fixtures.testUser.email,
          password: 'a' + fixtures.testUser.password,
          active: 1
        },
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
