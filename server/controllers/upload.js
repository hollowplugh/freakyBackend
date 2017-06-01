'use strict';

/**
 * CRUD-functions for Uploads
 */

const Upload = require('../models/Upload');
//const Event = require('../models/Event');
const fs = require('fs');
const aws = require('./aws');
const ObjectId = require('mongoose').Types.ObjectId;
const utils = require('../config/utils');

const DB_ERR_MSG = 'Internal database error';
const AWS_BASE_URL = process.env.AWS_BASE_URL;

/**
 * Creates a new Upload
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.create = async function (req, res) {
  let uploaded = req.files; // Uploaded files are in the files field of the request.
  let fields = req.fields; // Other fields in the request
  if (!uploaded || !uploaded.file || !Object.keys(uploaded)) {
    return res.status(400).json({message: "Upload file(s) required"});
  }
  if (!fields || !fields.eventId) {
    return res.status(400).json({message: "EventId required"});
  }
  let eventId = fields.eventId;
  let event = await Event.findOne({'_id': eventId}, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    }
  });
  if (event.isNullOrUndefined) {
    console.log('No event');
    return res.status(400).json({message: "No event with ID " + eventId});
  }
  let files = uploaded.file;
  let savedUpload = null;
  let filetype;

  // If there is more than one file, iterate through and save them.
  // Files that are not uploads are passed over.
  let uploadCount = 0;
  if (Array.isArray(files)) {
    files.forEach(async function (file) {
      uploadCount = uploadCount + 1;
      try {
        savedUpload = await createNewUpload(file, fields.eventId);
        if (savedUpload.err) {
          return res.status(500).json({message: DB_ERR_MSG});
        }
        savedUpload = null;
      }catch(error){
        console.log('error: ' + error);
        return res.status(500).json({message: DB_ERR_MSG});
      }
    });
  } else {
    //Only one file has been uploaded. Save it.
    savedUpload = await createNewUpload(files, eventId);
    if (savedUpload.err) {
      return res.status(500).json({message: savedUpload.err});
    }
    uploadCount = 1;
  }
  return res.status(201).json({message: uploadCount + ' upload(s) saved.'});
};

exports.getById = async function (req, res) {
  let body = req.fields || null;
  if (!body && !body.id) {
    return res.status(400).json({message: 'Upload ID required.'});
  }
  let query = {"_id": body.id};
  let upload = await Upload.findOne(query).catch(err => {
    return res.status(500).json({message: err.message});
  });
  if(upload) {
    return res.status(200).json({file: upload});
  } else {
    return res.status(500).json({message: "Server error"});
  }
};

/**
 * Removes one upload with the given doc ID
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.delete = async function (req, res) {
  let body = req.fields || null;
  if (!body && !body.id) {
    return res.status(400).json({message: 'Upload ID required.'});
  }
  let query = {"_id": body.id};
  let upload = await Upload.findOne(query).catch(err => {
    return res.status(500).json({message: err.message});
  });
  let filename = body.id + upload.url.substring(upload.url.lastIndexOf('.'));
  let isSuccessful = aws.removeFromBucket(filename);
  if (!isSuccessful) {
    console.log("Unable to delete from bucket: " + filename);
  }
  await Upload.remove(query)
    .catch(err => {
      return res.status(500).json({message: err.message});
    });
  return res.status(200).json({message: 'Upload removed.'});
};

/**
 * Returns all existing Uploads
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.getAll = async function (req, res) {
  let allUploads = await Upload.find({})
    .catch(err => {
      console.log(err);
      return res.sendStatus(500).json({message: DB_ERR_MSG});
    });
  if (!allUploads || !allUploads.length > 0) {
    return res.status(200).json({});
  }
    return res.status(200).json({uploads: allUploads});
};

/**
 * Saves a new upload to the S3 bucket
 * @param file Binary file
 * @param eventId String
 * @returns {Promise}
 */
async function createNewUpload(file) {
  let newUploadDoc = new Upload();
  let savedUploadDoc = await newUploadDoc.save()
    .catch(err => {
      console.log(err);
      returnVal.err.message = 'Failed to create new upload.';
      return returnVal;
    });
  let uploadId = newUploadDoc._id;
  let filename = file.name;
  let fileExt = filename.substring(filename.lastIndexOf('.'));
  let newFilename = uploadId + fileExt;
  let returnVal = {};
  let isSuccessful = aws.saveToBucket(newFilename, file);
  if (!isSuccessful) {
    returnVal.err.message = 'Failed to save new upload to bucket.';
    return returnVal;
  }
  savedUploadDoc.originalName = filename;
  savedUploadDoc.dbName = newFilename;
  savedUploadDoc.url = AWS_BASE_URL + newFilename;

  await savedUploadDoc.save(function (err, savedUpload) {
    if (err) {
      returnVal.err.message = 'Unable to save upload to database';
      return returnVal;
    }
    returnVal.upload = savedUpload;
  });
  return returnVal;
}

