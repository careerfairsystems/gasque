(function () {
  'use strict';

  angular
    .module('mailtemplates')
    .controller('MailtemplatesListController', MailtemplatesListController);

  MailtemplatesListController.$inject = ['MailtemplatesService'];

  function MailtemplatesListController(MailtemplatesService) {
    var vm = this;

    vm.mailtemplates = MailtemplatesService.query();
  }
})();
