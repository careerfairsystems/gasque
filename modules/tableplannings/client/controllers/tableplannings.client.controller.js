(function () {
  'use strict';

  // Tableplannings controller
  angular
    .module('tableplannings')
    .controller('TableplanningsController', TableplanningsController);

  TableplanningsController.$inject = ['$scope', '$state', 'Authentication', 'TableplanningsService', 'ReservationsService', 'tableplanningResolve', 'CompaniesService'];

  function TableplanningsController ($scope, $state, Authentication, TableplanningsService, ReservationsService, tableplanningResolve, CompaniesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.tableplanning = tableplanningResolve;
    vm.tableplanning.tables = !vm.tableplanning.tables ? [] : vm.tableplanning.tables;
    vm.tableplannings = TableplanningsService.query();
    vm.companies = CompaniesService.query();

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

    // Set Reservation To Seat
    vm.removeSeat = function(seat){
      // Save table and seat to tableplanning (not save on server, only client) 
      vm.tableplanning.tables.forEach(function(t){
        if(t.name === seat.table){
          t.seats.forEach(function(s){
            if(s.nbr === seat.nbr){
              s.name = 'Empty seat';
              s._id = undefined;
            }
          });
        }
      });
      closeSeatModal();
    };

    // Set Reservation To Seat
    $scope.setReservationToSeat = function(reservation, seat){
      // Save table and seat to tableplanning (not save on server, only client) 
      vm.tableplanning.tables.forEach(function(t){
        if(t.name === seat.table){
          t.seats.forEach(function(s){
            if(s.nbr === seat.nbr){
              s.name = reservation.name;
              s._id = reservation._id;
            }
          });
        }
      });
      closeSeatModal();
    };

    // Update reservation to server.
    $scope.updateReservation = function (reservation){
      
      // Save honorary to reservation 
      ReservationsService.get({ reservationId: reservation._id }, function(res){
        res.honorary = reservation.honorary;
        res.$save();
      });
        
      // Save table and seat to tableplanning (not save on server, only client) 
      vm.tableplanning.tables.forEach(function(t){
        if(t.name === vm.currTable.name){
          t.seats.forEach(function(s){
            if(s.nbr === vm.currSeat.nbr){
              s.name = reservation.name;
              s._id = reservation._id;
            }
          });
        }
      });
      closeReservationModal();
    };

    // Select reservation.
    $scope.selectReservation = function (reservation){
      vm.openReservationModal(reservation);
    };

    // Select seat
    $scope.selectSeat = function(table, seat){
      if(vm.switchSeats){
        vm.switchSeats = false;
        // TODO: Implement
        var tempSeat = vm.currSeat;
       
        vm.tableplanning.tables.forEach(function(t){
          if(t.name === table.name){
            t.seats.forEach(function(s){
              if(s.nbr === seat.nbr){
                s.name = vm.currSeat.name;
                s._id = vm.currSeat._id;
              }
            });
          }
          // TODO: Fix bug, never enters this if
          if(t.name === vm.currSeat.table){
            t.seats.forEach(function(s){
              if(s.nbr === vm.currSeat.nbr){
                s.name = seat.name;
                s._id = seat._id;
              }
            });
          }
        });
      } else {
        seat.table = table.name;
        vm.openSeatModal(seat);
      }
    };

    $scope.switchSeats = function(){
      vm.switchSeats = !vm.switchSeats; 
      seatModal.style.display = 'none';
    };

    // Overwrite old plan with new.
    $scope.saveOverOldPlan = function(oldPlan){
      // TODO: Implement
      //alert('Not yet implemented');
      vm.tableplanning.tables.forEach(convertLeftRightToSeats);
      TableplanningsService.get({ tableplanningId: oldPlan._id }, function (tp){
        tp.tables = vm.tableplanning.tables;
        tp.$save();
        closeSaveModal();
      });
    };

    // Save plan as a new one.
    $scope.saveAsNewPlan = function(newName){
      vm.tableplanning.name = newName;       
      vm.tableplanning.tables.forEach(convertLeftRightToSeats);
      vm.tableplanning.$save(successCallback, errorCallback);
      closeSaveModal();
    };
    function successCallback(tp){
      console.log('Successfull save:' + JSON.stringify(tp));
      $state.go('tableplannings.edit', { tableplanningId: tp._id });
    }
    function errorCallback(tp){
      console.log('FAILED save:' + JSON.stringify(tp));
    }

    function convertLeftRightToSeats(table){
      var left = [];
      var right = [];
      table.rows.forEach(zip);
      function zip(row){
        left.push(row.left);
        right.push(row.right);
      }
      right.reverse();
      table.seats = left.concat(right);
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
      vm.newReservation = seat;
      seatModal.style.display = 'block';
    };
    vm.openSaveModal = function() {
      saveModal.style.display = 'block';
    };
    reservationClose.onclick = closeReservationModal;
    function closeReservationModal() {
      reservationModal.style.display = 'none';
      vm.currReservation = undefined;
      vm.currTable = undefined;
      vm.currSeat = undefined;
    }
    seatClose.onclick = closeSeatModal;
    function closeSeatModal() {
      vm.currSeat = undefined;
      seatModal.style.display = 'none';
    }
    saveClose.onclick = closeSaveModal;
    function closeSaveModal() {
      saveModal.style.display = 'none';
    }
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






















    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }



















    // Tableplacement algorithm
    // =======================================================================
/*
- Utifrån andelen företagare / totala platser, placera ut företagare i olika
  sexteter. (med plats för studenter)
- Sortera studenter med minst populära program först. Tilldela när en sextet 
  innehåller minst 1 företegarare som eftersöker det programmet.
- Om ej möjligt stå över den studenten och placera resten först. Sedan
  placera ut randomly

*/

    vm.generateTablePlanning = function(){

      // Lists
      vm.dressStudent = [];
      vm.dressCompany = [];
      vm.suitStudent = [];
      vm.suitCompany = [];
      vm.companyRep = [];


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


      // Sort programs in reservations after increasing popularity
      vm.reservations.forEach(sortPrograms);
      function sortPrograms(r){
        r.programs.sort(afterPopularity);
        function afterPopularity(p1, p2){
          return programList[p1] > programList[p2];
        }
        
      }








      // Begin with the least popular program, sort companyRep by most specifik
      // desired programme that includes this program. 
      programList.forEach();

  
      // Divide and calculate
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


      // Calculate thingis.
      var countSS = vm.suitStudent.length; 
      var countDS = vm.dressStudent.length;  
      var countSC = vm.suitCompany.length; 
      var countDC = vm.dressCompany.length; 
      var countS = countSS + countDS;
      var countC = countSC + countDC;
      var countTotal = countS + countC;

      var sextetsCount = Math.ceil((countTotal / 6));
      vm.sextets = [];
      for(var i = 0; i < sextetsCount; i++) {
        matrix[i] = [];
      }

      // Fas 1
      // ===============================================================
      // For i < dc+sc
      // - push least of girl or boy in sextet

      divideCompanyRepresentatives();
      function divideCompanyRepresentatives(){
        for(i = 0; i < countC; i++){
          var sextetPosition = sextetsCount % i;
          var sextet = vm.sextets[sextetPosition];
          if(!sextet){
            sextet = [];
            vm.sextets.push(sextet);
          }
          var guyCount = sextet.filter(isBoy);
          var girlCount = sextet.filter(isGirl);
          
          if(girlCount < boyCount){
            vm.sextets[sextetsPosition].push(vm.dressCompany.shift());
          }
        }
      }
      function isBoy(s){ return (s.clothing === 'Suite' || s.clothing === 'Costume'); }
      function isGirl(s){ return s.clothing === 'Dress'; }

      // Fas 2
      // ===============================================================
      // For i < ds + ss
      // - sort c in sextet efter matches
      // - sort programs in c
      // - foreach program
      //    - filter students if length > 0 
      //      TAKE student. c.matched++;
  
      divideStudents();
      funtion divideStudents(){
        for(i = countC; i < countTotal; i++){
          var pos = sextetsCount % i;
          var sextet = vm.sextets[pos];
          
          sextet.sort(afterMatches);
          function afterMatches(s1, s2){ return s1.matches > s2.matches ? 1 : -1; }

        }
      }



      // Fas 3
      // ===============================================================
      // filter first if tablelength % 6 === 0
      // - sextet foreach add rows (with left and right)








      while(vm.sextets.length < countC){
          
          if(countDC >= countSC){
            newSextet.push(vm.dressCompany.shift());
          } else {
            newSextet.push(vm.suitCompany.shift());
          }
          i++;
          
      }

      






      /*
      addCompanySextet();
      function addCompanySextet(){
        var proS = countS / countTotal;
        var proC = countC / countTotal;
        var proSS = countSS / countTotal;
        var proDS = countDS / countTotal;
        var proSC = countSC / countTotal;
        var proDC = countDC / countTotal;
        var students = vm.suitStudent.concat(vm.dressStudent);
        var companies = vm.suitCompany.concat(vm.dressCompany);

        // Placera ut företag i i sexteter randomly. Jämt fördelat mellan 
        // tjej och killar.
        var girls = countDC;
        var guys = countSC;
        var tot = countC;
        // Shuffle arrays
        shuffle(vm.suitCompany);
        shuffle(vm.dressCompany);
   
        var groupSize = 6;
        var spots = groupSize * proC;

        var newSextet = [];
        for(var i = 0; i < spots; i++){
        }
        vm.sextets.push(newSextet);      
        if((tot-1) > 0){
          addCompanySextet();
        }
      } 


      addStudentSextet();
      function addStudentSextet(){
        // Calculate thingis.
        var countSS = vm.suitStudent.length; 
        var countDS = vm.dressStudent.length;  
        var countSC = vm.suitCompany.length; 
        var countDC = vm.dressCompany.length; 
        var countS = countSS + countDS;
        var countC = countSC + countDC;
        var countTotal = countS + countC;
        var proS = countS / countTotal;
        var proC = countC / countTotal;
        var proSS = countSS / countTotal;
        var proDS = countDS / countTotal;
        var proSC = countSC / countTotal;
        var proDC = countDC / countTotal;
        var students = vm.suitStudent.concat(vm.dressStudent);
        var companies = vm.suitCompany.concat(vm.dressCompany);

        // Placera ut företag i i sexteter randomly. Jämt fördelat mellan 
        // tjej och killar.
        var girls = countDS;
        var guys = countSS;
        var tot = countS;
        // Shuffle arrays
        shuffle(vm.suitStudent);
        shuffle(vm.dressStudent);
   
        var groupSize = 6;
        var spots = groupSize * proS;

        var newSextet = [];
        for(var i = 0; i < spots; i++){
          if(girls >= guys){
            newSextet.push(vm.dressStudent.shift());
          } else {
            newSextet.push(vm.suitStudent.shift());
          }
        }
        vm.sextets.push(newSextet); 
        if((tot-1) > 0){
          addStudentSextet();
        }
      } 
      */








      // With them build sextets. 




      // When all sextets are done, divide them to the tables



      // Calculate which tables have too many guests, remove those who are 
      // above the procentage rate. 







      
    };

























  }
})();
