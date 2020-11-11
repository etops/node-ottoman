module.exports = function (fields, name) {
    for (var i = 0; i < fields.length; ++i) {
        if (fields[i].name === name) {
            return fields[i];
        }
    }
    return null;
};
//# sourceMappingURL=_findField.js.map