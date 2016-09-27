const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

/**
 * POST: /register
 */
describe('/register', function () {

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
      url: "/register",
      payload: {
        username: fixtures.testUser.username,
        email: 'farhan_ghazali@yahoo.com',
        password: '12341234',
        redirectUrl: 'fakeUrl'
      }
    };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(401);
      expect(response.result.message).toContain('Username or email already exist.');
      done();
    });
  });

  it("Boom.serverUnavailable (user query)", (done) => {
    // expecting database to be down
    done();
  });

  it("Boom.serverUnavailable (user create)", (done) => {
    // expecting database to be down
    done();
  });

  it("Valid", (done) => {
    let email = 'farhan2106@yahoo.com',
        options = {
          method: "POST",
          url: "/register",
          payload: {
            username: 'farhan2106',
            email: email,
            password: '12341234',
            redirectUrl: 'fakeUrl'
          }
        };

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result.email).toBe(email);

      Models.User.find({
        email: email
      }).then((user) => {
        user = user.pop();
        Models.User.remove(user.id)
        .then(function () {
          done();
        });
      }).then((err) => {
        done();
      });
    });
  });

});

/**
 * POST: /socialRegister
 */
describe('/socialRegister', function () {
  let socialId = '123456789',
      socialSource = 'facebook',
      options = {
        method: "POST",
        url: "/socialRegister",
        payload: {
          socialId: socialId,
          socialSource: socialSource,
          email: 'someuser@google.com'
        }
      };

  it("Valid", (done) => {
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result.socialId).toBe(socialId);
      done();
    });
  });

  it("Valid, but already registered", (done) => {
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result.socialId).toBe(socialId);

      Models.User.find({
        socialId: socialId,
        socialSource: socialSource
      }).then((user) => {
        user = user.pop();
        Models.User.remove(user.id)
        .then(function () {
          done();
        });
      }).then((err) => {
        done();
      });
    });
  });

});
