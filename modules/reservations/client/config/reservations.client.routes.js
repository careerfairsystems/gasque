(function () {
  'use strict';

  angular
    .module('reservations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('reservations', {
        abstract: true,
        url: '/reservations',
        template: '<ui-view/>'
      })
      .state('reservations.list', {
        url: '',
        templateUrl: 'modules/reservations/client/views/list-reservations.client.view.html',
        controller: 'ReservationsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Reservations List'
        }
      })
      .state('reservations.nonpaying', {
        url: '/inbjudan',
        templateUrl: 'modules/reservations/client/views/form-reservation.client.view.html',
        controller: 'ReservationsController',
        controllerAs: 'vm',
        resolve: {
          reservationResolve: newReservation
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Make a Reservation',
          isPaying: false,
          creating: true
        }
      })
      .state('reservations.listenrolled', {
        url: '/enrolled',
        templateUrl: 'modules/reservations/client/views/list-enrolled.client.view.html',
        controller: 'EnrolledListController',
        controllerAs: 'vm',
      })
      .state('reservations.paying', {
        url: '/anmalan',
        templateUrl: 'modules/reservations/client/views/form-reservation.client.view.html',
        controller: 'ReservationsController',
        controllerAs: 'vm',
        resolve: {
          reservationResolve: newReservation
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Make a Reservation',
          isPaying: true,
          creating: true
        }
      })
      .state('reservations.edit', {
        url: '/:reservationId/edit',
        templateUrl: 'modules/reservations/client/views/form-reservation.client.view.html',
        controller: 'ReservationsController',
        controllerAs: 'vm',
        resolve: {
          reservationResolve: getReservation
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Reservation {{ reservationResolve.name }}',
          creating: false
        }
      })
      .state('reservations.view', {
        url: '/:reservationId',
        templateUrl: 'modules/reservations/client/views/view-reservation.client.view.html',
        controller: 'ReservationsController',
        controllerAs: 'vm',
        resolve: {
          reservationResolve: getReservation
        },
        data:{
          pageTitle: 'Reservation {{ articleResolve.name }}',
          creating: false
        }
      })
      .state('reservations.thankyou', {
        url: '/thankyou/:reservationId',
        templateUrl: 'modules/reservations/client/views/thankyou.client.view.html',
        controller: 'MailController',
        controllerAs: 'vm',
        resolve: {
          reservationResolve: getReservation
        }
      });
  }

  getReservation.$inject = ['$stateParams', 'ReservationsService'];

  function getReservation($stateParams, ReservationsService) {
    return ReservationsService.get({
      reservationId: $stateParams.reservationId
    }).$promise;
  }

  newReservation.$inject = ['ReservationsService'];

  function newReservation(ReservationsService) {
    return new ReservationsService();
  }
})();
