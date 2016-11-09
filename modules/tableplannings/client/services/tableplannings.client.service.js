//Tableplannings service used to communicate Tableplannings REST endpoints
(function () {
  'use strict';

  angular
    .module('tableplannings')
    .factory('TableplanningsService', TableplanningsService);

  TableplanningsService.$inject = ['$resource'];

  function TableplanningsService($resource) {
    return $resource('api/tableplannings/:tableplanningId', {
      tableplanningId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      post: {
        method: 'POST'
      },
      save: {
        method: 'PUT'
      },
      create: {
        method: 'POST'
      }
    });
  }
})();
