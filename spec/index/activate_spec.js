const server = require('./../../server.js').server;
const fixtures = require('./../fixtures');
const Models = fixtures.Models;

/**
 * GET: /activate
 */
describe('/activate', function () {

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

    Models.User.findAll({
      where: {
        email: {
          '==': fixtures.testUser.email
        }
      }
    }).then(function (user) {
      user = user.pop();
      return Models.User
        .update(user.id, { secret: 'aaa' })
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
        expect(response.result.email).toBe(user.email);
        expect(response.result.active).toBe(1);
        done();
      });
    }).catch(function (err) {
      expect(err).toEqual(null);
      done();
    });

  });

});
