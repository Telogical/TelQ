var request = require('request');
var RSVP = require('rsvp');
var _ = require('lodash');
var qs = require('querystring');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
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
					if (telQCachingEnabled && options.expires > 0) {
						cache.add({
							id: url,
							value: [body, response],
							expires: new Date(new Date().getTime() + options.expires)
						});
					}

					var result = typeof body === 'string' ? JSON.parse(body) : body;

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

	function dbMongoose(options) {
		var operation = options.operation || 'find';
		var query = options.query || {};
		var model = options.database;

		function qGetDB(resolve, reject) {
			if (!model) {
				reject('no model');
			}

			function dbCallback(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			}
			model[operation](query, dbCallback);
		}
		return new RSVP.Promise(qGetDB);
	}

	function dbSql(options) {

		function qExecuteStatement(resolve, reject) {
			var connection = new Connection(options.sqlServer);

			//            connection.on('debug', function(text) {
			//                // If no error, then good to go...
			//                console.log('Debug: ' + text);
			//            });

			connection.on('connect', function (err) {

				if (err) {
					reject('Error connecting: ' + err);
				}

				var requestSql = new Request(options.query, function (err, rowCount) {
					if (err) {
						connection.close();
						reject('Error with sql execution');
					}

					connection.close();
					resolve('Statement executed successfully');
				});

				connection.execSql(requestSql);
			})
		}

		return new RSVP.Promise(qExecuteStatement);
	}

	var q = _.extend(this, RSVP);

	//RSVP.configure('onerror', function(reason){ console.assert(false,reason)}); //Error handling?

	q.post = post;
	q.get = get;
	q.dbMongoose = dbMongoose;
	q.dbSql = dbSql;
	return q;
}

module.exports = new TelQ();