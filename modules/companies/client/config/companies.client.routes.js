(function () {
  'use strict';

  angular
    .module('companies')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('companies', {
        abstract: true,
        url: '/companies',
        template: '<ui-view/>'
      })
      .state('companies.multiple', {
        url: '/multiple',
        templateUrl: 'modules/companies/client/views/multiple-companies.client.view.html',
        controller: 'CompaniesMultipleController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Companies List'
        }
      })
      .state('companies.list', {
        url: '',
        templateUrl: 'modules/companies/client/views/list-companies.client.view.html',
        controller: 'CompaniesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Companies List'
        }
      })
      .state('companies.loadtickets', {
        url: '/loadtickets',
        templateUrl: 'modules/companies/client/views/load-tickets.client.view.html',
        controller: 'CompaniesTicketsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
        }
      })
      .state('companies.create', {
        url: '/create',
        templateUrl: 'modules/companies/client/views/form-company.client.view.html',
        controller: 'CompaniesController',
        controllerAs: 'vm',
        resolve: {
          companyResolve: newCompany
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Companies Create'
        }
      })
      .state('companies.edit', {
        url: '/:companyId/edit',
        templateUrl: 'modules/companies/client/views/form-company.client.view.html',
        controller: 'CompaniesController',
        controllerAs: 'vm',
        resolve: {
          companyResolve: getCompany
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Company {{ companyResolve.name }}'
        }
      })
      .state('companies.view', {
        url: '/:companyId',
        templateUrl: 'modules/companies/client/views/view-company.client.view.html',
        controller: 'CompaniesController',
        controllerAs: 'vm',
        resolve: {
          companyResolve: getCompany
        },
        data:{
          pageTitle: 'Company {{ articleResolve.name }}'
        }
      });
  }

  getCompany.$inject = ['$stateParams', 'CompaniesService'];

  function getCompany($stateParams, CompaniesService) {
    return CompaniesService.get({
      companyId: $stateParams.companyId
    }).$promise;
  }

  newCompany.$inject = ['CompaniesService'];

  function newCompany(CompaniesService) {
    return new CompaniesService();
  }
})();
