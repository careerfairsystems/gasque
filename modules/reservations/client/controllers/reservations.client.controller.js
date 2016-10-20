(function () {
  'use strict';

  // Reservations controller
  angular
    .module('reservations')
    .controller('ReservationsController', ReservationsController);

  ReservationsController.$inject = ['$http','$scope', '$state', 'Authentication', 'reservationResolve', 'ProgramsService', 'BanquetsService', '$sce'];

  function ReservationsController ($http, $scope, $state, Authentication, reservation, ProgramsService, BanquetsService, $sce) {
    var vm = this;

    
    // Ugly fix to prevent explorer to fail.
    if (!Array.from) {
      Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
          return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
          var number = Number(value);
          if (isNaN(number)) { return 0; }
          if (number === 0 || !isFinite(number)) { return number; }
          return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
          var len = toInteger(value);
          return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
          // 1. Let C be the this value.
          var C = this;

          // 2. Let items be ToObject(arrayLike).
          var items = Object(arrayLike);

          // 3. ReturnIfAbrupt(items).
          if (arrayLike == null) {
            throw new TypeError("Array.from requires an array-like object - not null or undefined");
          }

          // 4. If mapfn is undefined, then let mapping be false.
          var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
          var T;
          if (typeof mapFn !== 'undefined') {
            // 5. else
            // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
            if (!isCallable(mapFn)) {
              throw new TypeError('Array.from: when provided, the second argument must be a function');
            }

            // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 2) {
              T = arguments[2];
            }
          }

          // 10. Let lenValue be Get(items, "length").
          // 11. Let len be ToLength(lenValue).
          var len = toLength(items.length);

          // 13. If IsConstructor(C) is true, then
          // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
          // 14. a. Else, Let A be ArrayCreate(len).
          var A = isCallable(C) ? Object(new C(len)) : new Array(len);

          // 16. Let k be 0.
          var k = 0;
          // 17. Repeat, while k < len… (also steps a - h)
          var kValue;
          while (k < len) {
            kValue = items[k];
            if (mapFn) {
              A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
            } else {
              A[k] = kValue;
            }
            k += 1;
          }
          // 18. Let putStatus be Put(A, "length", len, true).
          A.length = len;
          // 20. Return A.
          return A;
        };
      }());
    }


    
    

    vm.authentication = Authentication;
    vm.reservation = reservation;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.isMember = undefined;

    // Check if ispaying
    vm.isPaying = $state.current.data.isPaying;
    console.log('isPaying: ' + vm.isPaying);

    // Get the active banquet and load data.
    BanquetsService.query(function(data){
      function isActive(b){ return b.active; }
      vm.banquet = data.filter(isActive)[0];
      $scope.infoText = vm.isPaying ? vm.banquet.textPaying : vm.banquet.textNonpaying;
      $scope.infoText = $scope.infoText.replace(/(?:\r\n|\r|\n)/g, '<br />');
      $scope.infoTextHtml = $sce.trustAsHtml($scope.infoText);
    });

    vm.creating = $state.current.data.creating;
    console.log('Creating: ' + vm.creating);

    if(vm.creating){
      vm.titles = [];
      vm.drinkpackages = [];
      vm.reservation.membership = {};
      vm.reservation.drinkpackage = {};
      vm.chosenMembership = [];
      vm.chosenDrinkPackage = [];
      vm.laktos = false;
      vm.vegetarian = false;
      vm.vegan = false;
      vm.gluten = false;
    }

    vm.clothings = [
      'Suit',
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

    // Get all programs
    var programsSet = new Set(ProgramsService);
    vm.programs = Array.from(programsSet);
    vm.programs.unshift('Non-Student', 'Other');

    $scope.checkValidity = function(resForm) {
      vm.validity = resForm;
      calculatePrice();
      if(vm.validity){
        if(!vm.chosenMembership || vm.chosenMembership.length <= 0){
          vm.titleError = 'You must select Price and Membership';
          return;
        } else {
          vm.titleError = '';
        }
        if(!vm.chosenDrinkPackage || vm.chosenDrinkPackage.length <= 0){
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
        vm.reservation.membership = vm.chosenMembership[0];
        vm.reservation.drinkpackage = vm.chosenDrinkPackage[0];
        $scope.moduleState = 'overview';
      } else {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reservationForm');
      }
    };


    $scope.titleChanged = function() {
      vm.isMember = vm.chosenMembership[2];
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
      vm.reservation.price = vm.chosenMembership[1] + vm.chosenDrinkPackage[1];
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

      vm.reservation.membership = vm.chosenMembership[0];
      vm.reservation.ocr = (new Date()).getTime();
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
