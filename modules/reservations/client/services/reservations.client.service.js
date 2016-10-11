//Reservations service used to communicate Reservations REST endpoints
(function () {
  'use strict';

  angular
    .module('reservations')
    .factory('ReservationsService', ReservationsService);

  ReservationsService.$inject = ['$resource'];

  function ReservationsService($resource) {
    return $resource('api/reservations/:reservationId', {
      reservationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
