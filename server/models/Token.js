'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment');

let TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  expires: {
    type: Date,
    default: moment().add(1, 'days')
  },
  assignedTo: {
    type: String,
    trim: true,
    default: ''
  }
});

module.exports = mongoose.model('Token', TokenSchema);