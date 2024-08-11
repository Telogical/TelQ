var tedious = require('tedious');
var _ = require('lodash');

function dbSql(q) {
    'use strict';

    function qDbSql(options) {
        function qExecuteStoredProcedure(resolve, reject) {
            var results = [];
            var connection = new tedious.Connection(options.source);

            function requestCallback(err, rowCount) {
                if (err) {
                    connection.close();
                    reject(new Error('Error with sql execution: ' + err));
                }
                connection.close();
                resolve(results);
            }

            connection.on('connect', function(err) {
                if (err) {
                    reject(new Error('Error connecting: ' + err));
                    return;
                }

                var request = new tedious.Request(options.query, requestCallback);

                _.each(options.params, function(param) {
                    request.addParameter(param.name, param.type, param.value);
                });

                function onRow(columns) {
                    var row = {};
                    columns.forEach(column => {
                        row[column.metadata.colName] = column.value;
                    });
                    results.push(row);
                }

                request.on('row', onRow);
                request.on('requestCompleted', function() {
                    connection.close();
                });

                connection.execSql(request);
            });

            connection.connect();
        }

        function qExecuteStatement(resolve, reject) {
            var results = [];
            var config = {
                server: options.source.server,
                authentication: {
                    type: 'default',
                    options: {
                        userName: options.source.userName,
                        password: options.source.password
                    }
                },
                options: {
                    ...options.source.options,
                    trustServerCertificate: true
                }
            };
            var connection = new tedious.Connection(config);

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
                _.each(columns, function(column) {
                    data[column.metadata.colName] = column.value;
                });
                results.push(data);
            }

            connection.on('connect', function(err) {
                if (err) {
                    reject(new Error('Error connecting: ' + err));
                    return;
                }
                var request = new tedious.Request(options.query, onRequestError);

                _.each(options.params, function(param) {
                    request.addParameter(param.name, param.type, param.value);
                });

                request.on('row', onRow);
                connection.execSql(request);
            });

            connection.connect();
        }

        function noServerError(resolve, reject) {
            reject(new Error('No server supplied'));
        }

        if (!options.source) {
            return new q.Promise(noServerError);
        }
        if (options.queryType == 'storedProcedure') {
            return new q.Promise(qExecuteStoredProcedure);
        } else {
            return new q.Promise(qExecuteStatement);
        }

    }

    q.dbSql = qDbSql;

    return q;
}


module.exports = dbSql;