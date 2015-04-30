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

describe('Given I want to make an asynchronous request for a resource', function() {

    describe('And that resource is a sql server database', function() {

        var fakeConnection = function() {
            return {
                execSql: function() {},
                close: function() {},
                on: function(state, cb) {
                    cb();
                }
            };
        };

        describe('And I do not supply a valid server', function() {

            var result = 'No server supplied';

            describe('When I request the resource', function() {

                it('Then I should receive an error', function(done) {
                    var opts = {};
                    var qSql = q.dbSql(opts);

                    expect(qSql).to.eventually.be.rejectedWith(result).and.notify(done);
                });
            });
        });

        describe('And the resource returns without an error', function() {

            var result = [];

            var fakeRequest = function(sql, callback) {
                callback(false, '');
            };

            beforeEach(function() {
                sinon.stub(tedious, 'Connection', fakeConnection);
                sinon.stub(tedious, 'Request', fakeRequest);
            });

            afterEach(function() {
                tedious.Connection.restore();
                tedious.Request.restore();
            });

            describe('When I request the resource', function() {

                it('Then it should receive data from the resource', function(done) {
                    var opts = {
                        source: 'local',
                        query: 'SELECT * FROM USERS'
                    };
                    var qSql = q.dbSql(opts);

                    expect(qSql).to.eventually.deep.equal(result).and.notify(done);
                });
            });
        });


        describe('And the resource returns with an error', function() {

            var result = 'Error with sql execution';

            var fakeRequest = function(sql, callback) {
                callback(true, '');
            };

            beforeEach(function() {
                sinon.stub(tedious, 'Connection', fakeConnection);
                sinon.stub(tedious, 'Request', fakeRequest);
            });

            afterEach(function() {
                tedious.Connection.restore();
                tedious.Request.restore();
            });

            describe('When I request the resource', function() {

                it('Then it should receive an error from the resource', function(done) {
                    var opts = {
                        source: 'local',
                        query: 'SELECT * FROM USERS'
                    };
                    var qSql = q.dbSql(opts);

                    expect(qSql).to.eventually.be.rejectedWith(result).and.notify(done);
                });
            });
        });
    });
});

describe('Given I want to make an asynchronous request for a sql resource', function() {
  var sqlServerDatabase, databaseName, options, ruleId, ruleLocations, featureLineId, promise,
  fakeConnection, fakeRequest, results;

  describe('And I successfully connect to a sql data source', function() {

    beforeEach(function() {
      sqlServerDatabase = 'database';
      databaseName = 'databaseName';
      ruleId = 'ruleId';
      ruleLocations = [];
      featureLineId = 'featureLineId';

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

    describe('And I want to call a stored procedure with a set of parameters', function() {
      beforeEach(function() {
        options = {
          queryType: 'storedProcedure',
          source: sqlServerDatabase,
          query: databaseName + '.Rules.InsertIntoRulesTables',
          params: [{
            name: 'RuleId',
            type: tedious.TYPES.VarChar,
            value: ruleId
          }, {
            name: 'RuleLocations',
            type: tedious.TYPES.VarChar,
            value: ruleLocations
          }, {
            name: 'FeatureLineupId',
            type: tedious.TYPES.Int,
            value: featureLineId
          }]
        };
      });

      describe('And the stored procedure returns successfully', function() {

        beforeEach(function() {

          fakeRequest = function(sql, requestCallback) {
            return {
              addParameter: function() {

              },
              on: function(state, cb) {
                if (state === 'row') {
                  cb([{
                    value: true
                  }, {}]);
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

            results = [
              [{
                value: true
              }, {}]
            ];

            expect(promise).to.eventually.deep.equal(results).notify(done);
          });
        }); //When I call the dbSql function
      }); //And the stored procedure returns successfully

      describe('And the stored procedure returns unsuccessfully', function() {

        beforeEach(function() {

          fakeRequest = function(sql, requestCallback) {
            return {
              addParameter: function() {

              },
              on: function(state, cb) {
                if (state === 'row') {
                  cb([{
                    value: true
                  }, {}]);
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

            results = 'Error with sql execution: request error';

            expect(promise).to.be.rejectedWith('Error with sql execution: request error').notify(done);
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
          query: databaseName + '.Rules.InsertIntoRulesTables',
          params: [{
            name: 'RuleId',
            type: tedious.TYPES.VarChar,
            value: ruleId
          }, {
            name: 'RuleLocations',
            type: tedious.TYPES.VarChar,
            value: ruleLocations
          }, {
            name: 'FeatureLineupId',
            type: tedious.TYPES.Int,
            value: featureLineId
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







