(function () {
  'use strict';

  describe('Tableplannings Controller Tests', function () {
    // Initialize global variables
    var TableplanningsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      TableplanningsService,
      mockTableplanning;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _TableplanningsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      TableplanningsService = _TableplanningsService_;

      // create mock Tableplanning
      mockTableplanning = new TableplanningsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Tableplanning Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Tableplannings controller.
      TableplanningsController = $controller('TableplanningsController as vm', {
        $scope: $scope,
        tableplanningResolve: {}
      });

      //Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleTableplanningPostData;

      beforeEach(function () {
        // Create a sample Tableplanning object
        sampleTableplanningPostData = new TableplanningsService({
          name: 'Tableplanning Name'
        });

        $scope.vm.tableplanning = sampleTableplanningPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (TableplanningsService) {
        // Set POST response
        $httpBackend.expectPOST('api/tableplannings', sampleTableplanningPostData).respond(mockTableplanning);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Tableplanning was created
        expect($state.go).toHaveBeenCalledWith('tableplannings.view', {
          tableplanningId: mockTableplanning._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/tableplannings', sampleTableplanningPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Tableplanning in $scope
        $scope.vm.tableplanning = mockTableplanning;
      });

      it('should update a valid Tableplanning', inject(function (TableplanningsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/tableplannings\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('tableplannings.view', {
          tableplanningId: mockTableplanning._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (TableplanningsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/tableplannings\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        //Setup Tableplannings
        $scope.vm.tableplanning = mockTableplanning;
      });

      it('should delete the Tableplanning and redirect to Tableplannings', function () {
        //Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/tableplannings\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('tableplannings.list');
      });

      it('should should not delete the Tableplanning and not redirect', function () {
        //Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
