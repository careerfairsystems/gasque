'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Mailtemplates Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/mailtemplates',
      permissions: '*'
    }, {
      resources: '/api/mailtemplates/send/email',
      permissions: '*'
    }, {
      resources: '/api/mailtemplates/:mailtemplateId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/mailtemplates',
      permissions: ['get', 'post']
    }, {
      resources: '/api/mailtemplates/:mailtemplateId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/mailtemplates',
      permissions: ['get']
    }, {
      resources: '/api/mailtemplates/:mailtemplateId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Mailtemplates Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Mailtemplate is being processed and the current user created it then allow any manipulation
  if (req.mailtemplate && req.user && req.mailtemplate.user && req.mailtemplate.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
