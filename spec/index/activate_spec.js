const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

/**
 * GET: /activate
 */
describe('GET /activate', function () {

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
      method: "GET",
      url: "/activate/aaa",
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(404);
      expect(response.result.message).toContain('User not found');
      done();
    });
  });

  it("serverUnavailable", (done) => {
    // expecting database to be down
    done();
  });

  it("Valid", (done) => {

    Models.User.find({
      email: fixtures.testUser.email
    }).then(function (user) {
      user = user.pop();
      return Models.User
        .update({
          _id: user._id
        }, { secret: 'aaa', active: 0 })
        .catch(function (err) {
          expect(err).toEqual(null);
          done();
        });
    }).then(function (user) {
      let options = {
        method: "GET",
        url: "/activate/aaa",
      };

      server.inject(options, function(response) {
        expect(response.statusCode).toBe(200);
        done();
      });
    }).catch(function (err) {
      expect(err).toEqual(null);
      done();
    });

  });

});

/**
 * POST: /activate
 */
describe('POST /activate', function () {

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
      url: "/activate",
      payload: {
        usernameOrEmail: 'farhan2106@gmail.com'
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(404);
      expect(response.result.message).toContain('User not found');
      done();
    });
  });

  it("serverUnavailable", (done) => {
    // expecting database to be down
    done();
  });

  it("Valid", (done) => {
    Models.User.find({
      email: fixtures.testUser.email
    }).then(function (user) {
      user = user.pop();
      return Models.User
        .update({
          _id: user._id
        }, { secret: 'aaa', active: 0 })
        .catch(function (err) {
          expect(err).toEqual(null);
          done();
        });
    }).then(function (user) {
      let options = {
        method: "POST",
        url: "/activate",
        payload: {
          usernameOrEmail: fixtures.testUser.email
        }
      };

      server.inject(options, function(response) {
        // expecting that email is not sent
        expect(response.statusCode).toBe(503);
        done();
      });
    }).catch(function (err) {
      expect(err).toEqual(null);
      done();
    });
  });

});
