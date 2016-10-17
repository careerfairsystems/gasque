(function () {
  'use strict';

  describe('Mailtemplates Route Tests', function () {
    // Initialize global variables
    var $scope,
      MailtemplatesService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MailtemplatesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MailtemplatesService = _MailtemplatesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('mailtemplates');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/mailtemplates');
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
          MailtemplatesController,
          mockMailtemplate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('mailtemplates.view');
          $templateCache.put('modules/mailtemplates/client/views/view-mailtemplate.client.view.html', '');

          // create mock Mailtemplate
          mockMailtemplate = new MailtemplatesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Mailtemplate Name'
          });

          //Initialize Controller
          MailtemplatesController = $controller('MailtemplatesController as vm', {
            $scope: $scope,
            mailtemplateResolve: mockMailtemplate
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:mailtemplateId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.mailtemplateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            mailtemplateId: 1
          })).toEqual('/mailtemplates/1');
        }));

        it('should attach an Mailtemplate to the controller scope', function () {
          expect($scope.vm.mailtemplate._id).toBe(mockMailtemplate._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/mailtemplates/client/views/view-mailtemplate.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          MailtemplatesController,
          mockMailtemplate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('mailtemplates.create');
          $templateCache.put('modules/mailtemplates/client/views/form-mailtemplate.client.view.html', '');

          // create mock Mailtemplate
          mockMailtemplate = new MailtemplatesService();

          //Initialize Controller
          MailtemplatesController = $controller('MailtemplatesController as vm', {
            $scope: $scope,
            mailtemplateResolve: mockMailtemplate
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.mailtemplateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/mailtemplates/create');
        }));

        it('should attach an Mailtemplate to the controller scope', function () {
          expect($scope.vm.mailtemplate._id).toBe(mockMailtemplate._id);
          expect($scope.vm.mailtemplate._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/mailtemplates/client/views/form-mailtemplate.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          MailtemplatesController,
          mockMailtemplate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('mailtemplates.edit');
          $templateCache.put('modules/mailtemplates/client/views/form-mailtemplate.client.view.html', '');

          // create mock Mailtemplate
          mockMailtemplate = new MailtemplatesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Mailtemplate Name'
          });

          //Initialize Controller
          MailtemplatesController = $controller('MailtemplatesController as vm', {
            $scope: $scope,
            mailtemplateResolve: mockMailtemplate
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:mailtemplateId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.mailtemplateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            mailtemplateId: 1
          })).toEqual('/mailtemplates/1/edit');
        }));

        it('should attach an Mailtemplate to the controller scope', function () {
          expect($scope.vm.mailtemplate._id).toBe(mockMailtemplate._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/mailtemplates/client/views/form-mailtemplate.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
