const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

describe('/resetPassword (Attempt)', function () {

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

  it("User not found.", (done) => {
    let options = {
      method: "POST",
      url: "/resetPassword",
      payload: {
        usernameOrEmail: 'testUsera'
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(404);
      done();
    });
  });

  it("serverUnavailable", (done) => {
    done();
  });

  it("Valid", (done) => {
    let options = {
      method: "POST",
      url: "/resetPassword",
      payload: {
        usernameOrEmail: fixtures.testUser.username
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      Models.User.update({
        username: fixtures.testUser.username
      }, {
        active: 1,
        secret: null
      }).then((user) => {
        done();
      });
    });
  });

});

describe('/resetPassword (Actual)', function () {

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

  it("Invalid secret.", (done) => {
    let options = {
      method: "POST",
      url: "/resetPassword",
      payload: {
        secret: 'aaaa',
        password: 'aaaaAAAA!3d'
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(404);
      done();
    });
  });

  it("Invalid parameters.", (done) => {
    let options = {
      method: "POST",
      url: "/resetPassword",
      payload: {
        secret: 'aaaa',
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(500);
      done();
    });
  });

  it("serverUnavailable", (done) => {
    done();
  });

  it("Valid", (done) => {
    let options = {
      method: "POST",
      url: "/resetPassword",
      payload: {
        usernameOrEmail: fixtures.testUser.username
      }
    };

    server.inject(options, function(response) {
      options = {
        method: "POST",
        url: "/resetPassword",
        payload: {
          secret: response.result.secret,
          password: fixtures.testUser.password
        }
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(200);
        Models.User.update({
          username: fixtures.testUser.username
        }, {
          active: 1,
          secret: null
        }).then((user) => {
          done();
        });
      });

    });
  });

});
