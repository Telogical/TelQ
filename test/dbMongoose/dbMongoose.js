'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var sinon = require('sinon');
var mongoose = require('mongoose');
var _ = require('lodash');
var dbMongoose = require('./../../dbMongoose');

var q = require('./../../src/TelQ.js');
q.use(dbMongoose);

describe('Given I want to use TelQ', function () {
    describe('And I initialize TelQ', function () {
        describe('When I add in a document database source', function () {
            it('Then it should have a dbMongoose function', function (done) {
                var hasMongoose = _.has(q, 'dbMongoose');
                expect(hasMongoose).to.equal(true);
                done();
            });
        });
    });

  describe('And I want to make an asynchronous request for a resource', function () {

      describe('And that resource is a document database', function () {
          var schema = new mongoose.Schema({
              x: 'string',
              y: 'string'
          });
          var Tel = mongoose.model('Tel', schema);

          describe('And I do not specify a database', function () {

              it('Then it should reject with an error no model', function (done) {
                  var qDb = q.dbMongoose({});
                  expect(qDb).to.eventually.be.rejectedWith('no model').and.notify(done);
              });
          });

          describe('And the resource returns without error', function () {
              var result = {
                  'datum': 'some data'
              };

              var find = function (query, callback) {
                  callback(null, result);
              };

              beforeEach(function () {
                  sinon.stub(mongoose.models.Tel, 'find').callsFake(find);
              });

              afterEach(function () {
                  sinon.restore();
              });

              describe('When I request the resource', function () {

                  it('Then I should receive data from the resource', function (done) {
                      var options = {
                          source: Tel,
                          operation: 'find'
                      };

                      var qDb = q.dbMongoose(options);

                      expect(qDb).to.eventually.deep.equal(result).and.notify(done);
                  });
              });
          });

          describe('And the resource returns with an error', function () {

              var find = function (query, callback) {
                  callback('ERROR', {});
              };

              beforeEach(function () {
                  sinon.stub(mongoose.models.Tel, 'find').callsFake(find);
              });

              afterEach(function () {
                  sinon.restore();
              });

              describe('When I request the resource', function () {

                  it('Then I should receive data from the resource', function (done) {

                      var options = {
                          source: Tel,
                          operation: 'find'
                      };

                      var qDb = q.dbMongoose(options);

                      expect(qDb).to.eventually.be.rejectedWith('ERROR').and.notify(done);
                  });
              });
          });
      });
   });
});
