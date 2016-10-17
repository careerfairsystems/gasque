'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  Reservation = mongoose.model('Reservation'),
  Banquet = mongoose.model('Banquet'),
  Mailtemplate = mongoose.model('Mailtemplate'),
  nodemailer = require('nodemailer'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  app = require(path.resolve('./server')).app,
  config = require(path.resolve('./config/config.js')),
  _ = require('lodash');
  
// Create smtpTransport for mailing.
var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
  * Send mail to offer a spot for a reservation
  */
exports.sendTemplateEmail = function (mailtemplateId, reservationId, res, doneMail, specifikContent){

  Mailtemplate.findOne({ _id: new ObjectId(mailtemplateId) }, mailtemplateFound); 

  function mailtemplateFound(err, mailtemplate){
    if(err){
      return doneMail({ error: true, message: 'Mailtemplate not found. Failure sending email: ' + err });
    }
    
    // Get variables    
    var template = path.resolve('modules/mailtemplates/server/templates/email');
    var content = mailtemplate.content || '';
    var subject = mailtemplate.subject || '';
    var contact = mailtemplate.contact || '';

    Reservation.findOne({ _id: new ObjectId(reservationId) }, reservationFound);
    function reservationFound(err, reservation){
      if(err || !reservation){
        return doneMail({ error: true, message: 'Reservation not found. Failure sending email: ' + err });
      }

      if (typeof specifikContent === 'function') { 
        content += specifikContent(reservation);
      }

      sendMail(reservation, template, content, subject, contact, done, res);
      function done(err) {
        var success = err === null;
        if(success){
          return doneMail({ error: false, message: 'Mail succeessfully sent' });
        } else {
          return doneMail({ error: true, message: 'Failure sending email: ' + err });
        }
      }
    }
  }
};

/**
  * Send mail to offer a spot for a reservation
  */
exports.offerSpot = function (reservations, arkadevent, res){
  var template = path.resolve('modules/reservations/server/templates/offerseat');
  var content = 'Du har fått en plats ett av våra event, klicka på länken för att bekräfta eller tacka nej.\n\n' + config.host + '/reservations/offer/' + arkadevent._id.toString();
  var contact = 'event.arkad@box.tlth.se';
  var subject = 'En plats har öppnat sig! / A seat is available!';
  
  var count = reservations.length;
  var successfull = true;
  reservations.forEach(sendOfferEmail);
  function sendOfferEmail(r){
    sendMail(r, template, content, subject, contact, done, res);
    function done(err) {
      if(err){
        successfull = false;
      }
      if(count <= 0){
        if (!err && successfull) {
          return true;
        } else {
          return false;
        }
      }
      count--;
    }
  }
};

/**
  * Send thankyou mail for reservation
  */
exports.thankyoumail = function (reservationId, doneMail, res) {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return doneMail({ error: true, message: 'Reservation is invalid' });
  }
  Reservation.findById(reservationId).populate('user', 'displayName').exec(function (err, reservation) {
    if (err) {
      return doneMail({ error: true, message: 'Error when retrieveng reservation: ' + err });
    } else if (!reservation) {
      return doneMail({ error: true, message: 'No Reservation with that identifier has been found' });
    }
    var template = path.resolve('modules/reservations/server/templates/mailthankyou');
    var content = 'Du har nu bokat en plats på ett event\n\n Om detta inte stämmer eller om vi har fått in fel uppgifter, hör av dig snarast. ';
    var contact = 'banquet.arkad@box.tlth.se';
    var subject = 'Tack för ansökan!';
    sendMail(reservation, template, content, subject, contact, done, res);
    function done(err) {
      if (!err) {
        return doneMail({ error: false, message: 'An email has been sent to the provided email with further instructions.' });
      } else {
        return doneMail({ error: false, message: 'Failure sending email: ' + err });
      }
    }
  });
};


/**
  * Send confirmation mail to reservation
  */
exports.confirmationMail = function (reservationId, doneConfirmation, res) {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return doneConfirmation({ error: true, message: 'Reservation is invalid' });
  }
  Reservation.findById(reservationId).populate('user', 'displayName').exec(function (err, reservation) {
    if (err) {
      return doneConfirmation({ error: true, message: 'Error when retrieveng reservation: ' + err });
    } else if (!reservation) {
      return doneConfirmation({ error: true, message: 'No Reservation with that identifier has been found' });
    }
    var template = path.resolve('modules/reservations/server/templates/mailconfirmation');
    var content = 'Du har nu bokat en plats på ett event\n\n Om detta inte stämmer eller om vi har fått in fel uppgifter, hör av dig snarast. ';
    var contact = 'event.arkad@box.tlth.se';
    var subject = 'Bekräftelse Event anmälan / Confirmation Event booking';
    sendMail(reservation, template, content, subject, contact, done, res);
    function done(err) {
      if (!err) {
        return doneConfirmation({ error: false, message: 'An email has been sent to the provided email with further instructions.' });
      } else {
        return doneConfirmation({ error: false, message: 'Failure sending email: ' + err });
      }
    }
  });
};


/**
  * A generic method for sending mail to the student of a Reservation.
  */

function sendMail(reservation, template, content, subject, contact, callback, res){
  content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  async.waterfall([
    function (done) {
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      res.render(template, {
        name: reservation.name,
        appName: config.app.title,
        content: content,
        contact: contact
      }, function (err, emailHTML) {
        done(err, emailHTML);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, done) {
      var mailOptions = {
        to: reservation.email,
        from: config.mailer.from,
        subject: subject,
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
      });
    }
  ], function (err) {
    callback(err);
  });
}
