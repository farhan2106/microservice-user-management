/* global describe, it, beforeEach, afterEach, expect */

'use strict'

const server = require('./../../server.js').server
const fixtures = require('./../fixtures')

/**
 * GET: /users/{data} - read, where data is id, username or email
 */
let userId = null

describe('GET /users', function () {
  beforeEach(function (done) {
    fixtures.createUser()
    .then(function (user) {
      userId = user.id
      done()
    })
  })

  afterEach(function (done) {
    fixtures.delUser()
    .then(function () {
      done()
    })
  })

  it('Get by id', (done) => {
    let options = {
      method: 'POST',
      url: '/login',
      payload: {
        usernameOrEmail: fixtures.testUser.email,
        password: fixtures.testUser.password,
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    }

    server.inject(options, function (response) {
      options = {
        method: 'GET',
        url: '/users/' + encodeURIComponent(userId),
        headers: {
          authorization: response.result
        }
      }

      server.inject(options, function (response) {
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeDefined('id')
        done()
      })
    })
  })

  it('Get by username', (done) => {
    let options = {
      method: 'POST',
      url: '/login',
      payload: {
        usernameOrEmail: fixtures.testUser.email,
        password: fixtures.testUser.password,
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    }

    server.inject(options, function (response) {
      options = {
        method: 'GET',
        url: '/users/' + encodeURIComponent(fixtures.testUser.username),
        headers: {
          authorization: response.result
        }
      }

      server.inject(options, function (response) {
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeDefined('id')
        done()
      })
    })
  })

  it('Get by email', (done) => {
    let options = {
      method: 'POST',
      url: '/login',
      payload: {
        usernameOrEmail: fixtures.testUser.email,
        password: fixtures.testUser.password,
        issuer: 'appname.com',
        expiresIn: '24h'
      }
    }

    server.inject(options, function (response) {
      options = {
        method: 'GET',
        url: '/users/' + encodeURIComponent(fixtures.testUser.email),
        headers: {
          authorization: response.result
        }
      }

      server.inject(options, function (response) {
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeDefined('id')
        done()
      })
    })
  })
})
