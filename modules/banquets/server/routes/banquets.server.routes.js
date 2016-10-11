'use strict';

/**
 * Module dependencies
 */
var banquetsPolicy = require('../policies/banquets.server.policy'),
  banquets = require('../controllers/banquets.server.controller');

module.exports = function(app) {
  // Banquets Routes
  app.route('/api/banquets').all(banquetsPolicy.isAllowed)
    .get(banquets.list)
    .post(banquets.create);


  app.route('/api/banquets/active').all(banquetsPolicy.isAllowed)
    .get(banquets.getActive);

  app.route('/api/banquets/:banquetId').all(banquetsPolicy.isAllowed)
    .get(banquets.read)
    .put(banquets.update)
    .delete(banquets.delete);

  // Finish by binding the Banquet middleware
  app.param('banquetId', banquets.banquetByID);
};
