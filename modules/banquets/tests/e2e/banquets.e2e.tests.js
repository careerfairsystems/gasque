'use strict';

describe('Banquets E2E Tests:', function () {
  describe('Test Banquets page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/banquets');
      expect(element.all(by.repeater('banquet in banquets')).count()).toEqual(0);
    });
  });
});
