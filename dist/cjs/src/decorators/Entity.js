"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
function Entity(entityOptions) {
    return function (constructor) {
        constructor.prototype.ORM_ENTITY_OPTIONS = entityOptions;
    };
}
exports.Entity = Entity;
