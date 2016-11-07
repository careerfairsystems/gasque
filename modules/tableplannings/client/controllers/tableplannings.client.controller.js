(function () {
  'use strict';

  // Tableplannings controller
  angular
    .module('tableplannings')
    .controller('TableplanningsController', TableplanningsController);

  TableplanningsController.$inject = ['$scope', '$state', 'Authentication', 'TableplanningsService', 'ReservationsService', 'tableplanningResolve'];

  function TableplanningsController ($scope, $state, Authentication, TableplanningsService, ReservationsService, tableplanningResolve) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.tableplanning = tableplanningResolve;
    vm.tableplanning.tables = !vm.tableplanning.tables ? [] : vm.tableplanning.tables;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

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
    


    // Test data
    var table = {
      name: 'Nilles bord',
      nbrSeats: 32
    };
    generateTable(table);
    generateTable(table);
    generateTable(table);


    // Add a table
    $scope.addTable = function(){
      // TODO: Implement
      var tableName = prompt('Please enter a table name');
      if(tableName){
        var nbrSeats = prompt('Please enter number of seats at the table');
        if((+nbrSeats) % 2 === 1){
          nbrSeats = prompt('Please enter a even number');
        }
        var table = {
          name: tableName,
          nbrSeats: (+nbrSeats)
        };
        generateTable(table);
      }
    };

    // Generate table
    function generateTable(table){
      var nbr = table.nbrSeats;
      table.rows = [];
      table.seats = [];
      var i;
      for(i = 0; i < (nbr/2); i++){
        var left = { nbr: (i+1), name: 'Empty seat', id: undefined };
        var right = { nbr: (nbr-i), name: 'Empty seat', id: undefined };
        table.rows.push({ left: left, right: right });
      }
      for(i = 0; i < nbr; i++){
        table.seats.push({
          nbr: (i+1),
          name: 'Empty seat',
          id: undefined
        });
      }
      vm.tableplanning.tables.push(table);
    }


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

    // Select reservation.
    $scope.selectReservation = function (reservation){
      // TODO: Implement
      vm.openReservationModal(reservation);
    };

    // Select seat
    $scope.selectSeat = function(table, seat){
      vm.openSeatModal(seat);
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






































    // Create modal functions.
    vm.currReservation = {};
    vm.currSeat = {};
    var reservationModal = document.getElementById('reservationModal');
    var seatModal = document.getElementById('seatModal');
    var saveModal = document.getElementById('saveModal');
    var reservationBtn = document.getElementById('reservationBtn');
    var setBtn = document.getElementById('seatBtn');
    var saveBtn = document.getElementById('saveBtn');
    var reservationClose = document.getElementsByClassName('reservationClose')[0];
    var seatClose = document.getElementsByClassName('seatClose')[0];
    var saveClose = document.getElementsByClassName('saveClose')[0];

    vm.openReservationModal = function(reservation) {
      vm.currReservation = reservation;
      vm.currTable = {};
      reservationModal.style.display = 'block';
    };
    vm.openSeatModal = function(seat) {
      vm.currSeat = seat;
      seatModal.style.display = 'block';
    };
    vm.openSaveModal = function() {
      saveModal.style.display = 'block';
    };
    reservationClose.onclick = function() {
      reservationModal.style.display = 'none';
      vm.currReservation = undefined;
    };
    seatClose.onclick = function() {
      seatModal.style.display = 'none';
      vm.currSeat = undefined;
    };
    saveClose.onclick = function() {
      saveModal.style.display = 'none';
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target === reservationModal) {
        reservationModal.style.display = 'none';
      }
      if (event.target === seatModal) {
        seatModal.style.display = 'none';
      }
      if (event.target === saveModal) {
        saveModal.style.display = 'none';
      }
    };
    vm.updateCompany = function(){
      // Update DB.
      function saveCompany(company){
        /*
        var comp = CompaniesService.get({ companyId: company._id }, function() {
          comp = company;
          comp.$save();
        });
        */
      }
      saveCompany(vm.companies[vm.currentIndex]);

      // Hide modal
      //modal.style.display = 'none';
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
