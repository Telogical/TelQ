'use strict';

var tedious = require('tedious');
var _ = require('lodash');

function dbSql(q) {

    function qDbSql(options) {
        function qExecuteStatement(resolve, reject) {
            var results = [];
            var connection = new tedious.Connection(options.source);

            function onRequestError(err, rowCount) {
                if (err) {
                    connection.close();
                    reject(new Error('Error with sql execution'));
                }

                connection.close();
                resolve(results);
            }

            function onRow(columns) {
                var data = {};
                _.each(columns, function (column) {
                    data[column.metadata.colName] = column.value;
                });
                results.push(data);
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

        return options.source ? new q.Promise(qExecuteStatement) : new q.Promise(noServerError);

    }

    q.dbSql = qDbSql;

    return q;
}


module.exports = dbSql;