'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var request = require('request');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var q = require('./../src/TelQ.js');

describe('Given I want to use TelQ', function () {
  describe('When I initialize TelQ', function () {

    it('Then it should have a get function by default', function (done) {
      var hasGet = _.has(q, 'get');
      expect(hasGet).to.eql(true);
      done();
    });

    it('Then it should have a post function by default', function (done) {
      var hasPost = _.has(q, 'post');
      expect(hasPost).to.eql(true);
      done();
    });

    it('Should have a when function by default', function(done) {
      var hasWhen = _.has(q, 'when');
      expect(hasWhen).to.eql(true);
      done();
    });
  });
});

describe('Given I a value that I want to wrap with a promise', function() {
  var value;

  beforeEach(function() {
    value = '12345';
  });
  
  describe('When I send it to the when function', function() {
    var whenValue;

    beforeEach(function() {
      whenValue = q.when(value);
    });

    it('Should return the value wrapped in a promise', function(done) {
      expect(whenValue).to.eventually.eql(value).and.notify(done);
    });
  });
});

describe('Given I want to make an asynchronous request for a resource', function () {

  describe('And that resource is a rest based url', function () {
    var server = 'http://server';
    var resource = '/resource';
    var qUrl;

    describe('And the resource returns without an error', function () {
      var result = {
        'datum': 'some data'
      };

      beforeEach(function () {
        sinon.stub(request, 'get', function(url, callback) {
          callback(null, {statusCode: 200}, result)
        });
        
        sinon.stub(request, 'post', function(url, callback) {
          callback(null, {statusCode: 200}, result)
        });
      });

      afterEach(function () {
        request.get.restore();
        request.post.restore();
      });


      describe('When I submit a GET request to the resource', function () {

        beforeEach(function() {
          var options = {
            source: server + resource
          };

          qUrl = q.get(options);
        });

        it('Then I should receive data from the resource', function (done) {
          var expectedResult = {
            'datum': 'some data'
          };

          expect(qUrl).to.eventually.deep.equal(expectedResult).and.notify(done);
        });

      });

      describe('When I submit a POST to the resource', function () {
        
        beforeEach(function() {
          var options = {
            source: server + resource
          };

          qUrl = q.post(options);
        });

        it('Then I should receive data from the resource', function (done) {
          expect(qUrl).to.eventually.be.fulfilled.and.notify(done);
        });

      });
    });

    describe('And the resource returns with an error', function () {
      var result = 'some error';

      beforeEach(function () {
        sinon.stub(request, 'get', function(url, callback) {
          callback(true, {statusCode: 404}, result)
        });
        
        sinon.stub(request, 'post', function(url, callback) {
          callback(true, {statusCode: 404}, result)
        });
      });

      afterEach(function () {
        request.get.restore();
        request.post.restore();
      });

      describe('When I submit a GET request to the resource', function () {

        beforeEach(function() {
          var options = {
            source: server + resource
          };

          qUrl = q.post(options);
        });

        it('Then I should receive a rejection from the resource', function (done) {
          expect(qUrl).to.eventually.be.rejected.and.notify(done);
        });
      });

      describe('When I submit a POST to the resource', function () {

        beforeEach(function() {
          var options = {
            source: server + resource
          };

          qUrl = q.post(options);
        });

        it('Then I should receive a rejection from the resource', function (done) {
          expect(qUrl).to.eventually.be.rejected.and.notify(done);
        });
      });
    });
  });
});
