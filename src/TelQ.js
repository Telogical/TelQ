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

    function get(options) {
        options.expires = (options.expires || 0) * cacheTime;
        options.params = options.params ? reOrder(options.params) : null;

        var url = (options.params) ? options.source + '?' + qs.stringify(options.params) : options.source;

        function qGetHttp(resolve, reject) {

            function requestCallback(error, response, body) {
                if (!error && response.statusCode === 200) {

                    var result = typeof body === 'string' ? JSON.parse(body) : body;

                    if (telQCachingEnabled && options.expires > 0) {
                        cache.add({
                            id: url,
                            value: [body, response],
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
                    resolve(cachedItem.value[0], cachedItem.value[1]);
                }
            }

            //memoize short circuit.
            if (telQCachingEnabled) {
                _.each(cache.list(), returnIfCached);
            }

            request(url, requestCallback);
        }

        return new RSVP.Promise(qGetHttp);
    }

    function post(options) {
        options.url = options.source;

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

    function use(plugin) {
        if (plugin && plugin instanceof Function) {
            return plugin(q);
        }
    
        throw 'Must provide TelQ plugin as instance of Function';
    }

    var q = _.assign(this, RSVP);

    //RSVP.configure('onerror', function(reason){ console.assert(false,reason)}); //Error handling?

    q.use = use;
    q.post = post;
    q.get = get;
    return q;
}

module.exports = new TelQ();