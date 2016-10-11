(function () {
  'use strict';

  describe('Reservations Route Tests', function () {
    // Initialize global variables
    var $scope,
      ReservationsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ReservationsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ReservationsService = _ReservationsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('reservations');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/reservations');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          ReservationsController,
          mockReservation;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('reservations.view');
          $templateCache.put('modules/reservations/client/views/view-reservation.client.view.html', '');

          // create mock Reservation
          mockReservation = new ReservationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Reservation Name'
          });

          //Initialize Controller
          ReservationsController = $controller('ReservationsController as vm', {
            $scope: $scope,
            reservationResolve: mockReservation
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:reservationId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.reservationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            reservationId: 1
          })).toEqual('/reservations/1');
        }));

        it('should attach an Reservation to the controller scope', function () {
          expect($scope.vm.reservation._id).toBe(mockReservation._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/reservations/client/views/view-reservation.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ReservationsController,
          mockReservation;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('reservations.create');
          $templateCache.put('modules/reservations/client/views/form-reservation.client.view.html', '');

          // create mock Reservation
          mockReservation = new ReservationsService();

          //Initialize Controller
          ReservationsController = $controller('ReservationsController as vm', {
            $scope: $scope,
            reservationResolve: mockReservation
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.reservationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/reservations/create');
        }));

        it('should attach an Reservation to the controller scope', function () {
          expect($scope.vm.reservation._id).toBe(mockReservation._id);
          expect($scope.vm.reservation._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/reservations/client/views/form-reservation.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ReservationsController,
          mockReservation;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('reservations.edit');
          $templateCache.put('modules/reservations/client/views/form-reservation.client.view.html', '');

          // create mock Reservation
          mockReservation = new ReservationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Reservation Name'
          });

          //Initialize Controller
          ReservationsController = $controller('ReservationsController as vm', {
            $scope: $scope,
            reservationResolve: mockReservation
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:reservationId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.reservationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            reservationId: 1
          })).toEqual('/reservations/1/edit');
        }));

        it('should attach an Reservation to the controller scope', function () {
          expect($scope.vm.reservation._id).toBe(mockReservation._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/reservations/client/views/form-reservation.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
