(function () {
  'use strict';

  // Reservations controller
  angular
    .module('reservations')
    .controller('ReservationsController', ReservationsController);

  ReservationsController.$inject = ['$http','$scope', '$state', 'Authentication', 'reservationResolve', 'CompaniesService', 'BanquetsService'];

  function ReservationsController ($http, $scope, $state, Authentication, reservation, CompaniesService, BanquetsService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.reservation = reservation;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.programs = [];
    vm.isMember = undefined;

    // Check if ispaying
    vm.isPaying = $state.current.data.isPaying;
    console.log('isPaying: ' + vm.isPaying);

    // Get the active banquet and load data.
    BanquetsService.query(function(data){
      function isActive(b){ return b.active; }
      vm.banquet = data.filter(isActive)[0];
      $scope.infoText = vm.isPaying ? vm.banquet.textPaying : vm.banquet.textNonpaying;
    });

    vm.creating = $state.current.data.creating;
    console.log('Creating: ' + vm.creating);

    if(vm.creating){
      vm.titles = [];
      vm.drinkpackages = [];
      vm.reservation.title = {};
      vm.reservation.drinkpackage = {};
      vm.chosenTitle = [];
      vm.chosenDrinkPackage = [];
      vm.laktos = false;
      vm.vegetarian = false;
      vm.vegan = false;
      vm.gluten = false;
    }

    vm.clothings = [
      'Costume',
      'Dress'
    ];

    vm.memberdrinkpackages = [
      ['Non Alcoholic beverages', 0],
      ['Alcoholic beverages', 135]
    ];

    vm.nonmemberdrinkpackages = [
      ['Non Alcoholic beverages', 0],
      ['Alcoholic beverages', 0]
    ];

    if(!vm.isPaying) {
      vm.titles = [
        ['Host Arkad', 0, true],
        ['Coordinator Arkad', 0, true],
        ['PG Arkad', 0, true],
        ['Other invited', 0, true]
      ];
    } else {
      vm.titles= [
        ['Student member of TLTH', 500, true],
        ['Not member of TLTH', 790, false]
      ];
    }


    CompaniesService.query(function (response) {
      vm.companies = response;
      vm.displayCompanies = vm.companies;
      // Get unique programs.
      vm.companies.forEach(function(c) {
        c.desiredProgramme.forEach(function (dp){
          if(vm.programs.indexOf(dp) === -1){
            vm.programs.push(dp);
          }
        });
      });
    });

    $scope.checkValidity = function(resForm) {
      vm.validity = resForm;
      calculatePrice();
      if(vm.validity){
        if(!vm.chosenTitle || vm.chosenTitle.length  <= 0){
          vm.titleError = 'You must select a title';
          return;
        } else {
          vm.titleError = '';
        }
        if(!vm.chosenDrinkPackage || vm.chosenDrinkPackage.length  <= 0){
          vm.drinkError = 'You must select a beverage package';
          return;
        } else {
          vm.drinkError = '';
        }

        var food_arr = [];
        if(vm.laktos)
          food_arr.push('Laktos');
        if(vm.vegetarian)
          food_arr.push('Vegetarian');
        if(vm.vegan)
          food_arr.push('Vegan');
        if(vm.gluten)
          food_arr.push('Gluten');
        vm.reservation.foodpref = food_arr;
        vm.reservation.other = vm.other;
        vm.reservation.title = vm.chosenTitle[0];
        vm.reservation.drinkpackage = vm.chosenDrinkPackage[0];
        $scope.moduleState = 'overview';
      } else {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reservationForm');
      }
    };


    $scope.titleChanged = function() {
      vm.isMember = vm.chosenTitle[2];
    };

    $scope.moduleState = 'form';

    $scope.showOverview = function() {
      calculatePrice();
      var food_arr = [];
      if(vm.laktos)
        food_arr.push('Laktos');
      if(vm.vegetarian)
        food_arr.push('Vegetarian');
      if(vm.vegan)
        food_arr.push('Vegan');
      if(vm.gluten)
        food_arr.push('Gluten');
      vm.reservation.foodpref = food_arr;
      vm.reservation.other = vm.other;
      $scope.moduleState = 'overview';
    };

    $scope.showForm = function() {
      $scope.moduleState = 'form';
    };

    $scope.submitForm = function() {
      save(vm.validity);
    };

    function calculatePrice(){
      vm.reservation.price = vm.chosenTitle[1] + vm.chosenDrinkPackage[1];
      console.log(vm.reservation.price);
    }

    // Remove existing Reservation
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.reservation.$remove($state.go('reservations.list'));
      }
    }

    // Save Reservation
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reservationForm');
        return false;
      }

      // TODO: move create/update logic to service

      console.log(vm.reservation);

      vm.reservation.title = vm.chosenTitle[0];
      vm.reservation.drinkpackage = vm.chosenDrinkPackage[0];
      if (vm.reservation._id) {
        vm.reservation.$update(successCallback, errorCallback);
      } else {
        vm.reservation.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('reservations.thankyou', {
          reservationId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
