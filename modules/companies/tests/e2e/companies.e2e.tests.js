'use strict';

describe('Companies E2E Tests:', function () {
  describe('Test Companies page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/companies');
      expect(element.all(by.repeater('company in companies')).count()).toEqual(0);
    });
  });
});
