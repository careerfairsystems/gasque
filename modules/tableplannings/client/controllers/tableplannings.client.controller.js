(function () {
  'use strict';

  // Tableplannings controller
  angular
    .module('tableplannings')
    .controller('TableplanningsController', TableplanningsController);

  TableplanningsController.$inject = ['$scope', '$state', 'Authentication', 'tableplanningResolve'];

  function TableplanningsController ($scope, $state, Authentication, tableplanning) {
    var vm = this;

    vm.authentication = Authentication;
    vm.tableplanning = tableplanning;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Tableplanning
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.tableplanning.$remove($state.go('tableplannings.list'));
      }
    }

    // Save Tableplanning
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tableplanningForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tableplanning._id) {
        vm.tableplanning.$update(successCallback, errorCallback);
      } else {
        vm.tableplanning.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tableplannings.view', {
          tableplanningId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
