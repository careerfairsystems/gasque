(function () {
  'use strict';

  angular
    .module('reservations')
    .controller('ReservationsListController', ReservationsListController);

  ReservationsListController.$inject = ['ReservationsService'];

  function ReservationsListController(ReservationsService) {
    var vm = this;

    vm.reservations = ReservationsService.query();
  }
})();
