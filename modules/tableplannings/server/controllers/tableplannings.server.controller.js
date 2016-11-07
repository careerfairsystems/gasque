'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Tableplanning = mongoose.model('Tableplanning'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Tableplanning
 */
exports.create = function(req, res) {
  var tableplanning = new Tableplanning(req.body);
  tableplanning.user = req.user;

  tableplanning.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tableplanning);
    }
  });
};

/**
 * Show the current Tableplanning
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var tableplanning = req.tableplanning ? req.tableplanning.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  tableplanning.isCurrentUserOwner = req.user && tableplanning.user && tableplanning.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(tableplanning);
};

/**
 * Update a Tableplanning
 */
exports.update = function(req, res) {
  var tableplanning = req.tableplanning ;

  tableplanning = _.extend(tableplanning , req.body);

  tableplanning.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tableplanning);
    }
  });
};

/**
 * Delete an Tableplanning
 */
exports.delete = function(req, res) {
  var tableplanning = req.tableplanning ;

  tableplanning.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tableplanning);
    }
  });
};

/**
 * List of Tableplannings
 */
exports.list = function(req, res) { 
  Tableplanning.find().sort('-created').populate('user', 'displayName').exec(function(err, tableplannings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tableplannings);
    }
  });
};

/**
 * Tableplanning middleware
 */
exports.tableplanningByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Tableplanning is invalid'
    });
  }

  Tableplanning.findById(id).populate('user', 'displayName').exec(function (err, tableplanning) {
    if (err) {
      return next(err);
    } else if (!tableplanning) {
      return res.status(404).send({
        message: 'No Tableplanning with that identifier has been found'
      });
    }
    req.tableplanning = tableplanning;
    next();
  });
};
