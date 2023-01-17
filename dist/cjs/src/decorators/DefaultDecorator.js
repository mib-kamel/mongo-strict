"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
function Default(defaultValue) {
    return function (target, propertyKey) {
        if (!target.ORM_SCHEMA)
            target.ORM_SCHEMA = {};
        if (!target.ORM_SCHEMA[propertyKey])
            target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].default = {
            key: propertyKey,
            value: defaultValue
        };
    };
}
exports.Default = Default;
