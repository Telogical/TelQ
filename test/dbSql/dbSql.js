'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var sinon = require('sinon');
var tedious = require('tedious');
var _ = require('lodash');
var dbSql = require('./../../dbSql');
var q = require('./../../src/TelQ.js');

q.use(dbSql);

describe('Given I want to use TelQ', function() {

    describe('And I initialize TelQ', function() {

        describe('When I add in a sql database source', function() {

            it('Then it should have a dbSql function', function(done) {
                var hasSql = _.has(q, 'dbSql');
                expect(hasSql).to.equal(true);
                done();
            });
        });
    });
});

describe('Given I want to make an asynchronous request for a sql resource', function() {
  var sqlServerDatabase, databaseName, options, testId, testLocations, testLineId, promise,
  fakeConnection, fakeRequest;

  describe('And I do not supply a valid server', function() {

    beforeEach(function() {
      options = {};
    });

    describe('When I request the resource', function() {

      beforeEach(function() {
        promise = q.dbSql(options);
      });

      it('Should return a connection error', function(done) {
        var error = 'No server supplied';
        expect(promise).to.eventually.be.rejectedWith(error).and.notify(done);
      });
    });
  });

  describe('And I successfully connect to a sql data source', function() {

    beforeEach(function() {
      sqlServerDatabase = 'database';
      databaseName = 'databaseName';
      testId = 'testId';
      testLocations = [];
      testLineId = 'testLineId';

      fakeConnection = function() {
        return {
          execSql: function() {},
          callProcedure: function() {},
          close: function() {},
          on: function(state, cb) {
            cb();
          }
        };
      };

      sinon.stub(tedious, 'Connection', fakeConnection);
    });

    afterEach(function() {
      tedious.Connection.restore();
    });

    describe('And I want to execute a query', function() {
      
      beforeEach(function() {
        options = {
          source: 'local',
          query: 'SELECT * FROM USERS'
        };
      });

      describe('And the resource returns successfully', function() {

        beforeEach(function() {
          fakeRequest = function(sql, callback) {
            callback(false, '');
          };

          sinon.stub(tedious, 'Request', fakeRequest);
        });

        afterEach(function() {
          tedious.Request.restore();
        });

        describe('When I call the dbSql function', function() {

          beforeEach(function() {
            promise = q.dbSql(options);
          });

          it('Should return the expected data', function(done) {
            var expectedData = [];
            expect(promise).to.eventually.deep.equal(expectedData).and.notify(done);
          });// Should return the expected data
        }); //When I call the dbSql function
      }); // And the resource returns successfully

      describe('And the resource returns unsuccessfully', function() {

        beforeEach(function() {
          fakeRequest = function(sql, callback) {
            callback(true, '');
          };

          sinon.stub(tedious, 'Request', fakeRequest);
        });

        afterEach(function() {
          tedious.Request.restore();
        });

        describe('When I call the dbSql function', function() {

          beforeEach(function() {
            promise = q.dbSql(options);
          });

          it('Should return a sql execution error', function(done) {
            var error = 'Error with sql execution';
            expect(promise).to.eventually.be.rejectedWith(error).and.notify(done);
          });// Should return a sql execution error
        }); //When I call the dbSql function
      }); //And the resource returns unsuccessfully
    }); //And I want to execute a query

    describe('And I want to call a stored procedure with a set of parameters', function() {
      beforeEach(function() {
        options = {
          queryType: 'storedProcedure',
          source: sqlServerDatabase,
          query: databaseName + '.Rules.InsertIntoTestTables',
          params: [{
            name: 'TestId',
            type: tedious.TYPES.VarChar,
            value: testId
          }, {
            name: 'TestLocations',
            type: tedious.TYPES.VarChar,
            value: testLocations
          }, {
            name: 'TestLineId',
            type: tedious.TYPES.Int,
            value: testLineId
          }]
        };
      });

      describe('And the stored procedure returns successfully', function() {

        beforeEach(function() {

          fakeRequest = function(sql, requestCallback) {
            return {
              addParameter: function() {},
              on: function(state, cb) {
                if (state === 'row') {
                  cb([{value: true}, {}]);
                } else if (state === 'done') {
                  requestCallback(null, 3);
                }
              }
            };
          };

          sinon.stub(tedious, 'Request', fakeRequest);
        });

        afterEach(function() {
          tedious.Request.restore();
        });

        describe('When I call the dbSql function', function() {

          beforeEach(function() {
            promise = q.dbSql(options);
          });

          it('Should return the expected data', function(done) {
            var expectedData = [[{value: true}, {}]];

            expect(promise).to.eventually.deep.equal(expectedData).notify(done);
          });
        }); //When I call the dbSql function
      }); //And the stored procedure returns successfully

      describe('And the stored procedure returns unsuccessfully', function() {

        beforeEach(function() {

          fakeRequest = function(sql, requestCallback) {
            return {
              addParameter: function() {},
              on: function(state, cb) {
                if (state === 'row') {
                  cb([{value: true}, {}]);
                } else if (state === 'done') {
                  requestCallback('request error', 0);
                }
              }
            };
          };

          sinon.stub(tedious, 'Request', fakeRequest);
        });

        afterEach(function() {
          tedious.Request.restore();
        });

        describe('When I call the dbSql function', function() {

          beforeEach(function() {
            promise = q.dbSql(options);
          });

          it('Should return a sql execution error', function(done) {
            var error = 'Error with sql execution: request error';

            expect(promise).to.be.rejectedWith(error).notify(done);
          });
        }); //When I call the dbSql function
      }); //And the stored procedure returns unsuccessfully
    }); //And I want to call a stored procedure with a set of parameters
  }); //And I successfully connect to a sql data source

  describe('And I unsuccessfully connect to a sql data source', function() {

    beforeEach(function() {
      fakeConnection = function() {
        return {
          execSql: function() {},
          callProcedure: function() {},
          close: function() {},
          on: function(state, cb) {
            cb('connection error');
          }
        };
      };

      sinon.stub(tedious, 'Connection', fakeConnection);
    });

    afterEach(function() {
      tedious.Connection.restore();
    });

    describe('And I call a stored procedure with a set of parameters', function() {

      beforeEach(function() {
        options = {
          queryType: 'storedProcedure',
          source: sqlServerDatabase,
          query: databaseName + '.Rules.InsertIntoTestTables',
          params: [{
            name: 'TestId',
            type: tedious.TYPES.VarChar,
            value: testId
          }, {
            name: 'TestLocations',
            type: tedious.TYPES.VarChar,
            value: testLocations
          }, {
            name: 'RuleLineId',
            type: tedious.TYPES.Int,
            value: testLineId
          }]
        };
      });

      describe('When I call the dbSql function', function() {

        beforeEach(function() {
          promise = q.dbSql(options);
        });

        it('Should return a connection error', function(done) {
          var error = 'Error connecting: connection error';
          expect(promise).to.be.rejectedWith(error).notify(done);
        });
      });
    });
  });
}); //Given I want to make an asynchronous request for a sql resource







