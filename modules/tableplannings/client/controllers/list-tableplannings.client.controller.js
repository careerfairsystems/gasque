(function () {
  'use strict';

  angular
    .module('tableplannings')
    .controller('TableplanningsListController', TableplanningsListController);

  TableplanningsListController.$inject = ['TableplanningsService'];

  function TableplanningsListController(TableplanningsService) {
    var vm = this;

    vm.tableplannings = TableplanningsService.query();
  }
})();
