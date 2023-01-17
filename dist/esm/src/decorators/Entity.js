export function Entity(entityOptions) {
    return function (constructor) {
        constructor.prototype.ORM_ENTITY_OPTIONS = entityOptions;
    };
}
