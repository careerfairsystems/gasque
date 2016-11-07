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
    vm.companies = CompaniesService.query();

    // String comparer
    function compareStrings(str1, str2){
      return str1 && str2 && str1.trim().toLowerCase() === str2.trim().toLowerCase();
    }


    $scope.loadCsv = function(){
      console.log('Load csv file');
      vm.hej = vm.csvFile;

      // Extract lines
      vm.reservations = vm.csvFile.split("\n");

      // Remove headers in csv-file.
      vm.reservations.shift();

      // Map from array to an object
      vm.reservations = vm.reservations.map(arrayToObject);
      function arrayToObject(r){
        r = r.split(';');
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

      vm.reservations.forEach(addIfNew);   
      function addIfNew(r){
        var exists = vm.allReservations.filter(isSameR).length > 0;
        function isSameR(allR){ 
          return compareStrings(allR.company, r.company) && compareStrings(allR.name, r.name); 
        }

        if(!exists){
          var newR = new ReservationsService();
          
          // Set clothing
          var clothing = r.sex === 'man' ? 'Suit' : 'Dress';
          
          // Set beverage
          var beverage = r.beverage === 'alkoholfritt' ? 'Alcoholic beverages' : 'Non Alcoholic beverages';
        
          // Set values
          newR.company = r.company;
          newR.name = r.name;
          newR.foodpref = r.foodpref;
          newR.clothing = clothing;
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
