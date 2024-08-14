TelQ
====
Telogical's wrap of RSVP with helper methods and caching.

Install TelQ with the command:
```
npm install telq
```

To use TelQ, require it and start calling the http functions with the options
parameter.  The options object for all TelQ functions require two properties.

```js
{
  url: 'The source of the data',
  params: 'The filters for the source data (querystring params, query params, etc')
}
```

##Basic Usage

The TelQ http functions wrap [request](https://github.com/mikeal/request) so any params that are
needed for other http functions should be included in the options object

```js
var q = require('telq');

var options = {
  url: 'http://someapi',
  params: {
      param1Key: 'param1Value',
      param2Key: 'param2Value'
    }
};

var qUrl = q.get(options);

qUrl.then(resolveCallback, rejectCallback);
```

##Resources

All top level (eg it is a resource, such as dbSql, or db Mongoose) plugins input options should conform to this schema:

```js
{
  source: 'The source of the data',
  query: 'The filters for the source data (querystring params, query params, etc)
}

```

###DbSql

The dbSql extension wraps [tedious](https://github.com/pekim/tedious).  The options.source property should be an object with the address of the sql instance you wish to connect to, username, password, and an object with the queried databases.  Also you will include the string query you wish to execute.  If you are executing a read query the data will be passed back through the data parameter of the success callback.

```js
var q = require('telq');
var dbSql = require('telq/dbSql');

q.use(dbSql);

var options = {
    source: {
        server: 'address of server',
        userName: 'User',
        password: 'Password',
        queryDatabases: {pets: 'Pets'}
    },
    query: 'SELECT * FROM Cats'
};

var qSql = q.dbSql(options);

qSql.then(resolveCallback, rejectCallback);
```

You can also tell the dbSql extension to execute a stored procedure.  The options.source property remains the same as the string query method, but for the query property you should give the stored procedure name.  There are two additional properties that need to be added for this function which are options.queryType and options.params.  QueryType should be a string of 'storedProcedure' and params is an array of objects with the properties shown below.

```js
var TYPES = tedious.TYPES;
var options = {
                queryType: 'storedProcedure',
                source: sqlserverDatabase,
                query: databaseName + '.storedProcedureName',
                params: [
                    {
                        name: 'ParameterName1',
                        type: TYPES.VarChar,
                        value: parameterValue1
                    },
                    {
                        name: 'ParameterName2',
                        type: TYPES.Int,
                        value: parameterValue2
                    }
                ]
            };
var promise = q.dbSql(options);
```
#Plugin Creation

At some point you might decide to extend TelQ to encapsulate some domain process or resource. 
A plugin is function that takes q as its only parameter , with functions that take a single options object.

```js

function someResource(q) {

    function operationUno(opts) {
        var defer = q.defer();
    
        //async stuff
        q.resolve('uno!');
        
        return defer.promise();
    }
    
    function operationDos(opts){
        
        return q.resolve('dos!');
    }

    q.domainVernacular  = {
        operationUno: operationUno,
        operationDos: operationDos
    
    };

    return q;
}

module.exports = someResource;

```

if the q plugin is top level (eg it is a resource, such as dbSql, or db Mongoose), then the options should conform to this schema:

```js
{
  source: 'The source of the data',
  query: 'The filters for the source data (querystring params, query params, etc')
}

```

if the q plugin is domain level, then the domain concerns will dictate the object schema. These should reside in the your domain's namespace.
to prevent stomping on other plugins being fluently configured use

```js

q.yourDomain = q.yourDomain || {};

```
at the top of the plugin.












