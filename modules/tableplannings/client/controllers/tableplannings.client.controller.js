(function () {
  'use strict';

  // Tableplannings controller
  angular
    .module('tableplannings')
    .controller('TableplanningsController', TableplanningsController);

  TableplanningsController.$inject = ['$scope', '$state', 'Authentication', 'TableplanningsService', 'ReservationsService'];

  function TableplanningsController ($scope, $state, Authentication, TableplanningsService, ReservationsService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.tables = [
      { name: 'Hej' },
      { name: 'Hej' },
      { name: 'Hej' },
      { name: 'Hej' },
      { name: 'Hej' }
    ];

    vm.tableplannings = TableplanningsService.query();
    vm.reservations = ReservationsService.query(function(data){
      vm.reservations = data.filter(isEnrolled);
      function isEnrolled(r){ return r.enrolled; }
      vm.reservations = vm.reservations.sort(onName);
      function onName(r1, r2){ return r1.name > r2.name ? 1 : -1; }
      vm.filteredReservations = vm.reservations;
    });



    // String comparer
    function prettify(str){
      return str.trim().toLowerCase();
    }
    // Get all data from reservations and tableplanning.
    




    // Add a table
    $scope.addTable = function(){
      // TODO: Implement
    };


    // Update reservation to server.
    $scope.searchReservations = function (searchText){
      // TODO: Implement
      console.log(searchText);
      vm.filteredReservations = vm.reservations.filter(onSearch);
      function onSearch(r){ 
        return !searchText || prettify(r.name).indexOf(prettify(searchText)) >= 0; 
      }
    };

    // Update reservation to server.
    $scope.updateReservation = function (reservation){
      // TODO: Implement
    };

    // Select seat
    $scope.selectSeat = function(seat){
      if(vm.switchSeats){
        // TODO: Implement
      } else {
        // TODO: Implement
      }
    };

    // Remove reservation from seat
    $scope.removeSeat = function(seat){
      // TODO: Implement
    };


    // Overwrite old plan with new.
    $scope.saveOverOldPlan = function(oldPlan){
      // TODO: Implement
    };

    // Save plan as a new one.
    $scope.saveAsNewPlan = function(newName){
      // TODO: Implement
    };










































































    // Remove existing Tableplanning
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.tableplanning.$remove($state.go('tableplannings.list'));
      }
    }

    // Save Tableplanning
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tableplanningForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tableplanning._id) {
        vm.tableplanning.$update(successCallback, errorCallback);
      } else {
        vm.tableplanning.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tableplannings.view', {
          tableplanningId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
