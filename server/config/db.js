'use strict';

/**
 * Set up Mongo DB
 */

const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

let _db;
//const uri = process.env.MONGO_PATH_LOCAL;
const uri = process.env.MONGO_PATH;

/**
 * Mongo Connection options
 */
const options = {
  server: {reconnectTries: Number.MAX_VALUE, keepAlive: 300000, connectTimeoutMS: 30000},
  replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
};

module.exports = {
  connect() {
    mongoose.connect(uri, options, (err, db) => {
      if(err) {
        console.log("Error connecting to Mongo - check mongod connection");
        Promise.reject(err);
        process.exit(1);
      }
      console.log('Database connected');
      _db = db;
    });
  },
  sessions(){
    return _db.collection('sessions');
  },
  members(){
    return _db.collection('users');
  },
  tokens(){
    return _db.collection('tokens');
  },
  uploads(){
    return _db.collection('uploads');
  }
};
