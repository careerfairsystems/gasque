(function () {
  'use strict';

  // Banquets controller
  angular
    .module('banquets')
    .controller('BanquetsController', BanquetsController)
    .controller('dateCtrler', ['$scope',
      function ($scope) {
        $scope.open = function($event) {
          $event.preventDefault();
          $event.stopPropagation();

          $scope.opened = true;
        };

        $scope.dateOptions = {
          formatYear: 'yy',
          startingDay: 0
        };

        $scope.formats = ['yyyy-MM-dd', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

      }
  ])
  .directive('datepickerLocaldate', ['$parse', function ($parse) {
    var directive = {
      restrict: 'A',
      require: ['ngModel'],
      link: link
    };
    return directive;

    function link(scope, element, attr, ctrls) {
      var ngModelController = ctrls[0];

        // called with a JavaScript Date object when picked from the datepicker
      ngModelController.$parsers.push(function (viewValue) {
        console.log(viewValue);console.log(viewValue);console.log(viewValue);
            // undo the timezone adjustment we did during the formatting
        viewValue.setMinutes(viewValue.getMinutes() - viewValue.getTimezoneOffset());
            // we just want a local date in ISO format
        return viewValue.toISOString().substring(0, 10);
      });
    }
  }]);

  BanquetsController.$inject = ['$scope', '$state', 'Authentication', 'banquetResolve', 'MailtemplatesService'];

  function BanquetsController ($scope, $state, Authentication, banquet, MailtemplatesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.banquet = banquet;
    vm.banquet.starttime = new Date(vm.banquet.starttime);
    vm.banquet.endtime = new Date(vm.banquet.endtime);
    vm.banquet.date = new Date(vm.banquet.date);
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.mailtemplates = MailtemplatesService.query();
    $scope.thankyou = vm.banquet.thankyoumail;
    $scope.reserv = vm.banquet.reservmail;
    $scope.paymentreceived = vm.banquet.paymentreceivedmail;
    $scope.paymentinformation = vm.banquet.paymentinformationmail;
    $scope.unregistered = vm.banquet.unregisteredmail;
    $scope.seatoffered = vm.banquet.seatofferedmail;

    // Remove existing Banquet
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.banquet.$remove($state.go('banquets.list'));
      }
    }

    // Save Banquet
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.banquetForm');
        return false;
      }

      if($scope.thankyou){
        vm.banquet.thankyoumail = $scope.thankyou;
      }
      if($scope.reserv){
        vm.banquet.reservmail = $scope.reserv;
      }
      if($scope.paymentreceived){
        vm.banquet.paymentreceivedmail = $scope.paymentreceived;
      }
      if($scope.paymentinformation){
        vm.banquet.paymentinformationmail = $scope.paymentinformation;
      }
      if($scope.unregistered){
        vm.banquet.unregisteredmail = $scope.unregistered;
      }
      if($scope.seatoffered){
        vm.banquet.seatofferedmail = $scope.seatoffered;
      }

      vm.banquet.seatsLeft = vm.banquet.capacity - vm.seatsTaken - vm.banquet.companyrepresentatives;

      // TODO: move create/update logic to service
      if (vm.banquet._id) {
        vm.banquet.$update(successCallback, errorCallback);
      } else {
        vm.banquet.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('banquets.view', {
          banquetId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
