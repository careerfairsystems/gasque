'use strict';

/**
 * Module dependencies
 */
var reservationsPolicy = require('../policies/reservations.server.policy'),
  reservations = require('../controllers/reservations.server.controller');

module.exports = function(app) {

  // Enrolled Routes
  app.route('/api/reservations/enrolled')
    .get(reservations.listenrolled);

  // Reserves Routes
  app.route('/api/reservations/reserves')
    .get(reservations.listreserves);

  // Confirmed Routes
  app.route('/api/reservations/confirmed')
    .get(reservations.listconfirmed);

  // Attending Routes
  app.route('/api/reservations/listattending')
    .get(reservations.listattending);

  // Reservations Routes
  app.route('/api/reservations').all(reservationsPolicy.isAllowed)
    .get(reservations.list)
    .post(reservations.create);

  app.route('/api/reservations/:reservationId').all(reservationsPolicy.isAllowed)
    .get(reservations.read)
    .put(reservations.update)
    .delete(reservations.delete);

  // Finish by binding the Reservation middleware
  app.param('reservationId', reservations.reservationByID);
};
