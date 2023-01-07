interface UniqueOptions {
    isIgnoreCase?: boolean,
    message?: string,
    isAutoCreateUniqueIndex?: boolean,
}

export function IsUnique(uniqueOptions: UniqueOptions = {}) {
    return function (target: any, propertyKey: string) {
        if (!target.ORM_SCHEMA) target.ORM_SCHEMA = {}
        if (!target.ORM_SCHEMA[propertyKey]) target.ORM_SCHEMA[propertyKey] = {};

        if (uniqueOptions.isIgnoreCase !== true) {
            uniqueOptions.isIgnoreCase = false;
        }

        target.ORM_SCHEMA[propertyKey].uniqueOptions = { key: propertyKey, ...uniqueOptions };
    }
}
