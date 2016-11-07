'use strict';

/**
 * Module dependencies
 */
var tableplanningsPolicy = require('../policies/tableplannings.server.policy'),
  tableplannings = require('../controllers/tableplannings.server.controller');

module.exports = function(app) {
  // Tableplannings Routes
  app.route('/api/tableplannings').all(tableplanningsPolicy.isAllowed)
    .get(tableplannings.list)
    .post(tableplannings.create);

  app.route('/api/tableplannings/:tableplanningId').all(tableplanningsPolicy.isAllowed)
    .get(tableplannings.read)
    .put(tableplannings.update)
    .delete(tableplannings.delete);

  // Finish by binding the Tableplanning middleware
  app.param('tableplanningId', tableplannings.tableplanningByID);
};
