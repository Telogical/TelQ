var request = require('request');
var RSVP = require('rsvp');
var _ = require('lodash');
var qs = require('querystring');
var reOrder = require('./../lib/reOrder.js');
var cache = require('./q-cache');

var cacheTime = (60 * 1000); //cache specified in minutes
var telQCachingEnabled = true;

function TelQ() {
    'use strict';

    function get(url, options) {
        options.expires = (options.expires || 0) * cacheTime;

        function qGetHttp(resolve, reject) {

            function requestCallback(error, response, body) {
                if (!error && response.statusCode === 200) {
                    var result = typeof body ==='string' ? JSON.parse(body) : body;

                    if (telQCachingEnabled && options.expires > 0) {
                        cache.add({
                            id: url,
                            value: [result, response],
                            expires: new Date(new Date().getTime() + options.expires)
                        });
                    }

                    resolve(result, response);
                } else {
                    reject(error);
                }
            }

            function returnIfCached(cachedItem) {
                if (cachedItem.id === url) {
                  var result = (typeof cachedItem.value[0] === 'string') ?
                        JSON.parse(cachedItem.value[0]) :
                        cachedItem.value[0];

                    var response = (typeof cachedItem.value[1] === 'string') ?
                        JSON.parse(cachedItem.value[1]) :
                        cachedItem.value[1];

                    resolve(result, response);
                }
            }


            options.params = options.params ? reOrder(options.params) : null;

            url = (options.params) ?
                url + '?' + qs.stringify(options.params) :
                url;

            //memoize short circuit.
            if (telQCachingEnabled) {
                _.each(cache.list(), returnIfCached);
            }

            request(url, requestCallback);
        }

        return new RSVP.Promise(qGetHttp);
    }

    function post(options) {
        function qGetHttp(resolve, reject) {
            function requestCallback(error, response, body) {
                if (!error && response.statusCode === 200) {
                    resolve(body, response);
                } else {
                    reject(error);
                }
            }
            request.post(options, requestCallback);

        }
        return new RSVP.Promise(qGetHttp);
    }

    function use(option) {
      if(option && typeof option === 'object') {
        q = _.assign(q, option);
      } else {
        throw 'Option not an object';
      }
    }

    var q = _.assign(this, RSVP);

    //RSVP.configure('onerror', function(reason){ console.assert(false,reason)}); //Error handling?

    q.use = use;
    q.post = post;
    q.get = get;
    return q;
}

module.exports = new TelQ();
