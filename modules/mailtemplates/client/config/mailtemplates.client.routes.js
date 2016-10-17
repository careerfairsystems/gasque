(function () {
  'use strict';

  angular
    .module('mailtemplates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('mailtemplates', {
        abstract: true,
        url: '/mailtemplates',
        template: '<ui-view/>'
      })
      .state('mailtemplates.list', {
        url: '',
        templateUrl: 'modules/mailtemplates/client/views/list-mailtemplates.client.view.html',
        controller: 'MailtemplatesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'Mailtemplates List'
        }
      })
      .state('mailtemplates.bomb', {
        url: '/bomb',
        templateUrl: 'modules/mailtemplates/client/views/bomb-mailtemplates.client.view.html',
        controller: 'MailBombController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'Mailtemplates List'
        }
      })
      .state('mailtemplates.create', {
        url: '/create',
        templateUrl: 'modules/mailtemplates/client/views/form-mailtemplate.client.view.html',
        controller: 'MailtemplatesController',
        controllerAs: 'vm',
        resolve: {
          mailtemplateResolve: newMailtemplate
        },
        data: {
          roles: ['admin'],
          pageTitle : 'Mailtemplates Create'
        }
      })
      .state('mailtemplates.edit', {
        url: '/:mailtemplateId/edit',
        templateUrl: 'modules/mailtemplates/client/views/form-mailtemplate.client.view.html',
        controller: 'MailtemplatesController',
        controllerAs: 'vm',
        resolve: {
          mailtemplateResolve: getMailtemplate
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit Mailtemplate {{ mailtemplateResolve.name }}'
        }
      })
      .state('mailtemplates.view', {
        url: '/:mailtemplateId',
        templateUrl: 'modules/mailtemplates/client/views/view-mailtemplate.client.view.html',
        controller: 'MailtemplatesController',
        controllerAs: 'vm',
        resolve: {
          mailtemplateResolve: getMailtemplate
        },
        data:{
          roles: ['admin'],
          pageTitle: 'Mailtemplate {{ articleResolve.name }}'
        }
      });
  }

  getMailtemplate.$inject = ['$stateParams', 'MailtemplatesService'];

  function getMailtemplate($stateParams, MailtemplatesService) {
    return MailtemplatesService.get({
      mailtemplateId: $stateParams.mailtemplateId
    }).$promise;
  }

  newMailtemplate.$inject = ['MailtemplatesService'];

  function newMailtemplate(MailtemplatesService) {
    return new MailtemplatesService();
  }
})();
