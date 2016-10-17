'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mailtemplate = mongoose.model('Mailtemplate'),
  MailController = require(path.resolve('./modules/mailtemplates/server/controllers/mail.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mailtemplate
 */
exports.sendemail = function(req, res) {
  //var mailtemplate = new Mailtemplate(req.body);
  //mailtemplate.user = req.user;
  var arkadeventId = req.body.arkadevent;
  var mailtemplateId = req.body.mailtemplate;
  var reservationId = req.body.reservation;

  var hasResponded = false;
  // Email the reservations and ask for accept/decline
  MailController.sendTemplateEmail(mailtemplateId, arkadeventId, reservationId, res, emailDone);
  function emailDone(mailingSuccess){
    if(hasResponded){
      return;
    }
    hasResponded = true;
    if(mailingSuccess){
      return res.status(200).send({ message: 'Succesfully sent offer to the reservation-email' });
    } else {
      return res.status(400).send({ message: 'Mailing not succesfull. We have failed you.' });
    }
  }
};

/**
/**
 * Create a Mailtemplate
 */
exports.create = function(req, res) {
  var mailtemplate = new Mailtemplate(req.body);
  mailtemplate.user = req.user;

  mailtemplate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mailtemplate);
    }
  });
};

/**
 * Show the current Mailtemplate
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mailtemplate = req.mailtemplate ? req.mailtemplate.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mailtemplate.isCurrentUserOwner = req.user && mailtemplate.user && mailtemplate.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(mailtemplate);
};

/**
 * Update a Mailtemplate
 */
exports.update = function(req, res) {
  var mailtemplate = req.mailtemplate ;

  mailtemplate = _.extend(mailtemplate , req.body);

  mailtemplate.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mailtemplate);
    }
  });
};

/**
 * Delete an Mailtemplate
 */
exports.delete = function(req, res) {
  var mailtemplate = req.mailtemplate ;

  mailtemplate.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mailtemplate);
    }
  });
};

/**
 * List of Mailtemplates
 */
exports.list = function(req, res) { 
  Mailtemplate.find().sort('-created').populate('user', 'displayName').exec(function(err, mailtemplates) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mailtemplates);
    }
  });
};

/**
 * Mailtemplate middleware
 */
exports.mailtemplateByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mailtemplate is invalid'
    });
  }

  Mailtemplate.findById(id).populate('user', 'displayName').exec(function (err, mailtemplate) {
    if (err) {
      return next(err);
    } else if (!mailtemplate) {
      return res.status(404).send({
        message: 'No Mailtemplate with that identifier has been found'
      });
    }
    req.mailtemplate = mailtemplate;
    next();
  });
};
