(function () {
  'use strict';

  // Submitted controller
  angular
    .module('reservations')
    .controller('MailController', MailController);

  MailController.$inject = ['$stateParams', '$http', '$scope', 'reservationResolve'];

  function MailController ($stateParams, $http, $scope, reservation) {
    var vm = this;
    console.log(reservation);
    vm.reservation = reservation;

    vm.name = vm.reservation.name;
    vm.email = vm.reservation.email;
    vm.enrolled = vm.reservation.enrolled;

    $http.post('/api/reservations/mail/thankyou', { reservationId: vm.reservation._id }).success(function (response) {
      // Show usser success message
      $scope.success = response.message;
    }).error(function (response) {
      // Show user error message
      $scope.error = response.message;
    });

  }
})();
