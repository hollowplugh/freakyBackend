'use strict';

let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  hash: {
    type: String,
    trim: true,
    default: ''
  }
});

UserSchema.methods = {
  setPassword: function (unhashed) {
    let salt = bcrypt.genSaltSync(10);
    this.hash = bcrypt.hashSync(unhashed, salt);
  },
  validatePassword: function (unhashed) {
    return bcrypt.compareSync(unhashed, this.hash);
  }
};

UserSchema.statics = {
  encryptPassword: function (unhashed) {
    if (!unhashed) {
      return '';
    }
    let salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(unhashed, salt);
  }
};

module.exports = mongoose.model('User', UserSchema);