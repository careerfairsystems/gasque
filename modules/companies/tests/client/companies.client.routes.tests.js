(function () {
  'use strict';

  describe('Companies Route Tests', function () {
    // Initialize global variables
    var $scope,
      CompaniesService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CompaniesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CompaniesService = _CompaniesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('companies');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/companies');
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
          CompaniesController,
          mockCompany;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('companies.view');
          $templateCache.put('modules/companies/client/views/view-company.client.view.html', '');

          // create mock Company
          mockCompany = new CompaniesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Company Name'
          });

          //Initialize Controller
          CompaniesController = $controller('CompaniesController as vm', {
            $scope: $scope,
            companyResolve: mockCompany
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:companyId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.companyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            companyId: 1
          })).toEqual('/companies/1');
        }));

        it('should attach an Company to the controller scope', function () {
          expect($scope.vm.company._id).toBe(mockCompany._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/companies/client/views/view-company.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CompaniesController,
          mockCompany;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('companies.create');
          $templateCache.put('modules/companies/client/views/form-company.client.view.html', '');

          // create mock Company
          mockCompany = new CompaniesService();

          //Initialize Controller
          CompaniesController = $controller('CompaniesController as vm', {
            $scope: $scope,
            companyResolve: mockCompany
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.companyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/companies/create');
        }));

        it('should attach an Company to the controller scope', function () {
          expect($scope.vm.company._id).toBe(mockCompany._id);
          expect($scope.vm.company._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/companies/client/views/form-company.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CompaniesController,
          mockCompany;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('companies.edit');
          $templateCache.put('modules/companies/client/views/form-company.client.view.html', '');

          // create mock Company
          mockCompany = new CompaniesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Company Name'
          });

          //Initialize Controller
          CompaniesController = $controller('CompaniesController as vm', {
            $scope: $scope,
            companyResolve: mockCompany
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:companyId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.companyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            companyId: 1
          })).toEqual('/companies/1/edit');
        }));

        it('should attach an Company to the controller scope', function () {
          expect($scope.vm.company._id).toBe(mockCompany._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/companies/client/views/form-company.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
