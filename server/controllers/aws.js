'use strict';

/**
 * Methods for uploading or deleting binary files in AWS S3
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const BUCKET = process.env.BUCKETEER_BUCKET_NAME;

/**
 * Setup
 */
let s3 = new AWS.S3({
  signatureVersion: 'v4',
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

exports.saveToBucket = function (filename, file) {
  let readStream = fs.createReadStream(file.path);
  let result = true;
  const params = {
    Bucket: BUCKET,
    ACL: "public-read",
    Key: 'public/' + filename,
    Body: readStream,
    ContentType: file.type
  };
  s3.createBucket({Bucket: BUCKET}, function () {
    s3.putObject(params, function (err) {
      if (err) {
        console.log(err);
        return result = false
      }
    });
  });
  return result;
};


exports.removeFromBucket = function(filename) {
  let result = true;
  const params = {
    Bucket: BUCKET,
    Key: 'public/' +filename
  };
  s3.createBucket({Bucket: BUCKET}, function () {
    s3.deleteObject(params, function (err) {
      if (err) {
        console.log(err);
        result = false;
      }
    });
  });
  return result;
};
