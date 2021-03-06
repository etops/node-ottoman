'use strict';
var util = require('util');
var ottopath = require('./ottopath');
var StoreAdapter = require('./ottomanStoreadapter');
var findField = require('./_findField');
/**
 * A validator function validates a Schema field to ensure it
 * matches the expected traits.
 *
 * @typedef {function} OttomanSchema.Validator
 *
 * @param {*} value
 *  The value of the property being validated.
 */
function CoreType(type) {
    this.type = type;
}
CoreType.prototype.inspect = function () {
    return 'CoreType(' + this.type + ')';
};
var stringCoreType = new CoreType('string');
var numberCoreType = new CoreType('number');
var integerCoreType = new CoreType('integer');
var boolCoreType = new CoreType('boolean');
var dateCoreType = new CoreType('Date');
var mixedCoreType = new CoreType('Mixed');
var isModelRefType = function (variableToCheck) {
    return variableToCheck instanceof ModelRef;
};
function ModelRef(name) {
    this.name = name;
}
ModelRef.prototype.inspect = function () {
    return 'ModelRef(' + this.name + ')';
};
// todo replace these simple checks with classes
var isListFieldType = function (variableToCheck) {
    return variableToCheck instanceof ListField;
};
function ListField(type) {
    this.type = type;
}
ListField.prototype.inspect = function () {
    return 'ListField(' + util.inspect(this.type) + ')';
};
function SchemaField() {
    this.name = '';
    this.type = null;
    this.readonly = false;
    this.default = undefined;
    this.validator = null;
}
var isFieldGroupType = function (variableToCheck) {
    return variableToCheck instanceof FieldGroup;
};
function FieldGroup() {
    this.fields = [];
}
FieldGroup.prototype.create = function () {
    // TODO: Initialize field values here...
    return {};
};
function _matchIndexes(a, b) {
    if (a.type !== b.type) {
        return false;
    }
    if (a.fields.length !== b.fields.length) {
        return false;
    }
    for (var i = 0; i < a.fields.length; ++i) {
        if (a.fields[i] !== b.fields[i]) {
            return false;
        }
    }
    return true;
}
function SchemaIndex() {
    this.type = null;
    this.schema = null;
    this.fields = [];
}
function RefDocIndex() {
    SchemaIndex.call(this);
    this.type = 'refdoc';
}
util.inherits(RefDocIndex, SchemaIndex);
function SchemaIndexFn() {
    this.type = null;
    this.name = null;
    this.fields = null;
    this.consistency = StoreAdapter.SearchConsistency.NONE;
}
function RefDocIndexFn() {
    SchemaIndexFn.call(this);
    this.type = 'refdoc';
    this.consistency = StoreAdapter.SearchConsistency.GLOBAL;
}
util.inherits(RefDocIndexFn, SchemaIndexFn);
function ViewQueryFn() {
    this.type = null;
    this.name = null;
    this.of = '';
    this.field = null;
    this.consistency = StoreAdapter.SearchConsistency.NONE;
}
var isOttomanSchemaType = function (variableToCheck) {
    return variableToCheck instanceof OttomanSchema;
};
function OttomanSchema(context) {
    this.context = context;
    this.name = '';
    this.fields = [];
    this.idField = '';
    this.indices = [];
    this.indexFns = [];
    this.queryFns = [];
    this.preHandlers = {};
    this.postHandlers = {};
}
OttomanSchema.prototype.namePath = function (typeOnly) {
    if (typeOnly) {
        return this.name;
    }
    if (this.namespace) {
        return this.namespace + '::' + this.name;
    }
    return this.name;
};
// This function is private so the API can run the pre/post handlers
OttomanSchema.prototype._validate = function (mdlInst) {
    // Anything which is a fieldGroup causes a DFS of the trees to validate
    // any validators which are child elements in the tree
    var validateTree = function (field, instSubTree) {
        var current = null;
        if (instSubTree) {
            // instance might have a null subtree, but still needs validation
            current = instSubTree[field.name];
        }
        if (field.validator) {
            field.validator(current);
        }
        else if (isFieldGroupType(field.type)) {
            for (var j = 0; j < field.type.fields.length; ++j) {
                var child = field.type.fields[j];
                validateTree(child, current);
            }
        }
    };
    for (var i = 0; i < this.fields.length; ++i) {
        var field = this.fields[i];
        validateTree(field, mdlInst);
    }
};
OttomanSchema.prototype.validate = function (mdlInst, callback) {
    var self = this;
    this.execPreHandlers('validate', mdlInst, function (err) {
        if (err) {
            callback(err);
            return;
        }
        try {
            self._validate(mdlInst);
        }
        catch (e) {
            callback(e);
            return;
        }
        self.execPostHandlers('validate', mdlInst, callback);
    });
};
OttomanSchema.prototype.indexName = function (fields) {
    var fieldKeys = [];
    for (var i = 0; i < fields.length; ++i) {
        fieldKeys.push(fields[i].replace(/\./g, '::'));
    }
    return this.namePath(false) + '$' + fieldKeys.join('$');
};
OttomanSchema.prototype.refKeyPrefix = function (fields) {
    return '$' + this.indexName(fields);
};
OttomanSchema.prototype.refKey = function (fields, values) {
    return this.refKeyPrefix(fields) + '|' + values.join('|');
};
OttomanSchema.prototype.refKeys = function (mdl) {
    // Find all the refkey indexes associated with this model.
    var refIndices = [];
    for (var k = 0; k < this.indices.length; ++k) {
        var index = this.indices[k];
        if (!(index instanceof RefDocIndex)) {
            continue;
        }
        refIndices.push(index);
    }
    // We only need to be loaded if there are actually reference
    // keys associated with this model to generate, do an early-out
    // if there are no reference key indices.
    if (refIndices.length <= 0) {
        return [];
    }
    // Ensure we are loaded, otherwise we will not have the needed model
    //  data that is used to generate the reference keys.
    if (!mdl.$.loaded) {
        throw new Error('Cannot generate reference keys for an unloaded object.');
    }
    // Generate all our reference keys
    var refKeys = [];
    for (var i = 0; i < refIndices.length; ++i) {
        var refIndex = refIndices[i];
        var refValues = [];
        for (var j = 0; j < refIndex.fields.length; ++j) {
            var value = this.fieldVal(mdl, refIndex.fields[j]);
            //Prevents refdoc keys from having "undefined" values
            if (value === undefined) {
                refValues = [];
                break;
            }
            refValues.push(value);
        }
        //only if there were defined values should the refkey go through
        // this allows any number of null values to be stored without colliding
        if (refValues.length > 0) {
            refKeys.push(this.refKey(refIndex.fields, refValues));
        }
    }
    return refKeys;
};
OttomanSchema.prototype.addIndex = function (index) {
    for (var i = 0; i < this.indices.length; ++i) {
        var oldIndex = this.indices[i];
        if (_matchIndexes(oldIndex, index)) {
            return;
        }
    }
    this.indices.push(index);
};
OttomanSchema.prototype.addDefIndexFn = function (name, indexDef) {
    var fields = indexDef.by;
    if (!Array.isArray(fields)) {
        fields = [fields];
    }
    var index = new SchemaIndex();
    index.type = indexDef.type;
    index.schema = this;
    index.fields = fields;
    this.addIndex(index);
    var rdifn = new SchemaIndexFn();
    rdifn.type = indexDef.type;
    rdifn.name = name;
    rdifn.fields = fields;
    rdifn.consistency = indexDef.consistency;
    this.indexFns.push(rdifn);
};
OttomanSchema.prototype.addRefDocIndexFn = function (name, indexDef) {
    var fields = indexDef.by;
    if (!Array.isArray(fields)) {
        fields = [fields];
    }
    if (indexDef.consistency !== undefined &&
        indexDef.consistency !== StoreAdapter.SearchConsistency.GLOBAL) {
        throw new Error('Cannot define refdoc index with non-global consistency.');
    }
    var index = new RefDocIndex();
    index.schema = this;
    index.fields = fields;
    this.addIndex(index);
    var rdifn = new RefDocIndexFn();
    rdifn.name = name;
    rdifn.fields = fields;
    this.indexFns.push(rdifn);
};
OttomanSchema.prototype.addIndexFn = function (name, indexDef) {
    if (!indexDef.type) {
        indexDef.type = 'view';
    }
    if (indexDef.type === 'refdoc') {
        this.addRefDocIndexFn(name, indexDef);
    }
    else {
        this.addDefIndexFn(name, indexDef);
    }
};
OttomanSchema.prototype._tryAddDefQueryFn = function (name, queryDef) {
    var remoteTypeName = queryDef.of;
    var remoteField = queryDef.by;
    var remoteType = this.context.typeByName(remoteTypeName);
    if (!remoteType) {
        this.context._delayBind(remoteTypeName, this._tryAddDefQueryFn.bind(this, name, queryDef));
        return;
    }
    var remoteSchema = remoteType.schema;
    var index = new SchemaIndex();
    index.type = queryDef.type;
    index.schema = remoteSchema;
    index.fields = [remoteField];
    remoteSchema.addIndex(index);
};
OttomanSchema.prototype.addQueryFn = function (name, queryDef) {
    if (!queryDef.type) {
        queryDef.type = 'view';
    }
    this._tryAddDefQueryFn(name, queryDef);
    var vqfn = new ViewQueryFn();
    vqfn.type = queryDef.type;
    vqfn.name = name;
    vqfn.of = queryDef.of;
    vqfn.field = queryDef.by;
    vqfn.consistency = queryDef.consistency;
    this.queryFns.push(vqfn);
};
OttomanSchema.prototype.addField = function (field) {
    this.fields.push(field);
};
OttomanSchema.prototype.setIdField = function (path) {
    this.idField = path;
    if (this.idField) {
        var idField = this.field(this.idField);
        if (!idField) {
            throw new Error('Field `' + path +
                '` specified for id of model `' + this.name +
                '` does not exist.');
        }
        if (!idField.readonly) {
            throw new Error('Field `' + path +
                '` specified for id of model `' + this.name +
                '` must be readonly.');
        }
    }
};
OttomanSchema.prototype.fieldVal = function (mdl, name) {
    return eval(// jshint -W061
    'mdl.' + name);
};
function _fieldSearch(context, fields, name) {
    var parts = name.split('.');
    var lclPart = parts.shift();
    for (var i = 0; i < fields.length; ++i) {
        var field = fields[i];
        if (field.name === lclPart) {
            if (parts.length === 0) {
                return field;
            }
            else {
                if (context.isModel(field.type)) {
                    // TODO: This may not actually be good to have here...
                    return field.type.schema.field(parts.join('.'));
                }
                else if (isFieldGroupType(field.type)) {
                    return _fieldSearch(context, field.type.fields, parts.join('.'));
                }
                else if (isModelRefType(field.type)) {
                    throw new Error('Path cannot refer through reference type.');
                }
                else {
                    throw new Error('Invalid path specified.');
                }
            }
        }
    }
    return null;
}
OttomanSchema.prototype.field = function (name) {
    return _fieldSearch(this.context, this.fields, name);
};
function _fieldTypeSearchNamedFields(fields, fieldName) {
    var field = findField(fields, fieldName);
    if (field) {
        return field.type;
    }
    return null;
}
function _fieldTypeSearchNamed(obj, fieldName, context) {
    if (context.isModel(obj)) {
        return _fieldTypeSearchNamed(obj.schema, fieldName, context);
    }
    if (isOttomanSchemaType(obj)) {
        return _fieldTypeSearchNamedFields(obj.fields, fieldName);
    }
    else if (isFieldGroupType(obj)) {
        return _fieldTypeSearchNamedFields(obj.fields, fieldName);
    }
    else {
        throw new Error('Unexpected pathing object type.');
    }
}
function _fieldTypeSearchWildcard(obj) {
    if (isListFieldType(obj)) {
        return obj.type;
    }
    else {
        throw new Error('Path does not match Schema for wildcard array access.');
    }
}
function _decodeValue(context, type, data) {
    if (data instanceof Object && data.$ref) {
        if (!(isModelRefType(type))) {
            throw new Error('Field looks like a reference, but model does not agree!');
        }
        var modelType = context.typeByName(type.name);
        // TODO: This should probably be checked earlier than this!
        if (!modelType) {
            throw new Error('Invalid type specified (' + type.name + ')');
        }
        // OttomanSchema.Mixed is not defined, either author meant MixedType or it comes from OW-back
        // @ts-expect-error
        if ((modelType.type && modelType.type === 'Mixed') || modelType === OttomanSchema.Mixed) {
            // This is a mixed type reference, so we have to get the type from
            // the **reference**, not from the defined model type (Mixed)
            modelType = context.typeByName(data._type);
            if (!modelType) {
                throw new Error('Invalid type in mixed reference (' + data._type + ')');
            }
        }
        return modelType.ref(data.$ref);
    }
    else if (data instanceof Object && data._type) {
        if (type === mixedCoreType) {
            type = context.typeByName(data._type);
            if (!type) {
                throw new Error('Could not deduce mixed type from data.');
            }
        }
        return type.fromData(data);
    }
    else {
        if (type instanceof CoreType) {
            return data;
        }
        else if (context.isModel(type)) {
            return type.fromData(data);
        }
        else if (isListFieldType(type)) {
            if (!Array.isArray(data)) {
                throw new Error('Encountered a list field, but the data does not agree!');
            }
            var outArr = [];
            for (var i = 0; i < data.length; ++i) {
                outArr[i] = _decodeValue(context, type.type, data[i]);
            }
            return outArr;
        }
        else if (isFieldGroupType(type)) {
            if (typeof data !== 'object') {
                throw new Error('Encountered a group field, but the data does not agree!');
            }
            var outObj = {};
            _decodeFields(context, type.fields, outObj, data);
            return outObj;
        }
        else if (type instanceof ModelRef) {
            throw new Error('Encountered a ModelRef field, but the data does not agree!');
        }
        else {
            throw new Error('Unknown field type.');
        }
    }
}
function _decodeFields(context, fields, obj, data) {
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            if (i === '_type') {
                continue;
            }
            var field = findField(fields, i);
            if (!field) {
                throw new Error('Could not find schema field for `' + i + '`.');
            }
            obj[i] = _decodeValue(context, field.type, data[i]);
        }
    }
}
function _decodeUserFields(context, fields, obj, data) {
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            var field = findField(fields, i);
            if (!field) {
                throw new Error('Could not find schema field for `' + i + '`.');
            }
            /*eslint-disable no-use-before-define */
            obj[i] = _decodeUserValue(context, field.type, data[i]);
            /*eslint-enable no-use-before-define */
        }
    }
}
function _decodeUserValue(context, type, data) {
    if (type instanceof CoreType) {
        return data;
    }
    else if (context.isModel(type)) {
        var TypeCtor = type;
        return new TypeCtor(data);
    }
    else if (isListFieldType(type)) {
        if (!Array.isArray(data)) {
            throw new Error('Encountered a list field, but the data does not agree!');
        }
        var outArr = [];
        for (var i = 0; i < data.length; ++i) {
            outArr[i] = _decodeUserValue(context, type.type, data[i]);
        }
        return outArr;
    }
    else if (isFieldGroupType(type)) {
        if (!(data instanceof Object)) {
            throw new Error('Encountered a group field, but the data does not agree!');
        }
        var outObj = {};
        _decodeUserFields(context, type.fields, outObj, data);
        return outObj;
    }
    else if (isModelRefType(type)) {
        var expectedType = context.typeByName(type.name);
        // OttomanSchema.Mixed is not defined, either author meant MixedType or it comes from OW-back
        // @ts-expect-error
        if (type.name === 'Mixed' || expectedType === OttomanSchema.Mixed) {
            // Pass; mixed references are permitted.
        }
        else if (!(data instanceof expectedType)) {
            throw new Error('Expected value to be a ModelInstance of type `' + type.name + '`.');
        }
        return data;
    }
    else {
        throw new Error('Unknown field type.');
    }
}
function _fieldTypeSearch(obj, pathObj, context) {
    if (pathObj.operation === 'member') {
        if (pathObj.expression.type !== 'identifier') {
            throw new Error('Unexpected expression type for member operation.');
        }
        return _fieldTypeSearchNamed(obj, pathObj.expression.value, context);
    }
    else if (pathObj.operation === 'subscript') {
        if (pathObj.expression.type === 'string_literal') {
            return _fieldTypeSearchNamed(obj, pathObj.expression.value, context);
        }
        else if (pathObj.expression.type === 'wildcard') {
            return _fieldTypeSearchWildcard(obj);
        }
        else {
            throw new Error('Unexpected subscript expression type.');
        }
    }
    else {
        throw new Error('Unexpected path operation type.');
    }
}
OttomanSchema.prototype.fieldType = function (path) {
    var obj = this;
    var pathArr = ottopath.parse(path);
    for (var i = 0; i < pathArr.length; ++i) {
        if (!obj) {
            throw new Error('Invalid path specified.');
        }
        obj = _fieldTypeSearch(obj, pathArr[i], this.context);
    }
    return obj;
};
OttomanSchema.prototype.applyDataToObject = function (obj, data) {
    _decodeFields(this.context, this.fields, obj, data);
};
OttomanSchema.prototype.applyUserDataToObject = function (obj, data) {
    _decodeUserFields(this.context, this.fields, obj, data);
};
OttomanSchema.prototype.applyDefaultsToObject = function (obj) {
    for (var i = 0; i < this.fields.length; ++i) {
        var field = this.fields[i];
        if (isFieldGroupType(field.type)) {
            obj[field.name] = field.type.create();
        }
        else if (isListFieldType(field.type)) {
            obj[field.name] = [];
        }
        else {
            if (field.default instanceof Function) {
                obj[field.name] = field.default();
            }
            else if (field.default !== undefined) {
                obj[field.name] = field.default;
            }
        }
    }
};
OttomanSchema.prototype.applyPropsToObj = function (obj) {
    for (var i = 0; i < this.fields.length; ++i) {
        var field = this.fields[i];
        if (field.readonly) {
            Object.defineProperty(obj, field.name, {
                writable: false
            });
        }
    }
};
OttomanSchema.prototype.execPreHandlers = function (event, mdlInst, callback) {
    if (!this.preHandlers[event]) {
        callback(null);
        return;
    }
    var preHandlers = this.preHandlers[event];
    var i = 0;
    var doNext = function _doNextPreHandler(err) {
        // If any one of the pre-handlers fails, fail the whole thing.
        // This allows people to plug in additional validation.
        if (err) {
            return callback(err);
        }
        if (i === preHandlers.length) {
            callback(null);
            return;
        }
        var curI = i;
        i++;
        preHandlers[curI].call(mdlInst, mdlInst, doNext);
    };
    doNext();
};
OttomanSchema.prototype.execPostHandlers = function (event, mdlInst, callback) {
    if (!this.postHandlers[event]) {
        callback(null);
        return;
    }
    try {
        var postHandlers = this.postHandlers[event];
        for (var i = 0; i < postHandlers.length; ++i) {
            // After an action has taken place we don't really
            // need this callback, but we will add it for consistency
            // in the API: post handlers should expect to always get
            // 2 arguments, mdlInst and callback.
            var doNext = function () { };
            postHandlers[i].call(mdlInst, mdlInst, doNext);
        }
        callback(null);
    }
    catch (e) {
        callback(e);
    }
};
var supportedEvents = ['validate', 'save', 'load', 'remove'];
OttomanSchema.prototype.addPreHandler = function (event, callback) {
    if (supportedEvents.indexOf(event) === -1) {
        throw new Error('Unsupported event type `' + event + '`.');
    }
    if (!this.preHandlers[event]) {
        this.preHandlers[event] = [];
    }
    this.preHandlers[event].push(callback);
};
OttomanSchema.prototype.addPostHandler = function (event, fn) {
    if (supportedEvents.indexOf(event) === -1) {
        throw new Error('Unsupported event type `' + event + '`.');
    }
    if (!this.postHandlers[event]) {
        this.postHandlers[event] = [];
    }
    this.postHandlers[event].push(fn);
};
var _typeByNameLkp = {
    'string': stringCoreType,
    'number': numberCoreType,
    'integer': integerCoreType,
    'boolean': boolCoreType,
    'Date': dateCoreType,
    'Mixed': mixedCoreType
};
OttomanSchema.coreTypeByName = function (type) {
    var coreType = _typeByNameLkp[type];
    if (coreType) {
        return coreType;
    }
    return null;
};
OttomanSchema.isCoreType = function (type) {
    return type instanceof CoreType;
};
OttomanSchema.StringType = stringCoreType;
OttomanSchema.NumberType = numberCoreType;
OttomanSchema.IntegerType = integerCoreType;
OttomanSchema.BooleanType = boolCoreType;
OttomanSchema.DateType = dateCoreType;
OttomanSchema.MixedType = mixedCoreType;
OttomanSchema.Field = SchemaField;
OttomanSchema.ModelRef = ModelRef;
OttomanSchema.ListField = ListField;
OttomanSchema.FieldGroup = FieldGroup;
OttomanSchema.Index = SchemaIndex;
OttomanSchema.ViewQueryFn = ViewQueryFn;
OttomanSchema.RefDocIndexFn = RefDocIndexFn;
OttomanSchema.RefDocIndex = RefDocIndex;
module.exports = OttomanSchema;
//# sourceMappingURL=ottomanSchema.js.map