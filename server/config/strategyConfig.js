'use strict';

/**
 * Configure Passport strategy for authenticating users
 */

const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const User = require('../models/User');


let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = process.env.JWT_SECRET;
jwtOptions.passReqToCallback = true;

let strategy = new JwtStrategy(jwtOptions, function (req, jwt_payload, next) {
  User.findOne({'_id': jwt_payload.id})
    .then(function (user) {
      if (!user) {
        next(null, false);
      } else {
        next(null, user);
      }
    })
    .catch((err) => {
      next(null, false, err);
    });
});

module.exports = strategy;

/*
 router.post('/api/admin', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }),auth.adminInterface); // Admin GUI

 // Member routes ================================================
 router.post('/api/members/create', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }),mmbr.create);

 router.post('/api/members/getOneById', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.getOneById);

 router.post('/api/members/getOneByEmail', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.getOneByEmail);

 router.post('/api/members/update', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.update);

 router.post('/api/members/remove', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.remove);

 router.post('/api/members/getAllAdmins', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.getAllAdmins);

 router.post('/api/members/getAllMembers', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.getAllMembers);

 router.post('/api/members/changePassword', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), mmbr.changePassword);

 // Homepage posts routes ========================================
 router.post('/api/posts/create', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), post.create);
 router.post('/api/posts/getOneById', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), post.getOneById);
 router.post('/api/posts/update', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), post.update);
 router.post('/api/posts/remove', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), post.remove);
 router.post('/api/posts/getAll', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), post.getAll);

 // Link routes ========================================
 router.post('/api/links/create', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), link.create);
 router.post('/api/links/getOneById', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), link.getOneById);
 router.post('/api/links/update', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), link.update);
 router.post('/api/links/remove', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), link.remove);

 // Event routes ========================================
 router.post('/api/events/create', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), event.create);
 router.post('/api/events/getOneById', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), event.getOneById);
 router.post('/api/events/update', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), event.update);
 router.post('/api/events/remove', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), event.remove);

 // Image routes =========================================
 router.post('/api/images/upload', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), image.create);
 router.post('/api/images/remove', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), image.removeOneById);
 router.post('/api/images/removeAllForEvent', passport.authenticate('jwt', {
 failureRedirect: '/login',
 session: true
 }), image.removeAllForEvent);
 */
