export function IsUnique(uniqueOptions = {}) {
    return function (target, propertyKey) {
        if (!target.ORM_SCHEMA)
            target.ORM_SCHEMA = {};
        if (!target.ORM_SCHEMA[propertyKey])
            target.ORM_SCHEMA[propertyKey] = {};
        if (uniqueOptions.isIgnoreCase !== true) {
            uniqueOptions.isIgnoreCase = false;
        }
        target.ORM_SCHEMA[propertyKey].uniqueOptions = Object.assign({ key: propertyKey }, uniqueOptions);
    };
}
