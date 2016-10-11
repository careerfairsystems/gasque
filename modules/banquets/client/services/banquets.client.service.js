//Banquets service used to communicate Banquets REST endpoints
(function () {
  'use strict';

  angular
    .module('banquets')
    .factory('BanquetsService', BanquetsService);

  BanquetsService.$inject = ['$resource'];

  function BanquetsService($resource) {
    return $resource('api/banquets/:banquetId', {
      banquetId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
