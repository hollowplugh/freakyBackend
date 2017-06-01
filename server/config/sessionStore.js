'use strict';

/**
 * Express session-storage setup
 */

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const assert = require('assert');

//const MONGO_PATH = process.env.MONGO_PATH_LOCAL;
const MONGO_PATH = process.env.MONGO_PATH;
const SESSION_SECRET = process.env.SESSION_SECRET;

const store = new MongoDBStore(
  {
    uri: MONGO_PATH,
    collection: 'sessions'
  });

store.on('error', function (error) {
  console.log('Session error: ' + error);
  assert.ifError(error);
  assert.ok(false);
});

exports.config = session({
  secret: SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
  },
  store: store,
  resave: true,
  saveUninitialized: true
});