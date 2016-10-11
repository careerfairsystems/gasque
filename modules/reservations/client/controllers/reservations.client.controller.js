(function () {
  'use strict';

  // Reservations controller
  angular
    .module('reservations')
    .controller('ReservationsController', ReservationsController);

  ReservationsController.$inject = ['$scope', '$state', 'Authentication', 'reservationResolve'];

  function ReservationsController ($scope, $state, Authentication, reservation) {
    var vm = this;

    vm.authentication = Authentication;
    vm.reservation = reservation;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Reservation
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.reservation.$remove($state.go('reservations.list'));
      }
    }

    // Save Reservation
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reservationForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.reservation._id) {
        vm.reservation.$update(successCallback, errorCallback);
      } else {
        vm.reservation.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('reservations.view', {
          reservationId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
