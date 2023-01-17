"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsRequired = void 0;
function IsRequired(isRequiredOptions = {}) {
    return function (target, propertyKey) {
        if (!target.ORM_SCHEMA)
            target.ORM_SCHEMA = {};
        if (!target.ORM_SCHEMA[propertyKey])
            target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].isRequiredOptions = Object.assign({ key: propertyKey }, isRequiredOptions);
    };
}
exports.IsRequired = IsRequired;
