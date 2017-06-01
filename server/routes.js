'use strict';

/**
 * API Express routes
 */

const express = require('express');
const passport = require('passport');
const formidable = require('express-formidable');

// Import controllers ================
const user = require('./controllers/user');
const auth = require('./controllers/auth');
const upload = require('./controllers/upload');

let router = express.Router();

// OPEN ROUTES =================================================
//router.get('/login', auth.login);
router.post('/login', auth.doLogin);
router.get('/logout', auth.logout);
router.post('/forgotPassword', auth.forgotPassword);
router.get('/api/users/getAll', user.getAll);
router.get('/api/users/create', user.create);
router.get('/api/users/getById', user.getById);
router.get('/api/users/update', user.update);
router.get('/api/users/delete', user.delete);
router.get('/api/uploads/getAll', upload.getAll);
router.get('/api/uploads/doUpload', formidable(), upload.create);
router.get('/api/uploads/getById', upload.getById);
router.get('/api/uploads/delete', upload.delete);

module.exports = router;

