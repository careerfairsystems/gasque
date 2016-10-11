'use strict';

describe('Reservations E2E Tests:', function () {
  describe('Test Reservations page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/reservations');
      expect(element.all(by.repeater('reservation in reservations')).count()).toEqual(0);
    });
  });
});
