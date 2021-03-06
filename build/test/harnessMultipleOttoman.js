'use strict';
var ottoman = require('../lib/ottoman');
var H = require('./harness');
var ottomanSetup = require('./ottomanSetup');
// Some helpers
module.exports.saveAll = ottomanSetup.saveAllModels;
module.exports.uniqueId = H.uniqueId;
function setupOttoman(namespace, models, types) {
    var o = new ottoman.Ottoman({
        namespace: namespace,
        models: models,
        types: types
    });
    o.StoreAdapter = ottoman.StoreAdapter;
    o.StoreAdapter.Couchbase = ottoman.CbStoreAdapter;
    o.StoreAdapter.Mock = ottoman.MockStoreAdapter;
    o.CbStoreAdapter = o.StoreAdapter.Couchbase;
    o.MockStoreAdapter = o.StoreAdapter.Mock;
    o.Consistency = ottoman.StoreAdapter.SearchConsistency;
    o = ottomanSetup.init(o);
    return o;
}
module.exports.setupOttoman = setupOttoman;
//# sourceMappingURL=harnessMultipleOttoman.js.map