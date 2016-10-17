/* global $:false */
(function () {
  'use strict';

  angular
    .module('companies')
    .controller('CompaniesMultipleController', CompaniesMultipleController);

  CompaniesMultipleController.$inject = ['$scope', 'CompaniesService', '$http'];

  function CompaniesMultipleController($scope, CompaniesService, $http) {
    var vm = this;


    vm.companies = CompaniesService.query();
    vm.companyUrl = 'http://dv.jexpo.se/exhibitors?namespace=arkad_test&limit=0&sort=name';

    vm.fetchedCompanies = [];
    
    $scope.fetchJson = function(){
      var file = $('input[type=file]')[0].files[0];

      var fr = new FileReader();
      function receivedText() {
        console.log(vm.fetchedCompanies);
        vm.fetchedCompanies = JSON.parse(fr.result);
        console.log(vm.fetchedCompanies);
      }   
      fr.onload = receivedText;
      fr.readAsText(file);
    };



    $('#upload').change(function(evt, params){
      console.log(JSON.stringify(evt));
    });
  
    $scope.fileSelected = function(evt, params) {
      console.log(evt); 
      console.log(params); 
      console.log(vm.file); 
    };
  

    $scope.fetchCompanies = function() {
      if(!vm.companyUrl.length || vm.companyUrl.length < 3){
        vm.urlError = 'Please fill in a url';
        return;
      }
      $http({
        method: 'GET',
        url: vm.companyUrl
      }).then(function successCallback(response) {
        console.log(response);
        vm.fetchedCompanies = response.data;
        vm.msg = 'Successfully loaded ' + response.data.length + ' companies';
      }, function errorCallback(response) {
        console.log(response);
        vm.error = response;
      });
    };

    // Be careful, quite strong method.
    $scope.deleteCompanies = function removeAllOldCompanies() {
      vm.companies.forEach(function (c){
        var comp = new CompaniesService(c);
        comp.$delete();
      });
      vm.msg = 'Deleted ALL companies, hurray!';
    };

    // Maps program names in different languages among the current
    function mappedPrograms(companiesDesired) {
      if(companiesDesired === undefined) {
        return [];
      }

      var desiredPrograms = []; 
      var programs = ['Civil Engineering - Architecture',
                  'Architect',
                  'Arkitekt',
                  'Biomedical Engineering',
                  'Biotechnology',
                  'Bioteknik',
                  'Chemical Engineering',
                  'Kemiteknik',
                  'Fire Protection Engineering',
                  'Brandingenjörsutbildning',
                  'Byggteknik med arkitektur',
                  'Byggteknik med järnvägsteknik',
                  'Civil Engineering - Railway Construction',
                  'Byggteknik med väg- och trafikteknik',
                  'Civil Engineering- Road and Traffic Technology',
                  'Väg- och vatttenbyggnad',
                  'Civil Engineering',
                  'Computer Science and Engineering',
                  'Datateknik',
                  'Information and Communication Engineering',
                  'Informations- och kommunikationsteknik',
                  'Ekosystemteknik',
                  'Electrical Engineering',
                  'Elektroteknik',
                  'Engineering Mathematics',
                  'Engineering Nanoscience',
                  'Engineering Physics',
                  'Teknisk Matematik',
                  'Teknisk Fysik',
                  'Teknisk Nanovetenskap',
                  'Environmental Engineering',
                  'Industrial Design',
                  'Industrial Engineering and Management',
                  'Industridesign',
                  'Industriell ekonomi',
                  'Lantmäteri',
                  'Maskinteknik med teknisk design',
                  'Mechanical Engineering with Industrial Design',
                  'Maskinteknik',
                  'Mechanical Engineering',
                  'Medicin och teknik',
                  'Surveying'];

      var toShow = ['Byggteknik med arkitektur / Civil Engineering - Architecture',
                  'Arkitekt / Architect',
                  'Arkitekt / Architect',
                  'Medicin och teknik / Biomedical Engineering',
                  'Bioteknik / Biotechnology',
                  'Bioteknik / Biotechnology',                  
                  'Kemiteknik / Chemical Engineering',
                  'Kemiteknik / Chemical Engineering',
                  'Brandingenjörsutbildning / Fire Protection Engineering',
                  'Brandingenjörsutbildning / Fire Protection Engineering',
                  'Byggteknik med arkitektur / Civil Engineering - Architecture',
                  'Byggteknik med järnvägsteknik / Civil Engineering - Railway Construction',
                  'Byggteknik med järnvägsteknik / Civil Engineering - Railway Construction',
                  'Civil Engineering- Road and Traffic Technology / Civil Engineering- Road and Traffic Technology',
                  'Civil Engineering- Road and Traffic Technology / Civil Engineering- Road and Traffic Technology',
                  'Väg- och vattenbyggnad / Civil Engineering',
                  'Väg- och vattenbyggnad / Civil Engineering',
                  'Datateknik / Computer Science and Engineering',
                  'Datateknik / Computer Science and Engineering',
                  'Informations- och kommunikationsteknik / Information and Communication Engineering',
                  'Informations- och kommunikationsteknik / Information and Communication Engineering',
                  'Ekosystemteknik / Environmental Engineering',
                  'Elektroteknik / Electrical Engineering',
                  'Elektroteknik / Electrical Engineering',
                  'Teknisk Matematik / Engineering Mathematics',
                  'Teknisk Nanovetenskap / Engineering Nanoscience',
                  'Teknisk Fysik / Engineering Physics',
                  'Teknisk Matematik / Engineering Mathematics',
                  'Teknisk Fysik / Engineering Physics',
                  'Teknisk Nanovetenskap / Engineering Nanoscience',
                  'Ekosystemteknik / Environmental Engineering',
                  'Industridesign / Industrial Design',
                  'Industriell ekonomi / Industrial Engineering and Management',
                  'Industridesign / Industrial Design',
                  'Industriell ekonomi / Industrial Engineering and Management',
                  'Lantmäteri / Surveying',
                  'Maskinteknik med teknisk design / Mechanical Engineering with Industrial Design',
                  'Maskinteknik med teknisk design / Mechanical Engineering with Industrial Design',
                  'Maskinteknik / Mechanical Engineering',
                  'Maskinteknik / Mechanical Engineering',
                  'Medicin och teknik / Biomedical Engineering',
                  'Lantmäteri / Surveying'];


      for(var i = 0; i < companiesDesired.length; i++) {
        var programIndex = programs.indexOf(companiesDesired[i]);
        if(programIndex > -1) {
          desiredPrograms.push(toShow[programIndex]);
        }
      }

      return desiredPrograms;
    }

    // Be careful, quite strong method.
    $scope.saveFetchedCompanies = function saveFetchedCompanies() {
      
      // JS sucks, no good check of objects attribute in array, so i map here.
      var cName = [];
      vm.companies.forEach(function (c){
        cName.push(c.name);
      });      

      function successCallback (response){
        console.log('Success!');
      }
      function errorCallback (response){
        console.log('Error!');
        vm.msg = 'Error occurred when saving companies, contact IT';
      }
      vm.fetchedCompanies.forEach(function(fc){
        // Check that company doesnt already exist. Assumes unique name.
        if(cName.indexOf(fc.name) < 0){
          CompaniesService.post({ name: fc.name, desiredProgramme: mappedPrograms(fc.profile.desiredProgramme) }, successCallback);
        }
      });
      vm.msg = 'Successfully saved all fetched companies'; 
    };
  }
})();
