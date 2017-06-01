'use strict';

/**
 * API Express routes
 */

const express = require('express');
const passport = require('passport');
//const formidable = require('express-formidable');

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
router.post('/api/users/create', user.create);
router.post('/api/users/getById', user.getById);
router.post('/api/users/update', user.update);
router.post('/api/users/delete', user.delete);
router.post('/api/users/setPassword', user.setPassword);
router.get('/api/uploads/getAll', upload.getAll);
router.post('/api/uploads/doUpload', upload.create);
router.post('/api/uploads/getById', upload.getById);
router.post('/api/uploads/delete', upload.delete);

module.exports = router;

