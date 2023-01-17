export function RefersTo(refersTo) {
    return function (target, propertyKey) {
        if (!target.ORM_SCHEMA)
            target.ORM_SCHEMA = {};
        if (!target.ORM_SCHEMA[propertyKey])
            target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].refersTo = refersTo;
    };
}
