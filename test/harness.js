'use strict';
var ottoman = require('../lib/ottoman.js');
var setup = require('./setup.js');
ottoman = setup.init(ottoman);
// Setup Ottoman
module.exports.lib = ottoman;
// Some helpers
function _saveAllModels(modelArr, callback) {
    var i = 0;
    (function __doOne() {
        if (i >= modelArr.length) {
            callback(null);
            return;
        }
        modelArr[i].save(function (err) {
            if (err) {
                callback(err);
                return;
            }
            i++;
            __doOne();
        });
    })();
}
module.exports.saveAll = _saveAllModels;
var uniqueIdCounter = 0;
function uniqueId(prefix) {
    return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;
//# sourceMappingURL=harness.js.map