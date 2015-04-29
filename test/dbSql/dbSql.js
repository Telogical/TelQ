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

describe('Given a TelQ with db Sql Resource', function() {
    var sqlServerDatabase, databaseName, TYPES, options, ruleId, ruleLocations, featureLineId, promise,
        fakeConnection, fakeRequest, results;

    beforeEach(function() {
        sqlServerDatabase = 'database';
        databaseName = 'databaseName';
        ruleId = 'ruleId';
        ruleLocations = [];
        featureLineId = 'featureLineId';

        results = [
            [{
                value: true
            }, {}]
        ];

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
        sinon.stub(tedious, 'Connection', fakeConnection);
        sinon.stub(tedious, 'Request', fakeRequest);
    });

    afterEach(function() {
        tedious.Connection.restore();
        tedious.Request.restore();
    });

    describe('When I call storedProcedure with set of parameters', function() {
        beforeEach(function() {
            TYPES = tedious.TYPES;
            options = {
                queryType: 'storedProcedure',
                source: sqlServerDatabase,
                query: databaseName + '.Rules.InsertIntoRulesTables',
                params: [{
                    name: 'RuleId',
                    type: TYPES.VarChar,
                    value: ruleId
                }, {
                    name: 'RuleLocations',
                    type: TYPES.VarChar,
                    value: ruleLocations
                }, {
                    name: 'FeatureLineupId',
                    type: TYPES.Int,
                    value: featureLineId
                }]
            };
            promise = q.dbSql(options);
        });

        describe('and request is successful', function() {
            it('should return the expected data', function(done) {
                expect(promise).to.eventually.deep.equal([
                    [{
                        value: true
                    }, {}]
                ]).notify(done);
            });
        });
    });
});

describe('Given a TelQ with db Sql Resource', function() {
    var sqlServerDatabase, databaseName, TYPES, options, ruleId, ruleLocations, featureLineId, promise,
        fakeConnection, fakeRequest, results;
    beforeEach(function() {
        sqlServerDatabase = 'database';
        databaseName = 'databaseName';
        ruleId = 'ruleId';
        ruleLocations = [];
        featureLineId = 'featureLineId';

        results = [
            [{
                value: true
            }, {}]
        ];
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
        sinon.stub(tedious, 'Connection', fakeConnection);
        sinon.stub(tedious, 'Request', fakeRequest);
    });

    afterEach(function() {
        tedious.Connection.restore();
        tedious.Request.restore();
    });

    describe('When I call storedProcedure with set of parameters', function() {
        beforeEach(function() {
            TYPES = tedious.TYPES;
            options = {
                queryType: 'storedProcedure',
                source: sqlServerDatabase,
                query: databaseName + '.Rules.InsertIntoRulesTables',
                params: [{
                    name: 'RuleId',
                    type: TYPES.VarChar,
                    value: ruleId
                }, {
                    name: 'RuleLocations',
                    type: TYPES.VarChar,
                    value: ruleLocations
                }, {
                    name: 'FeatureLineupId',
                    type: TYPES.Int,
                    value: featureLineId
                }]
            };
            promise = q.dbSql(options);
        });

        describe('and connection is successful but request errors out', function() {
            it('should return an sql execution error', function(done) {
                expect(promise).to.be.rejectedWith('Error with sql execution: request error').notify(done);
            });
        });
    });
});

describe('Given a TelQ with db Sql Resource', function() {
    var sqlServerDatabase, databaseName, TYPES, options, ruleId, ruleLocations, featureLineId, promise,
        fakeConnection;

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
                    cb('connection error');
                }
            };
        };
        sinon.stub(tedious, 'Connection', fakeConnection);


    });

    afterEach(function() {
        tedious.Connection.restore();
    });

    describe('When I call storedProcedure with set of parameters', function() {
        beforeEach(function() {
            TYPES = tedious.TYPES;
            options = {
                queryType: 'storedProcedure',
                source: sqlServerDatabase,
                query: databaseName + '.Rules.InsertIntoRulesTables',
                params: [{
                    name: 'RuleId',
                    type: TYPES.VarChar,
                    value: ruleId
                }, {
                    name: 'RuleLocations',
                    type: TYPES.VarChar,
                    value: ruleLocations
                }, {
                    name: 'FeatureLineupId',
                    type: TYPES.Int,
                    value: featureLineId
                }]
            };
            promise = q.dbSql(options);
        });

        describe('When connection is unsuccessful', function() {
            it('should return an connecting error', function(done) {
                expect(promise).to.be.rejectedWith('Error connecting: connection error').notify(done);
            });
        });
    });
});