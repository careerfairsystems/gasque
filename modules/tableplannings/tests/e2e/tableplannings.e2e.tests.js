'use strict';

describe('Tableplannings E2E Tests:', function () {
  describe('Test Tableplannings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/tableplannings');
      expect(element.all(by.repeater('tableplanning in tableplannings')).count()).toEqual(0);
    });
  });
});
