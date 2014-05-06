'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;


describe('Given I want to make an asynchronous request for a resource', function () {

	var q = require('./../src/TelQ.js');

	describe('And that resource is a rest based url', function () {

		var server = 'http://server';
		var resource = '/resource';

		describe('And the resource returns without an error', function () {
			var nock = require('nock');
			var result = {
				'datum': 'some data'
			};

			beforeEach(function () {
				nock(server).get(resource).delay(500).reply(200, result, {
					'Content-Type': 'application/json'
				});
				nock(server).post(resource).delay(500).reply(200, result, {
					'Content-Type': 'application/json'
				});
			});

			afterEach(function () {
				nock.cleanAll();
			});

			describe('When I submit a GET request to the resource', function () {

				it('Then I should receive data from the resource', function (done) {
					var url = server + resource;
					var qUrl = q.get(url, {});

					expect(qUrl).to.eventually.deep.equal(result).and.notify(done);
				});

			});

			describe('When I submit a POST to the resource', function () {

				it('Then I should receive data from the resource', function (done) {
					var url = server + resource;
					var options = {
						url: url
					};
					var qUrl = q.post(options);

					expect(qUrl).to.eventually.be.fulfilled.and.notify(done);
				});

			});
		});

		describe('And the resource returns with an error', function () {
			var nock = require('nock');
			var result = 'some error';

			beforeEach(function () {
				nock(server).get(resource).delay(500).reply(500, result);
				nock(server).post(resource).delay(500).reply(500, result);
			});

			afterEach(function () {
				nock.cleanAll();
			});

			describe('When I submit a GET request to the resource', function () {

				it('Then I should receive a rejection from the resource', function (done) {
					var url = server + resource;
					var qUrl = q.get(url, {});

					expect(qUrl).to.eventually.be.rejected.and.notify(done);
				});
			});

			describe('When I submit a POST to the resource', function () {

				it('Then I should receive a rejection from the resource', function (done) {
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
});