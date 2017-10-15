(function () {
  'use strict';

  // Company reservationscontroller
  angular
    .module('reservations')
    .controller('CompanyReservationsController', CompanyReservationsController);

  CompanyReservationsController.$inject = ['$http','$scope', '$state', 'Authentication', 'ReservationsService', 'CompaniesService', '$sce'];

  function CompanyReservationsController ($http, $scope, $state, Authentication, ReservationsService, CompaniesService, $sce) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.successCount = 0;
    vm.errorCount = 0;
    vm.existsCount = 0;

    // Get data from DB
    vm.allReservations = ReservationsService.query();
    vm.companies = CompaniesService.query(function(data){
      vm.companies = data;

      // CompanyGasqueList
      /*
      vm.companyGasqueList = [];
      vm.companies.forEach(function(c){
        for(var i = 0; i < c.gasqueTickets; i++){
          vm.companyGasqueList.push({
            membership: 'Company Representative',
            name: c.name + ' ' + (i+1),
            sex: 'None',
            drinkpackage: '',
          }); 
        }
      });
      */
      
      vm.companyPrograms = vm.companies.reduce(function(pre, c){
        pre[c.name] = c.desiredProgramme.join(',');
        return pre;
      }, {});
      vm.companyGasqueList = vm.companies.reduce(function(pre, c){
        pre[c.name] = c.gasqueTickets;
        return pre;
      }, {});
    });

    // String comparer
    function compareStrings(str1, str2){
      return str1 && str2 && str1.trim().toLowerCase() === str2.trim().toLowerCase();
    }

    $scope.deleteOldCompanies = function(){

      // Remove old reservationsRepresentatives
      var oldCompanies = vm.allReservations.filter(isCompany);
      function isCompany(c){ return c.company; }
      var count = oldCompanies.length;
      oldCompanies.forEach(function(c){
        ReservationsService.get({ reservationId: c._id }, function(res){
          res.$delete(function(res){
            console.log('Delete ' + res.name);
            count--;
            console.log('Left ' + count);
          });
        });
      });
    };

    $scope.loadCsv = function(){
      console.log('Load csv file');

      // Extract lines
      vm.reservations = vm.csvFile.split('\n');

      // Remove headers in csv-file.
      vm.reservations.shift();

      // Map from array to an object
      vm.reservations = vm.reservations.map(arrayToObject);
      function arrayToObject(r){
        r = r.split('\t');
        return {
          company: r[0],
          name: r[1],
          gasque: r[2],
          foodpref: r[3],
          sex: r[4],
          beverage: r[5]
        };
      }

      // Filter those who will attend the banquet.
      vm.reservations = vm.reservations.filter(attendGasque);
      function attendGasque(r){
        return r.gasque === '1';
      }

      // Print length
      console.log('Reservations: ' + vm.reservations.length);


      // Get program from company
      vm.reservations.forEach(getCompanyPrograms);
      function getCompanyPrograms(r){
        
        var companies = vm.companies.filter(isSame);
        function isSame(c){ return compareStrings(c.name, r.company); }
        if(companies.length > 0){
          var company = companies[0];
          r.program = company.desiredProgramme.join(',');
        }
      }
        

      vm.reservations.forEach(countSpots);   
      function countSpots(r){
        vm.companyGasqueList[r.company]--;
      }

        
      createMockupReservations();
      function createMockupReservations(){
        var cNames = Object.keys(vm.companyGasqueList);
        for(var cName in cNames){
          var company = cNames[cName];
          var reservationsLeft = vm.companyGasqueList[company];
          for(var i = 0; i < reservationsLeft; i++){
            var newR = {};
            var gender = 'None';
            
            var program = vm.companyPrograms[company];
            // Set beverage
            var beverage = 'Alcoholic beverages';
          
            // Set values
            newR.company = company;
            newR.program = program;
            newR.name = company + ' ' + (i + 1);
            newR.drinkpackage = beverage;
            newR.gender = gender;
            newR.membership = 'Company Representative';
            vm.reservations.push(newR);
          } 
        }
      }



      vm.reservations.forEach(addIfNew);   
      function addIfNew(r){
        var exists = vm.allReservations.filter(isSameR).length > 0;
        function isSameR(allR){ 
          return compareStrings(allR.company, r.company) && compareStrings(allR.name, r.name); 
        }

        if(!exists){
          var newR = new ReservationsService();
          
          // Set gender
          var gender = 'None';
	  if(r.sex.toLowerCase() === 'man') {
	    gender = 'Man';
	  } else if(r.sex.toLowerCase() === 'kvinna' || r.sex.toLowerCase() === 'woman') {
	    gender = 'Woman';
	  } else {
	    if(Math.random() >= 0.5) {
	      gender = 'Man';
	    } else {
	      gender = 'Woman';
	    }
	  }
          
          // Set beverage
          var beverage = r.beverage === 'alkoholfritt' ? 'Alcoholic beverages' : 'Non Alcoholic beverages';
        
          // Set values
          newR.company = r.company;
          newR.name = r.name;
          newR.foodpref = r.foodpref;
          newR.program = r.program;
          newR.gender = gender;
          newR.drinkpackage = beverage;
          newR.membership = 'Company Representative';
          //newR.$save(successCallback, errorCallback);

          $http.post('/api/reservations/companyrepresentative', newR).success(successCallback).error(errorCallback);
          
        } else {
          vm.existsCount++;
        }
        function successCallback(res){
          console.log('Successfull save of ' + res.name);
          vm.successCount++;
        }
        function errorCallback(res){
          console.log('FAILED TO SAVE ' + res.name);
          vm.errorCount++;
        }
      }
    };
  }
})();
