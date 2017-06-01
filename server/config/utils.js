'use strict';

/**
 * Misc functions useful for development
 */

exports.parseBoolean = function(strValue) {
  if(!strValue) return false;
  if(!strValue === 'undefined') return false;
  if(strValue.toLowerCase()=== 'true') return true;
  if(strValue.toLowerCase()=== 'false') return false;
  return false;
};

exports.errorMsg = function(req, res, next) {
  res.error = function(message, code) {
    return {
      'error': message,
      'code': code,
      'body': req.body,
      'token': req.headers['x-access-token']
    };
  };
  next();
};

exports.ping = function (req, res) {
  res.json({message: 'pong'});
};

exports.printObjectProperties = function(object) {
  if(object) {
    Object.keys(object).forEach(function (key) {
      let val = object[key];
      console.log("[" + key + "]");
      console.log(val);
    });
  } else {
    console.log("no object");
  }
};
