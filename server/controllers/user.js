'use strict';

/**
 * CRUD-methods for the User entity
 */

const User = require('../models/User');
const mailer = require('./mailer');
const DB_ERR_MSG = 'Internal database error';
const utils = require('../config/utils');

/**
 * Creates a new User
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.create = async function (req, res) {
  let body = req.fields || null;
  if (body) {
    let validation = validateUserRequest(body);
    if (validation && validation.errors) {
      return res.status(400).json({message: validation.errors});
    }
  }
  let query = {"email": body.email.toLowerCase()};
  let exists = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if (exists) {
    return res.status(400).json({message: 'There is already a user with the login ' + body.email});
  }
  let user = new User(body);
  if (user.isAdmin) {
    let newPassword = mailer.sendNewPassword(user);
    if (newPassword) {
      user.hash = User.encryptPassword(newPassword);
    } else {
      return res.status(500).json({message: 'Unable to create and/or send password to admin'});
    }
  }
  let newUser = await user.save()
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  console.log('User created: ' + newUser.email);
  newUser.hash = undefined;
  res.status(201).json({user: newUser});
};

/**
 * Returns an existing user with the given email address.
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.getOneByEmail = async function (req, res) {
  let body = req.fields || null;
  if (!body || !body.email) {
    return res.status(400).json({message: 'Email required'});
  }
  let query = {"email": body.email.toLowerCase()};
  let user = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if (!user) {
    return res.status(400).json({message: 'There is no user with login ' + body.email.toLowerCase});
  }
  user.hash = undefined;
  return res.status(200).json({user: user});
};

/**
 * Returns an existing user with the given doc ID
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.getById = async function (req, res) {
  let body = req.body || null;
  if (!body || !body.id) {
    return res.status(400).json({message: 'Email required.'});
  }
  let query = {"_id": body.id};
  let user = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if (!user) {
    return res.status(400).json({message: 'No document found'});
  }
  user.hash = undefined;
  return res.status(200).json({user: user});
};

/**
 * Updates an existing user with the given doc ID.
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.update = async function (req, res) {
  let body = req.body || null;
  if (!body || !body.id) {
    return res.status(400).json({message: 'User ID required'});
  }
  let validation = validateUserRequest(body);
  if (validation && validation.errors) {
    return res.status(400).json({message: validation.errors});
  }
  let query = {"_id": body.id};
  let user = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if (!user) {
    return res.status(400).json({message: 'No user found with ID ' + body.id});
  }
  user = updateUser(user, body);
  if(!user){
    return res.status(400).json({message: 'Unable to update user'});
  }
  var updated = await user.save()
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  user.hash = undefined;
  return res.status(200).json({user: updated});
};

/**
 * Removes an existing User with the given doc ID
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.delete = async function (req, res) {
  let body = req.body || null;
  if (!body || !body.id) {
    return res.status(400).json({message: 'User ID required'});
  }
  let query = {"_id": body.id};
  await User.remove(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  return res.status(200).json({message: 'User removed'});
};

/**
 * Returns all users
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.getAll = async function (req, res) {
  let users = await User.find({})
    .catch(err => {
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if(users && users.length && users.length > 0) {
    users.forEach(function (user) {
      user.hash = undefined;
    });
  }
  return res.status(200).json({users: users});
};

exports.setPassword = async function(req, res) {
  //utils.printObjectProperties(req);
  utils.printObjectProperties(req.body);
  let body = req.body;
  let pswd = body.password;
  let query = {"_id": body.id};
  let user = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if (!user) {
    return res.status(401).json({message: "No user found with ID: " + body.id});
  }
  user.setPassword(pswd);
  return res.status(200).json({message: "Password set"});
};

/**
 * Replaces an administrator's current password with a new, supplied password
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.changePassword = async function (req, res) {
  let body = req.body || null;
  if (!body || !body.email || !body.oldPassword || !body.newPassword) {
    return res.status(400).json({message: 'Email, old password and new password required'});
  }
  let email = body.email;
  let oldPassword = body.oldPassword;
  let newPassword = body.newPassword;
  let query = {'email': email, 'isAdmin': true};
  let user = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: DB_ERR_MSG});
    });
  if (!user) {
    return res.status(401).json({message: 'No admin with email ' + email});
  } else if (user) {
    if (!user.validatePassword(oldPassword)) {
      return res.status(401).json({message: 'Authentication failed.'});
    } else {
      user.setPassword(newPassword);
      await user.save()
        .catch(err => {
          console.log(err);
          return res.status(500).json({message: DB_ERR_MSG});
        });
      return res.status(200).json({message: 'Password changed.'});
    }
  }
};

/**
 * Validates body values for updating and creating a User
 * @param body Body field of an HttpRequest
 */
function validateUserRequest(body) {
  let message = '';
  if (!body.email) {
    message = message + 'Email is required. ';
  }
  if (!body.firstName) {
    message = message + 'First name is required. ';
  }
  if (!body.lastName) {
    message = message + 'Last name is required. ';
  }
  if (!body.isAdmin) {
    message = message + 'isAdmin is required. '
  }
  if (message) {
    //let re = /\./gi;
    //return {'errors': message.replace(re, '\r\n')}
    return {'errors': message}
  } else {
    return {}
  }
}

/**
 * Private function for updating a User
 * @param user User object
 * @param body Body field of an HttpRequest
 */
function updateUser(user, body) {
  user.firstName = body.firstName;
  user.lastName = body.lastName;
  user.email = body.email.toLowerCase();
  user.phone = body.phone || '';
  user.title = body.title || '';

  if (user.isAdmin === true && body.isAdmin === 'false') {
    user.isAdmin = false;
    user.hash = undefined;
  } else if (user.isAdmin === false && body.isAdmin === 'true') {
    user.isAdmin = true;
    let newPassword = mailer.sendNewPassword(user);
    if (newPassword) {
      user.hash = User.encryptPassword(newPassword);
    } else {
      return null;
    }
  }
  return user;
}