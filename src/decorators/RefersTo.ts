import { EntityRefersTo } from "../orm/interfaces/orm.interfaces";

export function RefersTo(refersTo: EntityRefersTo) {
    return function (target: any, propertyKey: string) {
        if (!target.ORM_SCHEMA) target.ORM_SCHEMA = {}
        if (!target.ORM_SCHEMA[propertyKey]) target.ORM_SCHEMA[propertyKey] = {};
        target.ORM_SCHEMA[propertyKey].refersTo = refersTo;
    }
}
