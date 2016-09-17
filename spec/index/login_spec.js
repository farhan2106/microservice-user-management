const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');

/**
 * POST: /login
 */
describe('/login', function () {

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

  it("Token has expired.", (done) => {
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
      let token = response.result;
      options = {
        method: "POST",
        url: "/logout",
        headers: {
          authorization: token
        }
      };

      server.inject(options, function(response) {
        options = {
          method: "POST",
          url: "/logout",
          headers: {
            authorization: token
          }
        };
        server.inject(options, function(response) {
          expect(response.statusCode).toBe(401);
          done();
        });
      });
    });
  });

  it("User not found.", (done) => {
    let options = {
      method: "POST",
      url: "/login",
      payload: {
        usernameOrEmail: fixtures.testUser.username + 'a',
        password: fixtures.testUser.password,
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(401);
      expect(response.result.message).toContain('User not found.');
      done();
    });
  });

  it("Invalid password.", (done) => {
    let options = {
      method: "POST",
      url: "/login",
      payload: {
        usernameOrEmail: fixtures.testUser.email,
        password: fixtures.testUser.password + 'a',
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(401);
      expect(response.result.message).toContain('Invalid password.');
      done();
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
      expect(response.statusCode).toBe(200);
      done();
    });
  });

});
