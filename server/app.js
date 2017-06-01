'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const path = require('path');
const schedule = require('node-schedule');
const passport = require('passport');
//const formidable = require('express-formidable');
const appStrategy = require('./config/strategyConfig');
const auth = require('./controllers/auth');
const app = express();

//global.env = process.env.NODE_ENV || 'development';

/**
 * Load Mongoose Models
 */
const User = require('./models/User');
require('./models/Upload');
require('./models/Token');

/**
 * Configure Passport authentication
 */
passport.use(appStrategy);
passport.serializeUser(function (user, done) {
  done(null, user._id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id).then(function (user) {
    done(null, user);
  });
});

/**
 * Middleware
 */
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Token, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token, Authorization');
  next();
});

/**
 * Initialize Passport
 */
app.use(passport.initialize());
app.use(require('./config/sessionStore').config);
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/**
 * Load Express routes
 */
let routes = require('./routes');
app.use('/', routes);
// End middleware =====================

/**
 * Clear out all the old tokens every 23 hours
 */
/*schedule.scheduleJob('23 * * *', async function () {
  await auth.deleteOldTokens();
});*/

module.exports = app;