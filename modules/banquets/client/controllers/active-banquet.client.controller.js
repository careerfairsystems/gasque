(function () {
  'use strict';

  angular
    .module('banquets')
    .controller('ActiveBanquetController', ActiveBanquetController);

  ActiveBanquetController.$inject = ['BanquetsService', 'banquetListResolve', '$scope', '$location', '$anchorScroll'];

  function ActiveBanquetController(BanquetsService, banquets, $scope, $location, $anchorScroll) {
    var vm = this;
    vm.banquets = banquets;
//    vm.banquets = BanquetsService.query();

//    $scope.gotoSelected = function() {
      // set the location.hash to the id of
      // the element you wish to scroll to.
//      $location.hash('banquet');

      // call $anchorScroll()
//      $anchorScroll();
//    };

    $scope.viewBanquet = function(banquet) {
      $scope.banquet = banquet; // Banquet is the selected one.
//      $scope.gotoSelected();
    };

    $scope.setActive = function(banquet) {
      angular.forEach(banquets, function(b) {
        if(banquet.name === b.name) {
          b.active = true;
          BanquetsService.update(b);
        } else {
          b.active = false;
          BanquetsService.update(b);
        }
      });
    };
  }
})();
