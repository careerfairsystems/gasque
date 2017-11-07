/* global $:false */
(function () {
  'use strict';

  angular
    .module('reservations')
    .controller('ReservationsListController', ReservationsListController);

  ReservationsListController.$inject = ['ReservationsService', '$stateParams', '$state', '$filter', '$scope', '$compile', '$http'];

  function ReservationsListController(ReservationsService, $stateParams, $state, $filter, $scope, $compile, $http) {
    var vm = this;

    $http.get('/api/reservations/enrolled')
    .then(function(response) {
      //get enrolled reservations
      function isEnrolled(r){ return r.enrolled; }
      vm.reservations = response.data.data.filter(isEnrolled);

      angular.forEach(vm.reservations, function(reservation, key) {
        reservation.nr = 1 + key;
        reservation.date = $filter('date')(reservation.created, 'yyyy-MM-dd HH:MM:ss');
        reservation.enrolled = reservation.enrolled || false;
        reservation.confirmed = reservation.confirmed || false;
        reservation.program = reservation.program || '';
        reservation.membership = reservation.membership || '';
        reservation.title = reservation.title || '';
        reservation.other = reservation.other || '';
        reservation.unregister = !reservation.enrolled && !reservation.reserve && !reservation.payed;
      });

      // Datatable code
      // Setup - add a text input to each footer cell
      $('#reservationsList thead tr:first th:not(:first)').each(function (index) {
        var title = $(this).text();
        var pos = index + 1;
        $(this).html('<input class="form-control" id="col-search-'+pos+'" type="text" placeholder="Search '+title+'" />');
      });

      vm.createDatatable(vm.reservations);
    });

    // Show message in 10 sec
    vm.showMessage = function (message){
      $scope.message = message;
      setTimeout(function(){ 
        $scope.message = undefined; 
        $scope.$apply();
      }, 10000);
    };

    vm.openReservation = function(index) {
      vm.currentIndex = index;
      var current = vm.reservations[index];
      $state.go('reservations.view', { reservationId: current._id });
    };

    // Init datatable
    vm.createDatatable = function(data){
      vm.table = $('#reservationsList').DataTable({
        dom: 'Bfrtip',
        scrollX: true,
        scrollCollapse: true,
        autoWidth: false,
        paging: false,
        stateSave: true,
        buttons: ['copy', 'excel', 'pdf', 'colvis'],
        data: data,
        'order': [[ 1, 'asc' ]],
        columns: [
          { data: 'nr' },
          { data: 'date' },
          { data: 'name',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<button class="btn-link" data-ng-click="vm.openReservation('+ iRow+')">'+sData+'</button>');
              // VIKTIG: för att ng-click ska kompileras och finnas.
              $compile(nTd)($scope);
            }
          },
          { data: 'program' },
          { data: 'title' },
          { data: 'membership' },
          { data: 'price' },
          { data: 'email' },
          { data: 'phone' },
          { data: 'foodpref' },
          { data: 'drinkpackage' },
          { data: 'other' },
          { data: 'gender' },
          { data: 'price' },
          { data: 'honorary',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' ng-disabled="true" />');
              $compile(nTd)($scope);
            }
          },
          { data: 'enrolled',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' ng-disabled="true" />');
              $compile(nTd)($scope);
            }
          },
          { data: 'confirmed',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' ng-disabled="true" />');
              $compile(nTd)($scope);
            }
          },
          { data: 'payed',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' ng-disabled="true" />');
              $compile(nTd)($scope);
            }
          },
        ]
      });

      // Apply the search
      vm.table.columns().every(function (index) {
        var that = this;
        $('input#col-search-'+index).on('keyup change', function () {
          if (that.search() !== this.value) {
            that.search(this.value).draw();
          }
        });
      });
    };
  }
})();
