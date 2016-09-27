const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');

describe('/verifyToken', function () {

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

  it("Logged out token", (done) => {
    let options = {
      method: "POST",
      url: "/login",
      payload: {
        usernameOrEmail: fixtures.testUser.username,
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
          authorization: response.result
        }
      };

      server.inject(options, function(response) {
        options = {
          method: "POST",
          url: "/verifyToken",
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

  it("Valid", (done) => {
    let options = {
      method: "POST",
      url: "/login",
      payload: {
        usernameOrEmail: fixtures.testUser.username,
        password: fixtures.testUser.password,
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    };

    server.inject(options, function(response) {
      options = {
        method: "POST",
        url: "/verifyToken",
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
