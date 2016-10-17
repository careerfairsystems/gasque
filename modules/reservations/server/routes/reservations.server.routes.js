'use strict';

/**
 * Module dependencies
 */
var reservationsPolicy = require('../policies/reservations.server.policy'),
  reservations = require('../controllers/reservations.server.controller');

module.exports = function(app) {

  // Mail Routes
  app.route('/api/reservations/confirmationmail')
    .post(reservations.reservationconfirmation);

  // Update to reservation confirmed
  app.route('/api/reservations/unregister').all(reservationsPolicy.isAllowed)
    .post(reservations.unregisterreservation);

  // Update to reservation confirmed
  app.route('/api/reservations/confirm').all(reservationsPolicy.isAllowed)
    .post(reservations.confirmreservation);

  // Offer Seat to reservation
  app.route('/api/reservations/offerseat').all(reservationsPolicy.isAllowed)
    .post(reservations.offerseat);
  
  // Update to has payed
  app.route('/api/reservations/haspayed').all(reservationsPolicy.isAllowed)
    .post(reservations.haspayed);

  // Enrolled Routes
  app.route('/api/reservations/enrolled').all(reservationsPolicy.isAllowed)
    .get(reservations.listenrolled);

  // Reserves Routes
  app.route('/api/reservations/reserves').all(reservationsPolicy.isAllowed)
    .get(reservations.listreserves);

  // Confirmed Routes
  app.route('/api/reservations/confirmed').all(reservationsPolicy.isAllowed)
    .get(reservations.listconfirmed);

  // Attending Routes
  app.route('/api/reservations/listattending').all(reservationsPolicy.isAllowed)
    .get(reservations.listattending);

  // Reservations Routes
  app.route('/api/reservations').all(reservationsPolicy.isAllowed)
    .get(reservations.list)
    .post(reservations.create);

  app.route('/api/reservations/:reservationId').all(reservationsPolicy.isAllowed)
    .get(reservations.read)
    .put(reservations.update)
    .post(reservations.update)
    .delete(reservations.delete);

  // Finish by binding the Reservation middleware
  app.param('reservationId', reservations.reservationByID);
};
