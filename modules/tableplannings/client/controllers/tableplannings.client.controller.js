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
            if(r._id === s.id){
              r.table = t.name;
              r.seatNbr = s.nbr;
              s.company = r.company;
              s.program = r.program;
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
        var name = r.name && prettify(r.name).indexOf(prettify(searchText)) >= 0;
        var table = r.table && prettify(r.table).indexOf(prettify(searchText)) >= 0;
        return !searchText || name || table; 
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
        vm.currSeat.selected = false;
        var tempSeat = {};
       
        vm.tableplanning.tables.forEach(function(t){
          if(t.name === table.name){
            t.seats.forEach(function(s){
              if(s.nbr === seat.nbr){
                tempSeat.name = s.name;
                tempSeat._id = s._id;
                s.name = vm.currSeat.name;
                s._id = vm.currSeat._id;
              }
            });
          }
          if(t.name === vm.currSeat.table){
            t.seats.forEach(function(s){
              if(s.nbr === vm.currSeat.nbr){
                s.name = tempSeat.name;
                s._id = tempSeat._id;
              }
            });
          }
        });
      } else {
        seat.table = table.name;
        vm.openSeatModal(seat);
      }
    };

    $scope.switchSeats = function(seat){
      seat.selected = true;
      vm.switchSeats = !vm.switchSeats; 
      seatModal.style.display = 'none';
    };

    // Overwrite old plan with new.
    $scope.saveOverOldPlan = function(oldPlan){
      // TODO: Implement
      //alert('Not yet implemented');
      vm.tableplanning.tables.forEach(convertLeftRightToSeats);
      vm.tableplanning.tables = vm.tableplanning.tables.map(minimizeTable);
      TableplanningsService.get({ tableplanningId: oldPlan._id }, function (tp){
        tp.tables = vm.tableplanning.tables;
        tp.$save();
        closeSaveModal();
      });
    };
    function minimizeTable(tp){
      var seats = tp.seats.map(function(s){
        s = !s ? {} : s;
        return {
          nbr: s.nbr,
          name: s.name,
          company: s.company,
          clothing: s.clothing,
          matched: s.matched,
          id: s._id
        };
      });
      return {
        name: tp.name,
        nbrSeats: tp.nbrSeats,
        seats: seats,
      };
    }

    // Save plan as a new one.
    $scope.saveAsNewPlan = function(newName){
      vm.tableplanning.name = newName;       
      vm.tableplanning._id = undefined;       
      vm.tableplanning.tables.forEach(convertLeftRightToSeats);
      vm.tableplanning.tables = vm.tableplanning.tables.map(minimizeTable);
      vm.tableplanning.$create(successCallback, errorCallback);
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
  
      // Divide and calculate
      vm.reservations.forEach(divide);
      function divide(r){
        if(!r.company && (r.clothing === 'Suit' || r.clothing === 'Costume')){
          vm.suitStudent.push(r);
        } else if(!r.company && r.clothing === 'Dress'){
          vm.dressStudent.push(r);
        } else if(r.company && r.clothing === 'Dress'){
          vm.dressCompany.push(r);
        } else {
          vm.suitCompany.push(r);
        }
      }

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


      // Sort programs in reservations after increasing popularity
      vm.reservations.forEach(sortPrograms);
      function sortPrograms(r){
        if(!r.program){
          return;
        }
        r.program = r.program.split(',');
        r.program.sort(afterPopularity);
        function afterPopularity(p1, p2){
          return programList[p1] > programList[p2];
        }
      }
      /*
      programList = popularity;
      */
      programList = sortable;

      // Calculates if sextet contains mostly men.
      //  (those with suit or costume as clothing)
      function mostBoys(sextet){
        var s = sextet.filter(hasClothing);
        var guyCount = s.filter(isBoy).length;
        var girlCount = s.filter(isGirl).length;
        function isBoy(s){ return (s.clothing === 'Suite' || s.clothing === 'Costume'); }
        function isGirl(s){ return s.clothing === 'Dress'; }
        function hasClothing(s){ return s.clothing !== 'None'; }
        return guyCount > girlCount;
      }





      // Begin with the least popular program, sort companyRep by most specifik
      // desired programme that includes this program. 
      // programList.forEach();


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
      
      // Create all sextets
      vm.sextets = [];
      for(var i = 0; i < sextetsCount; i++) {
        vm.sextets[i] = [];
      }

      // Fas 1
      // ===============================================================
      // For i < dc+sc
      // - push least of girl or boy in sextet

      divideCompanyRepresentatives();
      function divideCompanyRepresentatives(){
        for(i = 0; i < countC; i++){
          var sextetPosition = i % sextetsCount;
          var sextet = vm.sextets[sextetPosition];
         
          var c; 
          if((mostBoys(sextet) && vm.dressCompany.length > 0) || vm.suitCompany.length === 0){
            c = vm.dressCompany.shift();
          } else {
            c = vm.suitCompany.shift();
          }
          c.matched = 0;
          vm.sextets[sextetPosition].push(c);
        }
      }

      // Fas 2
      // ===============================================================
      // For i < ds + ss
      // - sort c in sextet efter matches
      // - sort programs in c
      // - foreach program
      //    - filter students if length > 0 
      //      TAKE student. c.matched++;
  
      divideStudents();
      function divideStudents(){

        iterateStudents(countC, countTotal);
        function iterateStudents(start, stop){
          if(start === stop){
            return;
          }
          var pos = start % sextetsCount;
          var sextet = vm.sextets[pos];
          
          sextet.sort(afterMatches);
          var student = getStudent(sextet);
          function getStudent(sextet){
            vm.program = getProgramFromCompany(sextet);

            // Get student
            var guys = vm.suitStudent;
            var girls = vm.dressStudent;
            
            girls = girls.filter(function(s){ return s.program[0] === vm.program; });
            guys = guys.filter(function(s){ 
              var p1 = vm.program;
              var p2 = s.program[0];
              return p1 === p2; 
            });
            
            if(girls.length === 0 && guys.length === 0){
              // Works without this?
              var before = sextet.reduce(countP, 0);
              sextet.forEach(removeProgram);
              var newS = sextet.filter(hasNoProgram);
              var after = newS.reduce(countP, 0);
              //console.log('program: ' + program + ', Before: ' + before + ', After: ' + after);
              if(newS.length > 0 && after !== before && after > 0){
                return getStudent(newS);
              }
            }
            function hasNoProgram(s){ return s.program && s.program.length > 0; }
            function countP(pre, curr){ 
              if(curr && curr.program){
                return pre + curr.program.length; 
              } else {
                return pre;
              }
            }
            function removeProgram(r){ 
              if(!r || !r.program){
                return;
              }
              r.program = r.program.filter(function(p){ 
                return p !== program; 
              }); 
            }

            if(mostBoys(sextet) || (guys.length === 0 && girls.length > 0) || (vm.suitStudent.length === 0 && vm.dressStudent.length > 0)){
              var dress = vm.dressStudent.shift();
              return dress;
            } else {
              var suit = vm.suitStudent.shift();
              return suit;
            }
          }
          if(student){
            student.matched = 999; // Never match on students.
            vm.sextets[pos].push(student);
          }
  
          // Increment matched on those where this is true
          vm.sextets[pos].forEach(function(s){
            if(s.program && s.program.length > 0 && s.program.indexOf(vm.program) > -1){
              s.matched++;
            }
          });
          start++;
          iterateStudents(start, stop);
        }
      }
      function afterMatches(s1, s2){ return s1.matched > s2.matched ? 1 : -1; }
      function getProgramFromCompany(sextet){
        var programs = sextet[0].program;
        programs = !programs ? [] : programs;
        // Get least popular program from first company repre.
        var program = getLeastPopularProgram(programs, programList);
        if(!program && sextet.length > 1){
          return getProgramFromCompany(sextet.slice(1));
        } else {
          return program;
        }
      }
      function getLeastPopularProgram(programs, programScores){
        if(!programScores.length || programScores.length === 0){
          return undefined;
        }
        var match = programs.filter(function(p){ 
          return p === programScores[0][0]; 
        });
        if(match.length > 0){
          return match[0];
        } else {
          return getLeastPopularProgram(programs, programScores.slice(1));
        }
      }



      // Fas 3
      // ===============================================================
      // filter first if tablelength % 6 === 0
      // - sextet foreach add rows (with left and right)

      function isCompany(r){ return r.company; }
      function isStudent(r){ return !r.company; }

      var toggle = true;
      var sextetRows = vm.sextets.map(createRow);
      sextetRows = sextetRows.reduce(flatten);
      function createRow(s){
        var rows = [{}, {}, {}];
        var company = s.filter(isCompany);
        var student = s.filter(isStudent);
        company.sort(girlsFirst);
        student.sort(girlsFirst);
        student.reverse();
      
        var ziped = student.map(function (s, i) {
          return [s, company[i]];
        });
        ziped = ziped.reduce(flatten);
        ziped = ziped.filter(notNull);
        
        if(toggle){
          ziped.reverse();
        }
        rows.forEach(function(r){
          r.left = ziped.shift();
          if(!r.left){
            console.log('Student: ' + student);
            console.log('Compnay: ' + company);
          }
        }); 
        rows.forEach(function(r){
          r.right = ziped.shift();
          if(!r.right){
            console.log('Student: ' + student);
            console.log('Compnay: ' + company);
          }
        }); 
        toggle = !toggle;
        return rows;
      }
      sextetRows.forEach(rmMatched);
      function rmMatched(r){
        if(r && r.left && r.left.matched > 100){
          r.left.matched = undefined;
        }
        if(r && r.right && r.right.matched > 100){
          r.right.matched = undefined;
        }
      }
      function flatten(pre, curr){ return pre.concat(curr); } 
      function notNull(item){ return item; } 
      function isGirl(c){ return c.clothing === 'Dress'; }
      function girlsFirst(c1, c2){
        return isGirl(c1) > isGirl(c2) ? 1 : -1;
      }

      var tables = vm.tableplanning.tables;

      function divisible(t){ return t.seats.length % 6 === 0; }
      tables.sort(function(t1, t2){
        return divisible(t1) > divisible(t2) ? 1 : -1;
      });

      // Clean up tables
      tables.forEach(function(t){
        t.nbr = 0;
        t.rows = [];
        t.seats = [];
      });

      // Add rows
      tables.forEach(function(t){
        function addRow(t){
          if(t.nbr >= t.nbrSeats){
            return;
          }
          var row = sextetRows.shift();
          if(row){
            if(row.left){ row.left.nbr = (t.nbr / 2) + 1; }
            if(row.right){ row.right.nbr = t.nbrSeats - (t.nbr / 2); }
            t.rows.push(row);
          }
          t.nbr = t.nbr + 2;
          addRow(t);
        }
        addRow(t);
      });
      vm.remainingRows = sextetRows;
    };





  }
})();
