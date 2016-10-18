'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  Reservation = mongoose.model('Reservation'),
  Banquet = mongoose.model('Banquet'),
  MailController = require(path.resolve('./modules/mailtemplates/server/controllers/mail.server.controller')),
  config = require(path.resolve('./config/config')),
  BanquetsController = require(path.resolve('./modules/banquets/server/controllers/banquets.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
  * Get yesterday-date-object
  */
function getTomorrow(){
  var today = new Date();
  today.setDate(today.getDate() + 1);
  return today;
}


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

  var title = req.body.membership;
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
    console.log('Price: ' + price + ', paying[1]: ' + paying[1] + ', getPriceOfPackage(p): ' + getPriceOfPackage(payingdrinkpackages));
    price = paying[1] + getPriceOfPackage(payingdrinkpackages);
    console.log('Paying price: ' + price);
  }

  if(nonpaying) {
    console.log('Price: ' + price + ', paying[1]: ' + nonpaying[1] + ', getPriceOfPackage(n): ' + getPriceOfPackage(nonpayingdrinkpackages));
    price = nonpaying[1] + getPriceOfPackage(nonpayingdrinkpackages);
    console.log('Nonpaying price: ' + price);
  }

  req.body.price = price;

  //Write the reservation to db
  if(!invited){
    console.log('NOT INVITED');
    bookReservation(function(enrolled) {
      req.body.enrolled = enrolled;
      req.body.reserve = !req.body.enrolled;
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
 * Unregister a reservation
 */
exports.unregisterreservation = function(req, res) {
  var reservationId = req.body.reservationId;
  Reservation.update({ _id: new ObjectId(reservationId) }, { $set: { enrolled: false, reserv: false } }, updateDone);
  function updateDone(err, affected, reservation){
    // Send email to reservation of being unregistered
    sendEmailWithBanquetTemplate(reservationId, req, res, 'unregisteredmail');
  }
};

/**
 * Confirm a reservation
 */
exports.confirmreservation = function(req, res) {
  var reservationId = req.body.reservationId;
  Reservation.update({ _id: new ObjectId(reservationId) }, { $set: { confirmed: true } }, updateDone);
  function updateDone(err, affected, reservation){
    // Send email to reservation of being unregistered
    //sendEmailWithBanquetTemplate(reservationId, req, res, 'paymentinformationmail');
  }
};

/**
 * Offer a reservation a seat
 */
exports.offerseat = function(req, res) {
  var reservationId = req.body.reservationId;
  Reservation.update({ _id: new ObjectId(reservationId) }, { $set: { pending: true, pendingdeadline: getTomorrow() } }, updateDone);
  function updateDone(err, affected, reservation){
    // Send email to reservation of being unregistered
    sendEmailWithBanquetTemplate(reservationId, req, res, 'offerseatmail', specifikContent);
    function specifikContent(reservation){
      var str = '\n\n';
      str += 'Link to verify that you are still interested in attending the Banquet:\n';
      str += config.host + '/reservations/verify/' + reservation._id;
      str += '\n';
      return str;
    }
  }
};

/**
 * Update reservation to has payed
 */
exports.haspayed = function(req, res) {
  var reservationId = req.body.reservationId;
  Reservation.update({ _id: new ObjectId(reservationId) }, { $set: { payed: true } }, updateDone);
  function updateDone(err, affected, reservation){
    // Send email to reservation of being unregistered
    sendEmailWithBanquetTemplate(reservationId, req, res, 'paymentreceivedmail');
  }
};

/**
 * Show the current Reservation
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var reservation = req.reservation ? req.reservation.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the 'owner'.
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
* List of reservations that should pay
*/
exports.listpayment = function(req,res) {
  Reservation.find({ payed : false }).sort('-created').populate('user', 'displayName').exec(function(err, reservations){
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({ data: reservations });
    }
  });
};

/**
* List of enrolled Reservations
*/
exports.listenrolled = function(req,res) {
  Reservation.find({ enrolled : true }).sort('-created').populate('user', 'displayName').exec(function(err, reservations){
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({ data: reservations });
    }
  });
};

/**
* List of reserve Reservations
*/
exports.listreserves = function(req,res) {
  Reservation.find({ reserve : true }).sort('-created').populate('user', 'displayName').exec(function(err, reservations){
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservations);
    }
  });
};

/**
* List of confirmed Reservations
*/
exports.listconfirmed = function(req,res) {
  Reservation.find({ confirmed : true }).sort('-created').populate('user', 'displayName').exec(function(err, reservations){
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservations);
    }
  });
};

/**
* List of Attendee Reservations
*/
exports.listattending = function(req,res) {
  Reservation.find({ payed : true }).sort('-created').populate('user', 'displayName').exec(function(err, reservations){
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reservations);
    }
  });
};

/**
* Send thankyou-mail or reservmail depending on enrolled
*/
exports.reservationconfirmation = function(req,res) {
  var reservationId = req.body.reservationId;

  Reservation.findOne({ _id: new ObjectId(reservationId) }, foundReservation);
  function foundReservation(err, reservation){
    if(err || !reservation){
      return res.status(400).send({ message: 'Reservation not found' });
    } 
    if(reservation.enrolled){
      thankyoumail(req, res);
    } else {
      reservationmail(req, res);
    }
  }
};

/**
* Send thankyou-mail
*/
exports.thankyoumail = thankyoumail;
function thankyoumail(req,res) {
  sendEmailWithBanquetTemplate(req.body.reservationId, req, res, 'thankyoumail', specifikContent);
  function specifikContent(reservation){
    reservation.other = reservation.other || '';
    var str = '';
    str += 'Your payment shall state the OCR: \n' + reservation.ocr;
    str += '\n';
    str += '\n';
    str += 'Your reservation:\n';
    str += 'Name:\n\t' + reservation.name + '\n';
    str += 'Email:\n\t' + reservation.email + '\n';
    str += 'Phone:\n\t' + reservation.phone + '\n';
    str += 'Program:\n\t' + reservation.program + '\n';
    str += 'Clothing:\n\t' + reservation.clothing + '\n';
    str += 'Title:\n\t' + reservation.title + '\n';
    str += 'Membership:\n\t' + reservation.membership + '\n';
    str += 'Beverage package:\n\t' + reservation.drinkpackage + '\n';
    str += 'Food preference:\n\t' + reservation.foodpref + '\n';
    str += 'Other preferences:\n\t' + reservation.other + '\n';
    str += 'Price:\n\t' + reservation.price + 'kr\n';
    str += '\n';
    return str;
  }
}

/**
* Send reserv-mail
*/
exports.reservmail = reservationmail;
function reservationmail(req,res) {
  sendEmailWithBanquetTemplate(req.body.reservationId, req, res, 'reservmail');
}

/**
  * Generic method to send a email based on mailtemplate given
  */
function sendEmailWithBanquetTemplate(reservationId, req, res, mailtemplate, specifikContent) {
  Banquet.findOne({ active: true }, function(err, banquet){
    var template = banquet[mailtemplate];
    var hasResponded = false;
    MailController.sendTemplateEmail(template, reservationId, res, mailingDone, specifikContent);
    function mailingDone(result){
      if(hasResponded){
        return;
      }
      hasResponded = true;
      if(result.error){
        return res.status(400).send({ message: result.message });
      } else {
        return res.status(200).send({ message: result.message });
      }
    }
  });
}

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
