/* global $:false */
(function () {
  'use strict';

  angular
    .module('reservations')
    .controller('ReservesListController', ReservesListController);

  ReservesListController.$inject = ['ReservationsService', '$stateParams', '$state', '$filter', '$scope', '$compile', '$http'];

  function ReservesListController(ReservationsService, $stateParams, $state, $filter, $scope, $compile, $http) {
    var vm = this;

    $http.get('/api/reservations/reserves')
    .then(function(response) {
      // Get reserves
      function isReserve(r){ return r.reserve; }
      vm.reservations = response.data.data.filter(isReserve);

      angular.forEach(vm.reservations, function(reservation, key) {
        reservation.nr = 1 + key;
        reservation.date = $filter('date')(reservation.created, 'yyyy-MM-dd');
        reservation.payed = reservation.payed || false;

        reservation.program = reservation.program || '';
        reservation.other = reservation.other || '';
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

    vm.setPayed = function(index){
      var imSure = window.confirm('Are you sure you want to confirm this reservation has payed?');
      if(imSure){
        var reservation = vm.reservations[index];
        $http.post('/api/reservations/haspayed', { reservationId: reservation._id }).success(function (response) {
          vm.showMessage(response.message || 'Succesfully unregistered reservation.');
        }).error(function (response) {
          vm.showMessage('Failed to unregistered reservation.');
          console.log('Err response: ' + JSON.stringify(response));
        });
      }
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
        buttons: [
          'copy', 'excel', 'pdf', 'colvis'
        ],
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
          { data: 'email' },
          { data: 'phone' },
          { data: 'payed',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' ng-click="vm.setPayed(' + iRow + ')" />');
              $compile(nTd)($scope);
            }
          },
          { data: 'ocr' },
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
