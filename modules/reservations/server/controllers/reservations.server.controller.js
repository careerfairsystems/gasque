'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reservation = mongoose.model('Reservation'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reservation
 */
exports.create = function(req, res) {
  var reservation = new Reservation(req.body);
  reservation.user = req.user;

  reservation.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservation);
    }
  });
};

/**
 * Show the current Reservation
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var reservation = req.reservation ? req.reservation.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  reservation.isCurrentUserOwner = req.user && reservation.user && reservation.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(reservation);
};

/**
 * Update a Reservation
 */
exports.update = function(req, res) {
  var reservation = req.reservation ;

  reservation = _.extend(reservation , req.body);

  reservation.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservation);
    }
  });
};

/**
 * Delete an Reservation
 */
exports.delete = function(req, res) {
  var reservation = req.reservation ;

  reservation.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservation);
    }
  });
};

/**
 * List of Reservations
 */
exports.list = function(req, res) { 
  Reservation.find().sort('-created').populate('user', 'displayName').exec(function(err, reservations) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservations);
    }
  });
};

/**
 * Reservation middleware
 */
exports.reservationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reservation is invalid'
    });
  }

  Reservation.findById(id).populate('user', 'displayName').exec(function (err, reservation) {
    if (err) {
      return next(err);
    } else if (!reservation) {
      return res.status(404).send({
        message: 'No Reservation with that identifier has been found'
      });
    }
    req.reservation = reservation;
    next();
  });
};
