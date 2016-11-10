(function () {
  'use strict';

  angular
    .module('tableplannings')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('tableplannings', {
        abstract: true,
        url: '/tableplannings',
        template: '<ui-view/>'
      })
      .state('tableplannings.list', {
        url: '',
        templateUrl: 'modules/tableplannings/client/views/list-tableplannings.client.view.html',
        controller: 'TableplanningsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Tableplannings List'
        }
      })
      .state('tableplannings.export', {
        url: '/:tableplanningId/export',
        templateUrl: 'modules/tableplannings/client/views/export-tableplanning.client.view.html',
        controller: 'ExportTableplanningsController',
        resolve: {
          tableplanningResolve: getTableplanning
        },
        controllerAs: 'vm',
      })
      .state('tableplannings.create', {
        url: '/create',
        templateUrl: 'modules/tableplannings/client/views/form-tableplanning.client.view.html',
        controller: 'TableplanningsController',
        controllerAs: 'vm',
        resolve: {
          tableplanningResolve: newTableplanning
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Tableplannings Create'
        }
      })
      .state('tableplannings.edit', {
        url: '/:tableplanningId/edit',
        templateUrl: 'modules/tableplannings/client/views/form-tableplanning.client.view.html',
        controller: 'TableplanningsController',
        controllerAs: 'vm',
        resolve: {
          tableplanningResolve: getTableplanning
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Tableplanning {{ tableplanningResolve.name }}'
        }
      })
      .state('tableplannings.view', {
        url: '/:tableplanningId',
        templateUrl: 'modules/tableplannings/client/views/form-tableplanning.client.view.html',
        controller: 'TableplanningsController',
        controllerAs: 'vm',
        resolve: {
          tableplanningResolve: getTableplanning
        },
        data:{
          pageTitle: 'Tableplanning {{ articleResolve.name }}'
        }
      });
  }

  getTableplanning.$inject = ['$stateParams', 'TableplanningsService'];

  function getTableplanning($stateParams, TableplanningsService) {
    return TableplanningsService.get({
      tableplanningId: $stateParams.tableplanningId
    }).$promise;
  }

  newTableplanning.$inject = ['TableplanningsService'];

  function newTableplanning(TableplanningsService) {
    return new TableplanningsService();
  }
})();
