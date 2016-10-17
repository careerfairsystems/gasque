(function () {
  'use strict';

  angular
    .module('banquets')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('banquets', {
        abstract: true,
        url: '/banquets',
        template: '<ui-view/>'
      })
      .state('banquets.list', {
        url: '',
        templateUrl: 'modules/banquets/client/views/list-banquets.client.view.html',
        controller: 'BanquetsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Banquets List'
        }
      })
      .state('banquets.create', {
        url: '/create',
        templateUrl: 'modules/banquets/client/views/form-banquet.client.view.html',
        controller: 'BanquetsController',
        controllerAs: 'vm',
        resolve: {
          banquetResolve: newBanquet
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Banquets Create'
        }
      })
      .state('banquets.active', {
        url: '/active',
        templateUrl: 'modules/banquets/client/views/active-banquet.client.view.html',
        controller: 'ActiveBanquetController',
        controllerAs: 'vm',
        resolve: {
          banquetListResolve: getBanquetList
        },
      })
      .state('banquets.edit', {
        url: '/:banquetId/edit',
        templateUrl: 'modules/banquets/client/views/form-banquet.client.view.html',
        controller: 'BanquetsController',
        controllerAs: 'vm',
        resolve: {
          banquetResolve: getBanquet
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Banquet {{ banquetResolve.name }}'
        }
      })
      .state('banquets.view', {
        url: '/:banquetId',
        templateUrl: 'modules/banquets/client/views/view-banquet.client.view.html',
        controller: 'BanquetsController',
        controllerAs: 'vm',
        resolve: {
          banquetResolve: getBanquet
        },
        data:{
          pageTitle: 'Banquet {{ articleResolve.name }}'
        }
      });
  }

  getBanquetList.$inject = ['$stateParams','BanquetsService'];

  function getBanquetList($stateParams, BanquetsService) {
    return BanquetsService.query().$promise;
  }

  getBanquet.$inject = ['$stateParams', 'BanquetsService'];

  function getBanquet($stateParams, BanquetsService) {
    return BanquetsService.get({
      banquetId: $stateParams.banquetId
    }).$promise;
  }

  newBanquet.$inject = ['BanquetsService'];

  function newBanquet(BanquetsService) {
    return new BanquetsService();
  }
})();
