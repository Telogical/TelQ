'use strict';

var q = require('../src/TelQ');
var _ = require('lodash');

function get(options) {

  function forwardResolve(data) {
    var hasError = _.has(data, 'errorId') || _.has(data, 'errorMessage') || _.has(data, 'Error');

    if(hasError) {
         resourcePromise.reject(data);
    }

    resourcePromise.resolve(data);
  }

  function forwardError(err) {
    resourcePromise.reject(err);
  }

  var resourcePromise = q.defer();

  var requestComplete = q.get(options);

  requestComplete.then(forwardResolve, forwardError);

  return resourcePromise.promise;
}

function err(theError){
    
 var errPromise = q.defer();
     errPromise.reject(theError);
     return errPromise.promise;
    
}

var httpResource = {
  'get': get,
  'err': err
};

module.exports = httpResource;