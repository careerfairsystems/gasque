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
    vm.tableplannings = TableplanningsService.query();

    vm.reservations = ReservationsService.query(function(data){
      vm.reservations = data.filter(isEnrolledOrCompany);
      function isEnrolledOrCompany(r){ return r.enrolled || r.company; }
      vm.reservations = vm.reservations.sort(onName);
      function onName(r1, r2){ return r1.name > r2.name ? 1 : -1; }
      vm.filteredReservations = vm.reservations;

      vm.tableplanning.tables.forEach(function (t){
        t.seats.forEach(function(s){
          vm.reservations.forEach(function(r){
            if(r._id === s._id){
              r.table = t.name;
              r.seatNbr = s.nbr;
            }
          });
        });
      });
    });



    // String comparer
    function prettify(str){
      return str.trim().toLowerCase();
    }
    // Get all data from reservations and tableplanning.
    

    // Create left and right lists of Seats in Table.
    vm.tableplanning.tables.forEach(createLeftRight);
    function createLeftRight(t){
      var halfLength = Math.ceil(t.seats.length / 2);    
      var left = t.seats.slice(0, halfLength);
      var right = t.seats.slice(halfLength); 
      right.reverse();
      t.rows = [];
      for(var i = 0; i < left.length; i++){
        t.rows.push({ left: left[i], right: right[i] });
      }
    }


    // Test data
    /*
    var table = {
      name: 'Nilles bord',
      nbrSeats: 32
    };
    generateTable(table);
    generateTable(table);
    generateTable(table);
    */


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
        var left = { table: table.name, nbr: (i+1), name: 'Empty seat', id: undefined };
        var right = { table: table.name, nbr: (nbr-i), name: 'Empty seat', id: undefined };
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
      alert('Not yet implemented');
    };

    // Save plan as a new one.
    $scope.saveAsNewPlan = function(newName){
      vm.tableplanning.name = newName;      
      vm.tableplanning.$save(successCallback, errorCallback);
    };
    function successCallback(tp){
      console.log('Successfull save:' + JSON.stringify(tp));
      $state.go('tableplannings.edit', { tableplanningId: tp._id });
    }
    function errorCallback(tp){
      console.log('FAILED save:' + JSON.stringify(tp));
    }































    // Modal functions
    // =======================================================================


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










































    // Tableplacement algoritm
    // =======================================================================
    
    vm.generateTablePlanning = function(){

      // Lists
      vm.dressStudent = [];
      vm.dressCompany = [];
      vm.suitStudent = [];
      vm.suitCompany = [];
      
      
      
      vm.reservations.forEach(divide);
      function divide(r){
        if(r.company && (r.clothing === 'Suit' || r.clothing === 'Costume')){
          vm.suitCompany.push(r);
        }
        if(!r.company && (r.clothing === 'Suit' || r.clothing === 'Costume')){
          vm.suitStudent.push(r);
        }
        if(!r.company && r.clothing === 'Dress'){
          vm.dressStudent.push(r);
        }
        if(r.company && r.clothing === 'Dress'){
          vm.dressCompany.push(r);
        }
      }


      // TODO: Get all companies by CompaniesService, create seats for 
      // each gasqueTicket they have. This messes up a bit the code below. 


      // Calculate list sizes.
      var countSS = vm.suitStudent.length; // SuitStudent
      var countDS = vm.dressStudent.length;  // DressStudent
      var countSC = vm.suitCompany.length; // SuitCompany
      var countDC = vm.dressCompany.length; // DressCompany

      var countS = countSS + countDS;
      var countC = countSC + countDC;
      
      var countTotal = countS + countC;

      // Calculate procentages.
      var proS = countS / countTotal;
      var proC = countC / countTotal;

      var proSS = countSS / countTotal;
      var proDS = countDS / countTotal;
      var proSC = countSC / countTotal;
      var proDC = countDC / countTotal;

      // Merge Student and Companies to 2 lists.
      var students = vm.suitStudent.concat(vm.dressStudent);
      var companies = vm.suitCompany.concat(vm.dressCompany);


      // Extract all programs and sort with least popular by companies first.
      Array.prototype.flatMap = function(lambda) { 
        return Array.prototype.concat.apply([], this.map(lambda)); 
      };
      var programList = companies.flatMap(function(r){ 
        return r.program ? r.program.split(',') : []; 
      });
      var popularity = programList.reduce(function (prev, item) { 
        if (item in prev) prev[item] ++; 
        else prev[item] = 1; 
        return prev; 
      }, {});
      var sortable = [];
      for (var program in popularity)
        sortable.push([program, popularity[program]]);
      sortable.sort(
        function(a, b) {
          return a[1] - b[1];
        }
      );
      programList = sortable;

      // Begin with the least popular program, sort companyRep by most specifik
      // desired programme that includes this program. 
      programList.forEach();




      // With them build sextets. 




      // When all sextets are done, divide them to the tables



      // Calculate which tables have too many guests, remove those who are 
      // above the procentage rate. 







      
    };

























  }
})();
