(function () {
  'use strict';

  // Companies controller
  angular
    .module('companies')
    .controller('CompaniesTicketsController', CompaniesTicketsController);

  CompaniesTicketsController.$inject = ['$scope', '$state', 'Authentication', 'CompaniesService'];

  function CompaniesTicketsController ($scope, $state, Authentication, CompaniesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.error = null;
    vm.successCount = 0;
    vm.errorCount = 0;
    vm.existsCount = 0;

    vm.allCompanies = CompaniesService.query();    

    // String comparer
    function compareStrings(str1, str2){
      return str1 && str2 && str1.trim().toLowerCase() === str2.trim().toLowerCase();
    }

    $scope.loadCsv = function(){
      console.log('Load csv file');

      // Extract lines
      vm.companies = vm.csvFile.split('\n');

      // Remove headers in csv-file.
      vm.companies.shift();

      // Map from array to an object
      vm.companies = vm.companies.map(arrayToObject);
      function arrayToObject(c){
        c = c.split(';');
        return {
          name: c[0],
          foodprefs: c[1],
          gasqueTickets: !c[2] ? 0 : c[2],
          drinkTickets: !c[3] ? 0 : c[3]
        };
      }

      // Filter those who will attend the banquet.
      vm.companies = vm.companies.filter(attendGasque);
      function attendGasque(c){
        return (+c.gasqueTickets) > 0;
      }

      // Print length
      console.log('Companies: ' + vm.companies.length);

      vm.companies.forEach(updateCompanies);   
      function updateCompanies(c){
        vm.allCompanies.forEach(updateCompany);
        function updateCompany(allC){ 
          if(compareStrings(allC.name, c.name)){
            update(allC, c);
          }
        }

        function update(allC, c){
          CompaniesService.get({ companyId: allC._id }, function(company){
            company.gasqueTickets = c.gasqueTickets;
            company.drinkTickets = c.drinkTickets;
            company.$save(successCallback, errorCallback);
          });
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
