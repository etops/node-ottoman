'use strict';
var uuid = require('uuid');
function autogenUuid() {
    return uuid.v4();
}
module.exports = {
    uuid: autogenUuid
};
//# sourceMappingURL=autofns.js.map