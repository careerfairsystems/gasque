(function () {
  'use strict';

  describe('Tableplannings Route Tests', function () {
    // Initialize global variables
    var $scope,
      TableplanningsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _TableplanningsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      TableplanningsService = _TableplanningsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('tableplannings');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/tableplannings');
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
          TableplanningsController,
          mockTableplanning;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('tableplannings.view');
          $templateCache.put('modules/tableplannings/client/views/view-tableplanning.client.view.html', '');

          // create mock Tableplanning
          mockTableplanning = new TableplanningsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Tableplanning Name'
          });

          //Initialize Controller
          TableplanningsController = $controller('TableplanningsController as vm', {
            $scope: $scope,
            tableplanningResolve: mockTableplanning
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:tableplanningId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.tableplanningResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            tableplanningId: 1
          })).toEqual('/tableplannings/1');
        }));

        it('should attach an Tableplanning to the controller scope', function () {
          expect($scope.vm.tableplanning._id).toBe(mockTableplanning._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/tableplannings/client/views/view-tableplanning.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          TableplanningsController,
          mockTableplanning;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('tableplannings.create');
          $templateCache.put('modules/tableplannings/client/views/form-tableplanning.client.view.html', '');

          // create mock Tableplanning
          mockTableplanning = new TableplanningsService();

          //Initialize Controller
          TableplanningsController = $controller('TableplanningsController as vm', {
            $scope: $scope,
            tableplanningResolve: mockTableplanning
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.tableplanningResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/tableplannings/create');
        }));

        it('should attach an Tableplanning to the controller scope', function () {
          expect($scope.vm.tableplanning._id).toBe(mockTableplanning._id);
          expect($scope.vm.tableplanning._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/tableplannings/client/views/form-tableplanning.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          TableplanningsController,
          mockTableplanning;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('tableplannings.edit');
          $templateCache.put('modules/tableplannings/client/views/form-tableplanning.client.view.html', '');

          // create mock Tableplanning
          mockTableplanning = new TableplanningsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Tableplanning Name'
          });

          //Initialize Controller
          TableplanningsController = $controller('TableplanningsController as vm', {
            $scope: $scope,
            tableplanningResolve: mockTableplanning
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:tableplanningId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.tableplanningResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            tableplanningId: 1
          })).toEqual('/tableplannings/1/edit');
        }));

        it('should attach an Tableplanning to the controller scope', function () {
          expect($scope.vm.tableplanning._id).toBe(mockTableplanning._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/tableplannings/client/views/form-tableplanning.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
