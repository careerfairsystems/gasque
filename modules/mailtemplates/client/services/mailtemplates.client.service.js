//Mailtemplates service used to communicate Mailtemplates REST endpoints
(function () {
  'use strict';

  angular
    .module('mailtemplates')
    .factory('MailtemplatesService', MailtemplatesService);

  MailtemplatesService.$inject = ['$resource'];

  function MailtemplatesService($resource) {
    return $resource('api/mailtemplates/:mailtemplateId', {
      mailtemplateId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
