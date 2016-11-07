'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Reservations Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/reservations',
      permissions: '*'
    }, {
      resources: '/api/reservations/companyrepresentative',
      permissions: '*'
    }, {
      resources: '/api/reservations/:reservationId',
      permissions: '*'
    }, {
      resources: '/api/reservations/enrolled',
      permissions: '*'
    }, {
      resources: '/api/reservations/reserves',
      permissions: '*'
    }, {
      resources: '/api/reservations/payment',
      permissions: '*'
    }, {
      resources: '/api/reservations/confirmed',
      permissions: '*'
    }, {
      resources: '/api/reservations/attending',
      permissions: '*'
    }, {
      resources: '/api/reservations/unregister',
      permissions: '*'
    }, {
      resources: '/api/reservations/confirm',
      permissions: '*'
    }, {
      resources: '/api/reservations/offerseat',
      permissions: '*'
    }, {
      resources: '/api/reservations/verify',
      permissions: '*'
    }, {
      resources: '/api/reservations/haspayed',
      permissions: '*'
    }]
  }, {
    roles: ['economy'],
    allows : [{
      resources: '/api/reservations/confirmed',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reservations/attending',
      permissions: ['get']
    }, {
      resources: '/api/reservations/payment',
      permissions: '*'
    }, {
      resources: '/api/reservations/unregister',
      permissions: ''
    }, {
      resources: '/api/reservations/confirm',
      permissions: ''
    }, {
      resources: '/api/reservations/offerseat',
      permissions: ''
    }, {
      resources: '/api/reservations/verify',
      permissions: '*'
    }, {
      resources: '/api/reservations/haspayed',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/reservations',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reservations/:reservationId',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reservations/unregister',
      permissions: ''
    }, {
      resources: '/api/reservations/confirm',
      permissions: ''
    }, {
      resources: '/api/reservations/offerseat',
      permissions: ''
    }, {
      resources: '/api/reservations/haspayed',
      permissions: ''
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/reservations',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reservations/:reservationId',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reservations/unregister',
      permissions: ''
    }, {
      resources: '/api/reservations/confirm',
      permissions: ''
    }, {
      resources: '/api/reservations/offerseat',
      permissions: ''
    }, {
      resources: '/api/reservations/verify',
      permissions: '*'
    }, {
      resources: '/api/reservations/haspayed',
      permissions: ''
    }]
  }]);
};

/**
 * Check If Reservations Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Reservation is being processed and the current user created it then allow any manipulation
  if (req.reservation && req.user && req.reservation.user && req.reservation.user.id === req.user.id) {
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
