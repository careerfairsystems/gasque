(function () {
  'use strict';

  // Mailtemplates controller
  angular
    .module('mailtemplates')
    .controller('MailtemplatesController', MailtemplatesController);

  MailtemplatesController.$inject = ['$scope', '$state', 'Authentication', 'mailtemplateResolve'];

  function MailtemplatesController ($scope, $state, Authentication, mailtemplate) {
    var vm = this;

    vm.authentication = Authentication;
    vm.mailtemplate = mailtemplate;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Mailtemplate
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.mailtemplate.$remove($state.go('mailtemplates.list'));
      }
    }

    // Save Mailtemplate
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.mailtemplateForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.mailtemplate._id) {
        vm.mailtemplate.$update(successCallback, errorCallback);
      } else {
        vm.mailtemplate.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('mailtemplates.view', {
          mailtemplateId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
