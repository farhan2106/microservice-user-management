'use strict';

const UserModel = require('./models/user');
const Mongoose = require('mongoose');
Mongoose.Promise = global.Promise;

if (process.argv[1].indexOf('spec/run.js') === -1) {
  Mongoose.connect(process.env.DB);
}

// init schema
const userSchema = Mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true },
    validate: {
      validator: function(v) {
        let r = new RegExp(process.env.REGEX_USERNAME);
        return r.test(v);
      },
      message: '{VALUE} is not a valid username.'
    },
  },
  email: {
    type: String,
    required: true,
    index: { unique: true },
    validate: {
      validator: function(v) {
        let r = new RegExp(UserModel.emailRegex);
        return r.test(v);
      },
      message: '{VALUE} is not a valid email.'
    },
  },
  password: {
    type: String,
    required: true
    /*
    // This regex is between client and web server. Not between web server and mongo.
    validate: {
      validator: function(v) {
        let r = new RegExp(process.env.REGEX_PASSWORD);
        return r.test(v);
      },
      message: '{VALUE} is not a valid password.'
    },*/
  },
  active: {
    type: Number,
    default: 0
  },
  secret: {
    type: String,
    default: null
  },
  socialId: {
    type: String,
    default: null
  },
  socialSource: {
    type: String,
    default: null
  },
  createdAt: {
    type: Number,
    default: Date.now()
  },
  updatedAt: {
    type: Number,
    default: Date.now()
  }
});
const blacklistSchema = Mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  iss: {
    type: String,
    required: true,
  },
  iat: {
    type: Number,
    required: true,
  },
  exp: {
    type: Number,
    required: true,
  }
});

// init models
let User = Mongoose.model('User', userSchema),
  Blacklist = Mongoose.model('Blacklist', blacklistSchema);

// background service for db
let removeOldTokens = function() {
  let now = parseInt(Date.now().toString().substring(0, 10), 10);
  Blacklist.remove({ exp: { $lte: now } }, function (err) {
    if (err) {
      throw err;
    }
  });
};
setInterval(removeOldTokens, 86400); // 24h
removeOldTokens();

module.exports = {
  Models: {
    User: User,
    Blacklist: Blacklist
  },
  Mongoose: Mongoose
};
