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
    Menus.addSubMenuItem('topbar', 'reservations', {
      title: 'To confirm',
      state: 'reservations.enrolled',
      roles: ['admin']
    });
    Menus.addSubMenuItem('topbar', 'reservations', {
      title: 'To check payment',
      state: 'reservations.payment',
      roles: ['admin']
    });
    Menus.addSubMenuItem('topbar', 'reservations', {
      title: 'Reserves',
      state: 'reservations.reserves',
      roles: ['admin']
    });
  }
})();
