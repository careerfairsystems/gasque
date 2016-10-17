/* global $:false */
(function () {
  'use strict';

  angular
    .module('reservations')
    .controller('EnrolledListController', EnrolledListController);

  EnrolledListController.$inject = ['ReservationsService', '$stateParams', '$state', '$filter', '$scope', '$compile', '$http'];

  function EnrolledListController(ReservationsService, $stateParams, $state, $filter, $scope, $compile, $http) {
    var vm = this;

    $http.get('/api/reservations/enrolled')
    .then(function(response) {
      //get enrolled reservations
      function isEnrolled(r){ return r.enrolled; }
      vm.reservations = response.data.data.filter(isEnrolled);

      angular.forEach(vm.reservations, function(reservation, key) {
        reservation.nr = 1 + key;
        reservation.date = $filter('date')(reservation.created, 'yyyy-MM-dd');
        reservation.enrolled = reservation.enrolled || false;
        reservation.confirmed = reservation.confirmed || false;
        reservation.program = reservation.program || '';
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


    vm.openReservation = function(index) {
      vm.currentIndex = index;
      var current = vm.reservations[index];
      $state.go('reservations.view', { reservationId: current._id });
    };

    vm.setConfirmation = function(index){
      var imSure = window.confirm('Are you sure you want to confirm this reservation to the banquet?');
      if(imSure){
        vm.reservations[index].confirm = true;
        var reservation = vm.reservations[index];
        var res = ReservationsService.get({ reservationId: reservation._id }, function() {
          res.confirmed = reservation.confirmed;
          res.$save(function(r){
            alert('Succesfully confirmed reservation.');
          });
        });
      }
    };
    vm.setAsUnregistered = function(index){
      var imSure = window.confirm('Are you sure you want to throw this reservation to unregistered?');
      if(imSure){
        var reservation = vm.reservations[index];
        var res = ReservationsService.get({ reservationId: reservation._id }, function() {
          res.confirmed = false;
          res.enrolled = false;
          res.payed = false;
          res.reserve = false;
          res.$save(function(r){
            alert('Succesfully confirmed reservation.');
          });
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
          { data: 'program' },
          { data: 'email' },
          { data: 'phone' },
          { data: 'foodpref' },
          { data: 'other' },
          { data: 'enrolled',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' ng-disabled="true" />');
              $compile(nTd)($scope);
            }
          },
          { data: 'confirmed',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' data-ng-click="vm.setConfirmation('+ iRow+')" />');
              $compile(nTd)($scope);
            }
          },
          { data: 'unregister',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<input type="checkbox" ' + (sData ? 'checked' : '') + ' data-ng-click="vm.setAsUnregistered('+ iRow+')" />');
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
