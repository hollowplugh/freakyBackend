'use strict';

/**
 * Methods for emailing a user a new, auto-generated password
 */

const nodemailer = require('nodemailer');
const password = require('password');

exports.sendNewPassword = function(recipient) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS
    },
    debug: true
  }, {
    from: 'Förening API <webforening@gmail.com>',
  });

  let newPassword = createPassword();
  let message = {
    to: recipient.email,
    subject: 'Ditt nya freaky lösenord',
    text: 'Ditt nya lösenord är ' + newPassword
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log(error.message);
      return null;
    }
    transporter.close();
  });
  return newPassword;
};

function createPassword() {
  let generatedPass = password(3);
  let passAry = generatedPass.split(" ");
  let newPass = '';
  let newWord = '';
  passAry.forEach( function(word){
    newWord = word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase();
    newPass = newPass + newWord;
  });
  return newPass;
}