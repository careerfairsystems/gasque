'use strict';

/**
 * Module dependencies
 */
var mailtemplatesPolicy = require('../policies/mailtemplates.server.policy'),
  mailtemplates = require('../controllers/mailtemplates.server.controller');

module.exports = function(app) {
  // Mailtemplates Routes
  app.route('/api/mailtemplates/send/email').all(mailtemplatesPolicy.isAllowed)
    .post(mailtemplates.sendemail);
  app.route('/api/mailtemplates').all(mailtemplatesPolicy.isAllowed)
    .get(mailtemplates.list)
    .post(mailtemplates.create);

  app.route('/api/mailtemplates/:mailtemplateId').all(mailtemplatesPolicy.isAllowed)
    .get(mailtemplates.read)
    .put(mailtemplates.update)
    .delete(mailtemplates.delete);

  // Finish by binding the Mailtemplate middleware
  app.param('mailtemplateId', mailtemplates.mailtemplateByID);
};
