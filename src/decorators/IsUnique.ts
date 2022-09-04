interface UniqueOptions {
    isIgnoreCase?: boolean,
    message?: string
}

export function IsUnique(uniqueOptions: UniqueOptions = {}) {
    return function (target: any, propertyKey: string) {
        if (!target.ORM_SCHEMA) target.ORM_SCHEMA = {}
        if (!target.ORM_SCHEMA[propertyKey]) target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].uniqueOptions = { key: propertyKey, ...uniqueOptions };
    }
}
