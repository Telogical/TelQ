'use strict';

var RSVP = require('rsvp');
var tedious = require('tedious');
var _ = require('lodash');

var dbSql = {
  dbSql: function(options) {
    function qExecuteStatement(resolve, reject) {
      var connection = new tedious.Connection(options.source);
      var data = {
        status: 'Statement executed successfully'
      };

      function onRequestError(err) {
        if (err) {
          connection.close();
          reject(new Error('Error with sql execution'));
        }

        connection.close();
        resolve(data);
      }

      function onRow(columns) {
        data = {};
        function onColumn(column) {
          data[column.metadata.colName] = column.value;
        }

        _.each(columns, onColumn);
      }

      function onConnection(err) {
        if (err) {
          console.log('Error on connection', err);
          reject(new Error('Error connecting: ' + err));
        }

        var request = new tedious.Request(options.query, onRequestError);
        request.on('row', onRow);
        connection.execSql(request);
      }

      connection.on('connect', onConnection);
    }

    function noServerError(resolve, reject) {
      reject(new Error('No server supplied'));
    }

    return options.source
      ? new RSVP.Promise(qExecuteStatement)
      : new RSVP.Promise(noServerError);
  }
};

module.exports = dbSql;
