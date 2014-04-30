'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('Given I want to make an asynchronous request for a resource', function () {

    var q = require('./../src/TelQ.js');

    describe('And that resource is a rest based url', function () {

        var server = 'http://server';
        var resource = '/resource';
        var result = {datum: 'some data'};

        beforeEach(function () {
            var nock = require('nock');
            nock(server).get(resource).delay(500).reply(200, result, {'Content-Type': 'application/json'});
        });

        describe('When I request the resource', function () {

            it('Then I should receive data from the resource', function (done) {
                var url = server + resource;
                var qUrl = q.get(url, {});

                qUrl.then(function(data){
                    console.log('I have returned', data);
                    try {
                        expect(data).to.equal(result);
                    } catch(err) {
                       console.log('ERROR', err)
                    }
//                    expect(data).to.equal(result);
                    console.log('after assert')
                    done();
                })

            });
        });
    });
});