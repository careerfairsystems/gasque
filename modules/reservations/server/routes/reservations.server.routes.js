'use strict';

/**
 * Module dependencies
 */
var reservationsPolicy = require('../policies/reservations.server.policy'),
  reservations = require('../controllers/reservations.server.controller');

module.exports = function(app) {
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
