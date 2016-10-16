'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reservation = mongoose.model('Reservation'),
  Banquet = mongoose.model('Banquet'),
  BanquetsController = require(path.resolve('./modules/banquets/server/controllers/banquets.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reservation
 */
exports.create = function(req, res) {

  var invitedtitles = [
    ['Host Arkad', 0],
    ['Coordinator Arkad', 0],
    ['PG Arkad', 0],
    ['Other invited', 0],
  ];

  var othertitles = [
    ['Not member of TLTH', 790],
    ['Student member of TLTH', 500]
  ];

  // Calculate Price
  var nonpayingtitles = [
    ['Host Arkad', 0],
    ['Coordinator Arkad', 0],
    ['PG Arkad', 0],
    ['Other invited', 0],
    ['Student member of TLTH', 500]
  ];

  var payingtitles = [
    ['Not member of TLTH', 790]
  ];

  var payingdrinkpackages = [
    ['Non Alcoholic beverages', 0],
    ['Alcoholic beverages', 0]
  ];


  var nonpayingdrinkpackages = [
    ['Non Alcoholic beverages', 0],
    ['Alcoholic beverages', 135]
  ];

  var title = req.body.title;
  var drinkpackage = req.body.drinkpackage;
  var price = 0;


  function containsTitle(t) {
    return title === t[0];
  }

  function getPriceOfPackage(packages) {
    var toReturn = -1;
    packages.forEach(function(p) {
      if(drinkpackage === p[0]){
        toReturn = p[1];
      }
    });
    return toReturn;
  }

  var paying = payingtitles.filter(containsTitle)[0];
  var nonpaying = nonpayingtitles.filter(containsTitle)[0];
  var invited = invitedtitles.filter(containsTitle)[0];
  var others = othertitles.filter(containsTitle)[0];


  if(paying) {
    console.log("Price: " + price + ", paying[1]: " + paying[1] + ", getPriceOfPackage(p): " + getPriceOfPackage(payingdrinkpackages));
    price = paying[1] + getPriceOfPackage(payingdrinkpackages);
    console.log("Paying price: " + price);
  }

  if(nonpaying) {
    console.log("Price: " + price + ", paying[1]: " + nonpaying[1] + ", getPriceOfPackage(n): " + getPriceOfPackage(nonpayingdrinkpackages));
    price = nonpaying[1] + getPriceOfPackage(nonpayingdrinkpackages);
    console.log("Nonpaying price: " + price);
  }

  req.body.price = price;

  //Write the reservation to db
  if(invited){
    console.log('NOT INVITED');
    bookReservation(function(enrolled) {
      req.body.enrolled = enrolled;
      doSave();
    });
  } else {
    console.log('INVITED');
    req.body.enrolled = true;
    doSave();
  }

  function doSave() {
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
  }

};


function bookReservation (done) {
  Banquet.findOne({ active: true }).exec(function(err, banquet) {
    if(err) {
      console.log(err);
    } else {
      Reservation.find({ enrolled: true }).exec(function(err, enrolledReservations) {
        if(err) {
          console.log(err);
        } else {
          if(banquet.capacity > (enrolledReservations.length + banquet.buffer)) {
            done(true);
          } else {
            done(false);
          }
        }
      });
    }
  });

}

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
