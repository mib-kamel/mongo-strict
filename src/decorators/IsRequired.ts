interface IsRequiredOptions {
    message?: string
}

export function IsRequired(isRequiredOptions: IsRequiredOptions = {}) {
    return function (target: any, propertyKey: string) {
        if (!target.ORM_SCHEMA) target.ORM_SCHEMA = {}
        if (!target.ORM_SCHEMA[propertyKey]) target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].isRequiredOptions = { key: propertyKey, ...isRequiredOptions };
    }
}
