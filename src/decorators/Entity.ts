interface EntityProperties {
    name: string
}

export function Entity(entityOptions: EntityProperties) {
    return function (constructor: Function) {
        constructor.prototype.ORM_ENTITY_OPTIONS = entityOptions;
    }
}
