(function () {
  'use strict';

  angular
    .module('mailtemplates')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Mailtemplates',
      state: 'mailtemplates',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'mailtemplates', {
      title: 'List Mailtemplates',
      state: 'mailtemplates.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'mailtemplates', {
      title: 'Create Mailtemplate',
      state: 'mailtemplates.create',
      roles: ['admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'mailtemplates', {
      title: 'MailBOMB',
      state: 'mailtemplates.bomb',
      roles: ['admin']
    });
  }
})();
