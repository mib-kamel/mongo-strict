import { RELATION_TYPES } from "../orm/interfaces/orm.interfaces";

interface EntityRefersTo {
    collection: string;
    key: string;
    isArray?: boolean;
    maxDepth?: number;
    type?: RELATION_TYPES;
    message?: string;
}

export function RefersTo(refersTo: EntityRefersTo) {
    return function (target: any, propertyKey: string) {
        if (!target.ORM_SCHEMA) target.ORM_SCHEMA = {}
        if (!target.ORM_SCHEMA[propertyKey]) target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].refersTo = refersTo;
    }
}
