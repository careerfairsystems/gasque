(function () {
  'use strict';

  describe('Banquets Route Tests', function () {
    // Initialize global variables
    var $scope,
      BanquetsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _BanquetsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      BanquetsService = _BanquetsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('banquets');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/banquets');
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
          BanquetsController,
          mockBanquet;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('banquets.view');
          $templateCache.put('modules/banquets/client/views/view-banquet.client.view.html', '');

          // create mock Banquet
          mockBanquet = new BanquetsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Banquet Name'
          });

          //Initialize Controller
          BanquetsController = $controller('BanquetsController as vm', {
            $scope: $scope,
            banquetResolve: mockBanquet
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:banquetId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.banquetResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            banquetId: 1
          })).toEqual('/banquets/1');
        }));

        it('should attach an Banquet to the controller scope', function () {
          expect($scope.vm.banquet._id).toBe(mockBanquet._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/banquets/client/views/view-banquet.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          BanquetsController,
          mockBanquet;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('banquets.create');
          $templateCache.put('modules/banquets/client/views/form-banquet.client.view.html', '');

          // create mock Banquet
          mockBanquet = new BanquetsService();

          //Initialize Controller
          BanquetsController = $controller('BanquetsController as vm', {
            $scope: $scope,
            banquetResolve: mockBanquet
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.banquetResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/banquets/create');
        }));

        it('should attach an Banquet to the controller scope', function () {
          expect($scope.vm.banquet._id).toBe(mockBanquet._id);
          expect($scope.vm.banquet._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/banquets/client/views/form-banquet.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          BanquetsController,
          mockBanquet;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('banquets.edit');
          $templateCache.put('modules/banquets/client/views/form-banquet.client.view.html', '');

          // create mock Banquet
          mockBanquet = new BanquetsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Banquet Name'
          });

          //Initialize Controller
          BanquetsController = $controller('BanquetsController as vm', {
            $scope: $scope,
            banquetResolve: mockBanquet
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:banquetId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.banquetResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            banquetId: 1
          })).toEqual('/banquets/1/edit');
        }));

        it('should attach an Banquet to the controller scope', function () {
          expect($scope.vm.banquet._id).toBe(mockBanquet._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/banquets/client/views/form-banquet.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
