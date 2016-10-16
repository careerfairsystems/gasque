'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  Banquet = mongoose.model('Banquet'),
  Reservation = mongoose.model('Reservation'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Banquet
 */
exports.create = function(req, res) {
  var banquet = new Banquet(req.body);
  banquet.user = req.user;

  banquet.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(banquet);
    }
  });
};

/**
 * Show the current Banquet
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var banquet = req.banquet ? req.banquet.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  banquet.isCurrentUserOwner = req.user && banquet.user && banquet.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(banquet);
};

/**
 * Update a Banquet
 */
exports.update = function(req, res) {
  var banquet = req.banquet ;

  banquet = _.extend(banquet , req.body);

  banquet.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(banquet);
    }
  });
};

/**
 * Delete an Banquet
 */
exports.delete = function(req, res) {
  var banquet = req.banquet ;

  banquet.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(banquet);
    }
  });
};

/**
 * List of Banquets
 */
exports.list = function(req, res) {
  Banquet.find().sort('-created').populate('user', 'displayName').exec(function(err, banquets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(banquets);
    }
  });
};

/**
* Retrieves the active banquet
*/
exports.getActive = function(req, res) {
  Banquet.find({ active: true }).exec(function(err, banquets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(banquets[0]);
    }
  });
};


/**
 * Banquet middleware
 */
exports.banquetByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Banquet is invalid'
    });
  }

  Banquet.findById(id).populate('user', 'displayName').exec(function (err, banquet) {
    if (err) {
      return next(err);
    } else if (!banquet) {
      return res.status(404).send({
        message: 'No Banquet with that identifier has been found'
      });
    }
    req.banquet = banquet;
    next();
  });
};
