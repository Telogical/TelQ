'use strict';

var RSVP = require('rsvp');

var dbMongoose = {
  dbMongoose: function(options) {
    var operation = options.operation || 'find';
    var conditions = options.conditions || null;
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
       conditions ? model[operation](conditions, query, dbCallback) : model[operation](query, dbCallback);
    }
    return new RSVP.Promise(qGetDB);
  }
};

module.exports = dbMongoose;
