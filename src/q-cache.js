var _ = require('lodash');

function PackageCache() {
    'use strict';
    var registry = [];

    function uniqueIds(datum) {
        return datum.id;
    }

    function cleanOldItems(datum) {
        return new Date(datum.expires).getTime() > new Date().getTime();
    }

    function repairRegistry(key) {
        function currentKey(datum) {
            return datum.id !== key;
        }
        
        registry = _
            .chain(registry)
            .uniq(uniqueIds)
            .filter(cleanOldItems)
            .filter(currentKey)
            .value();
    }

    function add(item) {
        repairRegistry(item.id);
        registry.push(item);
    }

    function returnRegistry() {
        repairRegistry();
        return registry;
    }

    this.repair = repairRegistry;
    this.add = add;
    this.list = returnRegistry;
}

module.exports = new PackageCache();