'use strict';

describe('Mailtemplates E2E Tests:', function () {
  describe('Test Mailtemplates page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/mailtemplates');
      expect(element.all(by.repeater('mailtemplate in mailtemplates')).count()).toEqual(0);
    });
  });
});
