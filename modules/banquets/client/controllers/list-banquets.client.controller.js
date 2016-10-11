(function () {
  'use strict';

  angular
    .module('banquets')
    .controller('BanquetsListController', BanquetsListController);

  BanquetsListController.$inject = ['BanquetsService'];

  function BanquetsListController(BanquetsService) {
    var vm = this;

    vm.banquets = BanquetsService.query();
  }
})();
