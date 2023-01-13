interface EntityReferer {
    collection: string;
    key: string;
    as: string;
    maxDepth?: number;
}

export function Referers(referers: EntityReferer[]) {
    return function (target: any, propertyKey: string) {
        if (!target.ORM_SCHEMA) target.ORM_SCHEMA = {}
        if (!target.ORM_SCHEMA[propertyKey]) target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].referers = referers;
    }
}
