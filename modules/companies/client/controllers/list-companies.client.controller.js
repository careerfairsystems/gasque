(function () {
  'use strict';

  angular
    .module('companies')
    .controller('CompaniesListController', CompaniesListController);

  CompaniesListController.$inject = ['CompaniesService'];

  function CompaniesListController(CompaniesService) {
    var vm = this;

    vm.companies = CompaniesService.query();
  }
})();
