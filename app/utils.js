'use strict'

const Bcrypt = require('bcrypt')

module.exports = {
  encrypt: text => {
    let salt = Bcrypt.genSaltSync(10)
    return Bcrypt.hashSync(text, salt)
  }
}
