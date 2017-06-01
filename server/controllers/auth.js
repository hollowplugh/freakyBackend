'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');
const mailer = require('./mailer');
const utils = require('../config/utils');

const AUTH_ERROR_MSG = 'Authentication error.';
const AUTH_FAILED_MSG = 'Failed to authenticate';

/**
 * Logs out the current user.
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Logs in an admin user.
 * @param req HttpRequest
 * @param res HttpResponse
 */
exports.doLogin = async function (req, res) {
    //let fields = req.fields || null;
    let fields = req.body || null;
    if (!fields || !fields.email || !fields.password) {
      return res.status(400).json({message: AUTH_FAILED_MSG});
    }
    let email = fields.email;
    let password = fields.password;
    let user = await User.findOne({email: email, isAdmin: true})
      .catch(err => {
        console.log(err);
        return res.status(500).json({message: AUTH_ERROR_MSG});
      });
    if (!user) return res.status(401).json({message: AUTH_FAILED_MSG});
    if (!user.validatePassword(password)) return res.status(401).json({message: AUTH_FAILED_MSG});

    let userId = {id: user._id};
    let token = jwt.sign(userId, process.env.JWT_SECRET, {expiresIn: '24h'});
    let newTokenPost = new Token();
    newTokenPost.assignedTo = user.email.toLowerCase();
    newTokenPost.token = token;
    await newTokenPost.save()
      .catch(err => {
        console.log(err);
        return res.status(500).json({message: AUTH_ERROR_MSG})
      });
    return res.status(200).json({token: token});
};

/**
 * Erases expired Json web tokens
 * @returns {Promise.<void>}
 */
exports.deleteOldTokens = async function () {
  let query = {expires: {$lte: new Date()}};
  await Token.remove(query)
    .catch(err => {
      console.log('Could not erase old tokens: ' + err.message);
    });
};

/**
 *
 * @param req HttpRequest
 * @param res HttpResponse
 * @returns Json response with error or success code
 */
exports.forgotPassword = async function (req, res) {
  //let body = req.fields || null;
  let body = req.body || null;
  if (!body && !body.email) {
    return res.status(400).json({message : 'Email required.'});
  }
  let email = body.email;
  let query = {'email': email, 'isAdmin': true};
  let user = await User.findOne(query)
    .catch(err => {
      console.log(err);
      return res.status(500).json({message : AUTH_ERROR_MSG});
    });
  if (!user) {
    return res.status(401).json({message : 'No administrator access for user ' + email});
  } else if (user) {
    let newPassword = mailer.sendNewPassword(user);
    if (newPassword) {
      user.hash = User.encryptPassword(newPassword);
      await user.save()
        .catch(err => {
          console.log(err);
          return res.status(500).json({message: AUTH_ERROR_MSG});
        });
      return res.status(200).json({message : 'Your new password has been sent to ' + email});
    } else {
      return res.status(500).json({message: 'Unable to create and/or send password'});
    }
  }
};