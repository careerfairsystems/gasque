(function () {
  'use strict';

  angular
    .module('reservations')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Reservations',
      state: 'reservations',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reservations', {
      title: 'List Reservations',
      state: 'reservations.list',
      roles: ['admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'reservations', {
      title: 'Create Reservation',
      state: 'reservations.paying',
      roles: ['admin']
    });
  }
})();
