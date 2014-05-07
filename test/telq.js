'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var sinon = require('sinon');
var mongoose = require('mongoose');


describe('Given I want to make an asynchronous request for a resource', function() {

	var q = require('./../src/TelQ.js');

	describe('And that resource is a rest based url', function() {

		var server = 'http://server';
		var resource = '/resource';

		describe('And the resource returns without an error', function() {

			var result = {
				'datum': 'some data'
			};

			beforeEach(function() {
				var nock = require('nock');
				nock(server).get(resource).delay(10).reply(200, result, {
					'Content-Type': 'application/json'
				});
			});

			describe('When I request the resource', function() {

				it('Then I should receive data from the resource', function(done) {
					var url = server + resource;
					var qUrl = q.get(url, {});

					expect(qUrl).to.eventually.deep.equal(result).and.notify(done);
				});

			});
		});

		describe('And the resource returns with an error', function() {
			var result = 'some error';

			beforeEach(function() {
				var nock = require('nock');
				nock(server).get(resource).delay(10).reply(500, result);
			});

			describe('When I request the resource', function() {

				it('Then I should receive a rejection from the resource', function(done) {
					var url = server + resource;
					var qUrl = q.get(url, {});

					expect(qUrl).to.eventually.be.rejected.and.notify(done);
				});
			});
		});
	});

	describe('And that resource is a document database', function() {

		describe('And I do not specify a database', function() {

			it('Then it should reject with an error no model', function(done) {
				var qDb = q.dbMongoose({});
				expect(qDb).to.eventually.be.rejectedWith('no model').and.notify(done);
			});
		});

		describe('And the resource returns without error', function() {

			var schema = new mongoose.Schema({
				x: 'string',
				y: 'string'
			});
			var Tel = mongoose.model('Tel', schema);

			var result = {
				'datum': 'some data'
			};

			var find = function(query, callback) {
				callback(null, result);
			};

			sinon.stub(mongoose.models.Tel, 'find', find);

			describe('When I request the resource', function() {

				var options = {
					database: Tel,
					operation: 'find'
				};

				var qDb = q.dbMongoose(options);

				it('Then I should receive data from the resource', function(done) {
					expect(qDb).to.eventually.deep.equal(result).and.notify(done)
				});
			});
		});
	});
});
