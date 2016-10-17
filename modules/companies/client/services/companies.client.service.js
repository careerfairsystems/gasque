//Companies service used to communicate Companies REST endpoints
(function () {
  'use strict';

  angular
    .module('companies')
    .factory('CompaniesService', CompaniesService);

  CompaniesService.$inject = ['$resource'];

  function CompaniesService($resource) {
    return $resource('api/companies/:companyId', {
      companyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      post: {
        method: 'POST'
      }
    });
  }
})();
