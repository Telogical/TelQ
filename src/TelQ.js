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

    function qGetHttp(resolve, reject) {
      options.expires = (options.expires || 0) * cacheTime;

      var sanitizedOptions = checkRequiredInputs(options);

      if (!sanitizedOptions.url) {
        reject(new Error('No url or source provided.'));
      }

      var params = (sanitizedOptions.params) ? reOrder(sanitizedOptions.params) : null,
        url = params ? sanitizedOptions.url + '?' + qs.stringify(params) : sanitizedOptions.url;

      function requestCallback(error, response, body) {
        if (!error && response.statusCode === 200) {

          var result = typeof body === 'string' ? JSON.parse(body) : body;

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

    function qGetHttp(resolve, reject) {

      var sanitizedOptions = checkRequiredInputs(options);

      if (!sanitizedOptions.url) {
        reject(new Error('No url or source provided.'));
      }

      var params = (sanitizedOptions.params) ? reOrder(sanitizedOptions.params) : null,
        url = params ? sanitizedOptions.url + '?' + qs.stringify(params) : sanitizedOptions.url;

      options.url = sanitizedOptions.url;
      options.params = sanitizedOptions.params;

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

  function checkRequiredInputs(options) {
    var _url = options.url || options.source,
      _params = options.params || options.query;

    return {
      url: _url,
      params: _params
    };
  }

  function use(plugin, options) {
    if (plugin && plugin instanceof Function) {
      return plugin(q, options);
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