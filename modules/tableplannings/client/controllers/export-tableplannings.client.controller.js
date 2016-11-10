/* global $:false */
(function () {
  'use strict';

  angular
    .module('tableplannings')
    .controller('ExportTableplanningsController', ExportTableplanningsController);

  ExportTableplanningsController.$inject = ['ReservationsService', 'tableplanningResolve', '$state', '$filter', '$scope', '$compile', '$http'];

  function ExportTableplanningsController(ReservationsService, tableplanningResolve, $state, $filter, $scope, $compile, $http) {
    var vm = this;

    vm.seats = [];
    vm.tp = tableplanningResolve;

    vm.tp.tables.forEach(function(t){
      t.seats.forEach(function(s){
        s.table = t.name;
      });
      vm.seats = vm.seats.concat(t.seats);
    });
    
    vm.seats = vm.seats.filter(function(s){ return s.name !== 'Empty seat'; });

    vm.seats.forEach(function(s){
      s.foodpref = !s.foodpref ? '' : s.foodpref;
      s.drinkpackage = !s.drinkpackage ? '' : s.drinkpackage;
    });


    ReservationsService.query(function(data){
      vm.reservations = data.filter(function(d){ return d.enrolled; });
      completeData();
    });

    function completeData(){
      vm.seats.forEach(function(s){
        var a = true;        
        vm.reservations.forEach(function(r){
          if(r._id === s.id){
            s.foodpref = [r.foodpref, r.other].join(',');
            s.drinkpackage = r.drinkpackage;
            a = false;
          }
        });
        if(a){
          console.log('aoeu');
        }
        
      });

      vm.createDatatable(vm.seats);
    }

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
          { data: 'name' },
          { data: 'table' },
          { data: 'nbr' },
          { data: 'clothing' },
          { data: 'foodpref' },
          { data: 'drinkpackage' },
        ]
      });
    };



  }
})();
