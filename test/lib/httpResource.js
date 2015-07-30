'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var q = require('../../src/TelQ');

chai.use(chaiAsPromised);
var expect = chai.expect;

var httpResource = require('../../lib/httpResource.js');

describe('Given I want to make an HTTP call', function() {

  describe('And I have valid options', function() {

    var options,
    getResult,
    expectedResult,
    expectedError;

    beforeEach(function() {
      options = {
        'url': '',
        'params': {
          'one': 'param'
        }
      };
    });

    describe('And the call will be successful', function() {
      function resolveMock(resolve) {
        resolve({
          'successful': 'call'
        });
      }

      beforeEach(function() {
        sinon.stub(q, 'get').returns(new q.Promise(resolveMock));
      });

      afterEach(function() {
        q.get.restore();
      });

      describe('When I make a GET request', function() {

        beforeEach(function() {
          getResult = httpResource.get(options);

          expectedResult = {
            'successful': 'call'
          };
        });

        it('should respond with data', function(done) {
          expect(getResult).to.eventually.eql(expectedResult).and.notify(done);
        });
      });
    });

    // Telogical microservices return a 200 with an error in the object which is 
    // what this test is handling.
    describe('And the call will be successful but return an error', function() {
      function resolveMock(resolve) {
        resolve({
          'errorId': '1'
        });
      }

      beforeEach(function() {
        sinon.stub(q, 'get').returns(new q.Promise(resolveMock));
      });

      afterEach(function() {
        q.get.restore();
      });

      describe('When I make a GET request', function() {

        beforeEach(function() {
          getResult = httpResource.get(options);

          expectedError = {
            'errorId': '1'
          };
        });

        it('should respond with an error', function(done) {
          expect(getResult).to.eventually.be.rejected.and.eql(expectedError).and.notify(done);
        });
      });
    });
    describe('And the call will not be successful', function() {

      function rejectMock(resolve, reject) {
        reject({
          'unSuccessful': 'call'
        });
      }

      beforeEach(function() {
        sinon.stub(q, 'get').returns(new q.Promise(rejectMock));
      });

      afterEach(function() {
        q.get.restore();
      });

      describe('When I make a GET request', function() {

        beforeEach(function() {
          getResult = httpResource.get(options);
          expectedError = {
            'unSuccessful': 'call'
          };
        });

        it('should respond with an error', function(done) {
          expect(getResult).to.eventually.be.rejected.and.eql(expectedError).and.notify(done);
        });
      });
    });

  });

});
