'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var sinon = require('sinon');
var mongoose = require('mongoose');
var tedious = require('tedious');
var _ = require('lodash');
var dbMongoose = require('./../src/dbMongoose');
var dbSql = require('./../src/dbSql');

describe('Given I want to use TelQ', function() {

  describe('When I initialize TelQ', function() {

    var q;

    beforeEach(function() {
      q = require('./../src/TelQ');
    });

    it('Then it should have a get function by default', function(done) {
      var hasGet = _.has(q, 'get');
      expect(hasGet).to.equal(true);
      done();
    });

    it('Then it should have a post function by default', function(done) {
      var hasPost = _.has(q, 'post');
      expect(hasPost).to.equal(true);
      done();
    });

    it('Then it should not have a dbMongoose function by default', function(done) {
      var hasMongoose = _.has(q, 'dbMongoose');

      expect(hasMongoose).to.equal(false);
      done();
    });

    it('Then it should not have a dbSql function by default', function(done) {
      var hasSql = _.has(q, 'dbSql');

      expect(hasSql).to.equal(false);
      done();
    });
  });

  describe('And I initialize TelQ', function() {

    var qM = require('./../src/TelQ.js');

    describe('When I add in a document database source', function() {
      beforeEach(function() {
        qM.use(dbMongoose);
      });


      it('Then it should have a dbMongoose function', function(done) {
        var hasMongoose = _.has(qM, 'dbMongoose');
        expect(hasMongoose).to.equal(true);
        done();
      });
    });

    describe('When I add in a sql database source', function() {
      beforeEach(function() {
        qM.use(dbSql);
      });

      it('Then it should have a dbSql function', function(done) {
        var hasSql = _.has(qM, 'dbSql');
        expect(hasSql).to.equal(true);
        done();
      });
    });
  });
});

describe('Given I want to make an asynchronous request for a resource', function() {

  var q = require('./../src/TelQ.js');

  describe('And that resource is a rest based url', function() {

    var server = 'http://server';
    var resource = '/resource';

    describe('And the resource returns without an error', function() {
      var nock = require('nock');
      var result = {
        'datum': 'some data'
      };

      beforeEach(function() {
        nock(server).get(resource).delay(10).reply(200, result, {
          'Content-Type': 'application/json'
        });
        nock(server).post(resource).delay(10).reply(200, result, {
          'Content-Type': 'application/json'
        });
      });

      afterEach(function() {
        nock.cleanAll();
      });


      describe('When I submit a GET request to the resource', function() {

        it('Then I should receive data from the resource', function(done) {
          var options = {
            source: server + resource
          };
          var qUrl = q.get(options);

          expect(qUrl).to.eventually.deep.equal(result).and.notify(done);
        });

      });

      describe('When I submit a POST to the resource', function() {

        it('Then I should receive data from the resource', function(done) {
          var options = {
            source: server + resource
          };
          var qUrl = q.post(options);

          expect(qUrl).to.eventually.be.fulfilled.and.notify(done);
        });

      });
    });

    describe('And the resource returns with an error', function() {
      var nock = require('nock');
      var result = 'some error';

      beforeEach(function() {
        nock(server).get(resource).delay(10).reply(500, result);
        nock(server).post(resource).delay(10).reply(500, result);
      });

      afterEach(function() {
        nock.cleanAll();
      });

      describe('When I submit a GET request to the resource', function() {

        it('Then I should receive a rejection from the resource', function(done) {
          var options = {
            source: server + resource
          };
          var qUrl = q.get(options);

          expect(qUrl).to.eventually.be.rejected.and.notify(done);
        });
      });

      describe('When I submit a POST to the resource', function() {

        it('Then I should receive a rejection from the resource', function(done) {
          var options = {
            source: server + resource
          };
          var qUrl = q.post(options);

          expect(qUrl).to.eventually.be.rejected.and.notify(done);
        });
      });
    });
  });

  describe('And that resource is a document database', function() {
    var schema = new mongoose.Schema({
      x: 'string',
      y: 'string'
    });
    var Tel = mongoose.model('Tel', schema);

    describe('And I do not specify a database', function() {

      it('Then it should reject with an error no model', function(done) {
        var qDb = q.dbMongoose({});
        expect(qDb).to.eventually.be.rejectedWith('no model').and.notify(done);
      });
    });

    describe('And the resource returns without error', function() {
      var result = {
        'datum': 'some data'
      };

      var find = function(query, callback) {
        callback(null, result);
      };

      beforeEach(function() {
        sinon.stub(mongoose.models.Tel, 'find', find);
      });

      afterEach(function() {
        mongoose.models.Tel.find.restore();
      });

      describe('When I request the resource', function() {

        it('Then I should receive data from the resource', function(done) {
          var options = {
            database: Tel,
            operation: 'find'
          };

          var qDb = q.dbMongoose(options);

          expect(qDb).to.eventually.deep.equal(result).and.notify(done);
        });
      });
    });

    describe('And the resource returns with an error', function() {

      var find = function(query, callback) {
        callback('ERROR', {});
      };

      beforeEach(function() {
        sinon.stub(mongoose.models.Tel, 'find', find);
      });

      afterEach(function() {
        mongoose.models.Tel.find.restore();
      });

      describe('When I request the resource', function() {

        it('Then I should receive data from the resource', function(done) {

          var options = {
            database: Tel,
            operation: 'find'
          };

          var qDb = q.dbMongoose(options);

          expect(qDb).to.eventually.be.rejectedWith('ERROR').and.notify(done);
        });
      });
    });
  });

  describe('And that resource is a sql server database', function() {

    var fakeConnection = function(options) {
      return {
        execSql: function(request) {},
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

      var result = {
        status: 'Statement executed successfully'
      };

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
            sqlServer: 'local',
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
            sqlServer: 'local',
            query: 'SELECT * FROM USERS'
          };
          var qSql = q.dbSql(opts);

          expect(qSql).to.eventually.be.rejectedWith(result).and.notify(done);
        });
      });
    });
  });
});
