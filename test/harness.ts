'use strict';
var ottoman = require('../lib/ottoman');
var ottomanSetup = require('./ottomanSetup');

ottoman = ottomanSetup.init(ottoman);

// Setup Ottoman
module.exports.lib = ottoman;

// Some helpers
module.exports.saveAll = ottomanSetup.saveAllModels;

var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;
