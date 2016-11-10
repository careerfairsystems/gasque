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
                tempSeat.company = s.company;
                tempSeat.clothing = s.clothing;
                s.name = vm.currSeat.name;
                s._id = vm.currSeat._id;
                s.company = vm.currSeat.company;
                s.clothing = vm.currSeat.clothing;
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
      
      shuffle(vm.reservations);
  
      // Filter out honary
      vm.reservations = vm.reservations.filter(function(r){ return !r.honorary; });

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

      var c = vm.suitCompany.concat(vm.dressCompany);

      // Extract all programs and sort with least popular by companies first.
      Array.prototype.flatMap = function(lambda) { 
        return Array.prototype.concat.apply([], this.map(lambda)); 
      };
      var programList = c.flatMap(function(r){ 
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
      programList = sortable;

      // Calculates if sextet contains mostly men.
      //  (those with suit or costume as clothing)
      function mostBoys(sextet){
        var guyCount = sextet.filter(isBoy).length;
        var girlCount = sextet.filter(isGirl).length;
        console.log('MostBoys: ' + guyCount > girlCount);
        return guyCount > girlCount;
      }
      function isBoy(s){ return (s.clothing === 'Suit' || s.clothing === 'Costume'); }
      function isGirl(s){ return s.clothing === 'Dress'; }

      // Calculate thingis.
      var countSS = vm.suitStudent.length; 
      var countDS = vm.dressStudent.length;  
      var countSC = vm.suitCompany.length; 
      var countDC = vm.dressCompany.length; 
      var countS = countSS + countDS;
      var countC = countSC + countDC;
      var countTotal = countS + countC;

      console.log('Total: ' + vm.reservations.length);
      var preName = vm.reservations.map(function(r){ return r.name; });
      
      // TODO:Even out the lists. 
      var lists = [
        { student: true, boy: true, list: vm.suitStudent },
        { student: true, boy: false, list: vm.dressStudent },
        { student: false, boy: true, list: vm.suitCompany },
        { student: false, boy: false, list: vm.dressCompany },
      ];

      evenOut(lists);
      function evenOut(lists){
        lists.sort(onLength);
        if(maxDistance(lists) > 1){
          lists[0].list.push(lists[lists.length - 1].list.shift());
          evenOut(lists);
        }
      }
      function maxDistance(lists){
        var length = lists.reduce(function(pre, l){ return pre + l.list.length; }, 0);
        var mean = length / lists.length;
        var max = 0; // Largest diff if lists[0] is 0
        lists.forEach(function(l){
          var dist = Math.abs(l.list.length - mean);
          max = max > dist ? max : dist;
        });
        return max;
      }
      function onLength(l1, l2){
        return l1.list.length > l2.list.length ? 1 : -1;
      }


      // Sort students after program
      lists.forEach(function(l){
        if(l.student)
          shuffle(l.list);
          //l.list.sort(afterProgram);
      });
      function afterProgram(s1,s2){
        return s1.program > s2.program ? 1 : -1;
      }

      // Zip studentLists
      var studentLists = lists.filter(function(l){ return l.student; });
      var companyLists = lists.filter(function(l){ return !l.student; });
      lists.sort(function(l1,l2){ return l1.boy > l2.boy ? 1 : -1; });
      var students = zip(studentLists);
      function zip(lists){
        var res = [];
        var size = lists.reduce(function(pre,curr){ return pre > curr.list.length ? pre : curr.list.length; },0);
        for(var i = 0; i < size; i++){
          lists.forEach(addRes);
        }
        function addRes(l){ 
          res.push(l.list.shift()); 
        }
        return res.filter(function(r){ return r;});
      }
      shuffle(companyLists);
      var companies = companyLists.reduce(function(pre, curr){
        return pre.concat(curr.list);
      },[]); 
      var leftSide = students;
      var rightSide = [];
  
      leftSide.forEach(function(s, i){
        var pre = leftSide[i-1];
        var curr = leftSide[i];
        var next = leftSide[i+1];
        var arr = [pre, curr, next].filter(function(a){ return a; });
        var programs = arr.reduce(toPrograms, []);
        function toPrograms(pre, curr){
          return pre.concat(curr.program);
        }
        var company = getMostMatchedCompany(programs, i % 2);
        if(company){
          rightSide.push(company);
        }
      });
      function getMostMatchedCompany(programs, hasToBeBoy){
        companies.forEach(calculateRelationship);
        function calculateRelationship(c){
          if(!c.program){
            c.matches = 0;
            return;
          }
          c.matches = c.program.reduce(function(pre, curr){
            var m = programs.filter(function(p){return p === curr; }).length;
            return pre + m;
          },0);
        }
        companies.sort(onMatches);
        function onMatches(c1, c2){ return c1.matches < c2.matches ? 1 : -1; }


        // Get boy or girl depending on toggle-variable
        var comps = hasToBeBoy ? companies.filter(isBoy) : companies.filter(isGirl);
        comps = !comps ? companies : comps;
        var c = comps.shift();
        if(!c){
          return null;
        }
        // Remove company from list
        companies = companies.filter(isNotSame);
        return c; // Mockup
        function isNotSame(r){ return r._id !== c._id; }
        
      }

      Array.prototype.swap = function (index_this, other, index_other) {
        var b = this[index_this];
        if(this[index_this] && other[index_other]){
          this[index_this] = other[index_other];
          other[index_other] = b;
        }
        return this;
      };


      // Swap every two seats (as an inverse)
      var temp1, temp2;
      for(var i = 0; i < leftSide.length; i = i + 4){
        leftSide = leftSide.swap(i, rightSide, i + 1);
        leftSide = leftSide.swap(i + 1, rightSide, i);
      }

      vm.tableplanning.tables.forEach(function(t){
        t.rows = [];
      });
      console.log('Left:' + leftSide.length);
      console.log('right:' + rightSide.length);
      console.log('Sum:' + (leftSide.length + rightSide.length));

      leftSide = leftSide.filter(exists);
      rightSide = rightSide.filter(exists);
      function exists(i){ return i; }

      console.log('Total: ' + vm.reservations.length);
      var postLeft = leftSide.map(function(r){ return r.name; });
      var postRight = rightSide.map(function(r){ return r.name; });
      var postName = postLeft.concat(postRight);


      vm.tableplanning.tables.forEach(function(t){
        for(var i = 0; i < (t.nbrSeats / 2); i++){
          var l = leftSide.shift();
          var r = rightSide.shift();
          r = !r ? { name: 'Empty seat' } : r;
          l = !l ? { name: 'Empty seat' } : l;

          r.nbr = (i) + 1;
          l.nbr = t.nbrSeats - i;

          t.rows.push({ left: r, right: l });
        }
      });


      vm.bMissing = preName.filter(function(i){
        return postName.filter(function(j){ return j.toLowerCase() === i.toLowerCase(); }).length === 0;
      });
      vm.aMissing = postName.filter(function(i){
        return preName.filter(function(j){ return j.toLowerCase() === i.toLowerCase(); }).length === 0;
      });

      console.log('Missing A: ' + vm.aMissing);
      console.log('Missing B: ' + vm.bMissing);
      
    };




  }
})();
