(function () {
  'use strict';

  angular
    .module('mailtemplates')
    .controller('MailBombController', MailBombController);

  MailBombController.$inject = ['MailtemplatesService', 'ArkadeventsService', 'ReservationsService', '$http', '$sce', '$scope'];

  function MailBombController(MailtemplatesService, ArkadeventsService, ReservationsService, $http, $sce, $scope) {
    var vm = this;

    vm.mailtemplates = MailtemplatesService.query();
    vm.arkadevents = ArkadeventsService.query();
    vm.allReservations = ReservationsService.query();

    vm.chooseEvent = function (index){
      vm.arkadevent = vm.arkadevents[index];
      vm.currEvent = index;
      vm.reservations = vm.allReservations.filter(onEvent);
      function onEvent(r){ return r.arkadevent === vm.arkadevent._id; }
      vm.reservations = vm.reservations.filter(isEnrolled);
      function isEnrolled(r){ return r.enrolled; }
    };

    vm.chooseTemplate = function (index){
      vm.template = vm.mailtemplates[index];
      vm.currTemplate = index;
    };

    vm.sendEmails = function(){

      vm.reservations.forEach(sendEmail);
      function sendEmail(reservation){
        $scope.success = '';
        $scope.error = '';

        $http.post('/api/mailtemplates/send/email', { mailtemplate: vm.template._id, arkadevent: vm.arkadevent._id, reservation: reservation._id }).success(function (response) {
          $scope.success = $sce.trustAsHtml($scope.success + 'Succesfully send mail.<br />');
        }).error(function (response) {
          $scope.error = $sce.trustAsHtml($scope.error + 'Failed to send mail: ' + response.message + '<br />');
        });
      }
    };

  }
})();
