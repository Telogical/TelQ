var axios = require('axios');
var RSVP = require('rsvp');
var _ = require('lodash');
var qs = require('querystring');
var cache = require('./q-cache');

var cacheTime = (60 * 1000); //cache specified in minutes
var telQCachingEnabled = true;

function TelQ() {
  'use strict';

  function get(options) {

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

        getDfd.resolve(result, response);
      } else {
        var statusCode = response && response.statusCode;
        getDfd.reject({error: error, body: body, statusCode: statusCode});
      }
    }

    var getDfd = RSVP.defer();

    options.expires = (options.expires || 0) * cacheTime;

    var sanitizedOptions = checkRequiredInputs(options);

    if (!sanitizedOptions.url) {
      getDfd.reject(new Error('No url or source provided.'));
    }

    var params = (sanitizedOptions.params) ? sanitizedOptions.params : null,
      url = params ? sanitizedOptions.url + '?' + qs.stringify(params) : sanitizedOptions.url;

    options.url = url;

    if (telQCachingEnabled) {
      var matches = _.filter(cache.list(), function(cachedItem){
        return cachedItem.id === url;
      });

      var itemIsInCache = matches.length;

      if(itemIsInCache){
        getDfd.resolve(matches[0].value[0]);
      } else {
        axios.get(options.url, {
          params: options.params,
          headers: options.headers
        })
          .then(function(response) {
            var result = response.data;
            if (telQCachingEnabled && options.expires > 0) {
              cache.add({
                id: url,
                value: [result, response],
                expires: new Date(new Date().getTime() + options.expires)
              });
            }
            getDfd.resolve(result, response);
          })
          .catch(function(error) {
            getDfd.reject({error: error, body: error.response ? error.response.data : null, statusCode: error.response ? error.response.status : null});
          });
      }
    }

    return getDfd.promise;
  }

  function post(options) {

    var postDfd = RSVP.defer();

    var sanitizedOptions = checkRequiredInputs(options);

    if (!sanitizedOptions.url) {
      postDfd.reject(new Error('No url or source provided.'));
    }

    var params = (sanitizedOptions.params) ? sanitizedOptions.params : null,
    url = params ? sanitizedOptions.url + '?' + qs.stringify(params) : sanitizedOptions.url;

    options.url = url;
    if(typeof options.body === 'object' && options.body) {
      options.json = true;
    }

    function requestCallback(error, response, body) {
      if (!error && response.statusCode === 200) {
        postDfd.resolve(body, response);
      } else {
        postDfd.reject(error);
      }
    }

    axios.post(options.url, options.body, {
      params: options.params,
      headers: options.headers
    })
      .then(function(response) {
        postDfd.resolve(response.data, response);
      })
      .catch(function(error) {
        postDfd.reject(error);
      });

    return postDfd.promise;
  }

  function checkRequiredInputs(options) {
    var _url = options.url || options.source,
      _params = options.params || options.query;

    if (_.has(options, 'encoding')) {
      return {
        url: _url,
        params: _params,
        encoding: options.encoding
      };
    }

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

  function when(val) {
    return new q.Promise(function(resolve){
      resolve(val);
    });
  }

  var q = _.assign(this, RSVP);

  //RSVP.configure('onerror', function(reason){ console.assert(false,reason)}); //Error handling?

  q.use = use;
  q.post = post;
  q.get = get;
  q.when = when;
  return q;
}

module.exports = new TelQ();
