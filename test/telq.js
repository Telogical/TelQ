'use strict';

var _ = require('lodash');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var q = require('./../src/TelQ.js');

describe('Given I want to use TelQ', function () {
    describe('When I initialize TelQ', function () {

        it('Then it should have a get function by default', function (done) {
            var hasGet = _.has(q, 'get');
            expect(hasGet).to.equal(true);
            done();
        });

        it('Then it should have a post function by default', function (done) {
            var hasPost = _.has(q, 'post');
            expect(hasPost).to.equal(true);
            done();
        });
    });
});

describe('Given I want to make an asynchronous request for a resource', function () {

    describe('And that resource is a rest based url', function () {

        var server = 'http://server';
        var resource = '/resource';

        describe('And the resource returns without an error', function () {
            var nock = require('nock');
            var result = {
                'datum': 'some data'
            };

            beforeEach(function () {
                nock(server).get(resource).delay(10).reply(200, result, {
                    'Content-Type': 'application/json'
                });
                nock(server).post(resource).delay(10).reply(200, result, {
                    'Content-Type': 'application/json'
                });
            });

            afterEach(function () {
                nock.cleanAll();
            });


            describe('When I submit a GET request to the resource', function () {

                it('Then I should receive data from the resource', function (done) {
                    var options = {
                        source: server + resource
                    };
                    var qUrl = q.get(options);

                    expect(qUrl).to.eventually.deep.equal(result).and.notify(done);
                });

            });

            describe('When I submit a POST to the resource', function () {

                it('Then I should receive data from the resource', function (done) {
                    var options = {
                        source: server + resource
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
                nock(server).get(resource).delay(10).reply(500, result);
                nock(server).post(resource).delay(10).reply(500, result);
            });

            afterEach(function () {
                nock.cleanAll();
            });

            describe('When I submit a GET request to the resource', function () {

                it('Then I should receive a rejection from the resource', function (done) {
                    var options = {
                        source: server + resource
                    };
                    var qUrl = q.get(options);

                    expect(qUrl).to.eventually.be.rejected.and.notify(done);
                });
            });

            describe('When I submit a POST to the resource', function () {

                it('Then I should receive a rejection from the resource', function (done) {
                    var options = {
                        source: server + resource
                    };
                    var qUrl = q.post(options);

                    expect(qUrl).to.eventually.be.rejected.and.notify(done);
                });
            });
        });
    });
});
