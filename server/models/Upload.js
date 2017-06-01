'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UploadSchema = new Schema({
  originalName: {
    type: String,
    default: '',
    trim: true
  },
  dbName: {
    type: String,
    default: '',
    trim: true
  },
  url:{
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Upload', UploadSchema);
