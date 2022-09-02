import { EntityProperties } from "../orm/interfaces/orm.interfaces";

export function Entity(entityOptions: EntityProperties) {
    return function (constructor: Function) {
        constructor.prototype.ORM_ENTITY_OPTIONS = entityOptions;
    }
}
