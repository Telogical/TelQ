'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var sinon = require('sinon');
var mongoose = require('mongoose');
var tedious = require('tedious');


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
          var url = server + resource;
          var qUrl = q.get(url, {});

          expect(qUrl).to.eventually.deep.equal(result).and.notify(done);
        });

      });

      describe('When I submit a POST to the resource', function() {

        it('Then I should receive data from the resource', function(done) {
          var url = server + resource;
          var options = {
            url: url
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
          var url = server + resource;
          var qUrl = q.get(url, {});

          expect(qUrl).to.eventually.be.rejected.and.notify(done);
        });
      });

      describe('When I submit a POST to the resource', function() {

        it('Then I should receive a rejection from the resource', function(done) {
          var url = server + resource;
          var options = {
            url: url
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
      })

      afterEach(function() {
        mongoose.models.Tel.find.restore();
      })

      describe('When I request the resource', function() {

        it('Then I should receive data from the resource', function(done) {
          var options = {
            database: Tel,
            operation: 'find'
          };

          var qDb = q.dbMongoose(options);

          expect(qDb).to.eventually.deep.equal(result).and.notify(done)
        });
      });
    });

    describe('And the resource returns with an error', function() {

      var find = function(query, callback) {
        callback('ERROR', {});
      };

      beforeEach(function() {
        sinon.stub(mongoose.models.Tel, 'find', find);
      })

      afterEach(function() {
        mongoose.models.Tel.find.restore();
      })

      describe('When I request the resource', function() {

        it('Then I should receive data from the resource', function(done) {

          var options = {
            database: Tel,
            operation: 'find'
          };

          var qDb = q.dbMongoose(options);

          expect(qDb).to.eventually.be.rejectedWith('ERROR').and.notify(done)
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

      var result = 'Statement executed successfully';

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
