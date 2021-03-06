'use strict';
var assert = require('assert');
var Schema = require('../lib/ottomanSchema');
it('should provide a custom inspector for CoreTypes', function () {
    assert.equal(Schema.StringType.inspect(), 'CoreType(string)');
});
it('should provide a custom inspector for ModelRefs', function () {
    var testRef = new Schema.ModelRef('Test');
    assert.equal(testRef.inspect(), 'ModelRef(Test)');
});
//# sourceMappingURL=schema.test.js.map