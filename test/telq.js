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
        var result = {"datum": "some data"};

        beforeEach(function () {
            var nock = require('nock');
            nock(server).get(resource).delay(500).reply(200, result, {'Content-Type': 'application/json'});
        });

        describe('When I request the resource', function () {

            it('Then I should receive data from the resource', function (done) {
                var url = server + resource;
                var qUrl = q.get(url, {});

                expect(qUrl).to.eventually.deep.equal(result).and.notify(done);
            });

        });
    });
});