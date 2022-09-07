import { ObjectId } from "mongodb";
import { RELATION_TYPES, _EntityProperties } from "../interfaces/orm.interfaces";

export function getEntityProperties(entity: any, defaultSelectFields = [], EntityClass: any) {
    let schema = entity.ORM_SCHEMA || {};

    let referenceEntities = Object.keys(schema).filter((key) => schema[key].refersTo).map((key) => {
        return {
            key,
            refersToCollectionName: schema[key].refersTo.collection,
            refersToKey: schema[key].refersTo.key,
            maxDepth: !isNaN(schema[key].refersTo.maxDepth) ? schema[key].refersTo.maxDepth : 1,
            isArray: !!schema[key].refersTo.isArray,
            refersToAs: schema[key].refersTo.refersToAs,
            type: schema[key].refersTo.type
        }
    });

    let uniqueKeys = Object.keys(schema).filter((key) => schema[key].uniqueOptions !== undefined).map((key) => {
        return schema[key].uniqueOptions;
    });

    if (!uniqueKeys) {
        uniqueKeys = [];
    }

    referenceEntities.forEach((ref) => {
        if (ref.refersToKey && ref.type === RELATION_TYPES.ONE_TO_MANY && !uniqueKeys.find((uni) => uni.key === ref.key)) {
            uniqueKeys.push({
                key: ref.key
            });
        }

        if (ref.refersToKey && !ref.type && ref.isArray) {
            ref.type = RELATION_TYPES.MANY_TO_MANY
        }
    });

    if (!referenceEntities) {
        referenceEntities = [];
    }

    let requiredKeys = Object.keys(schema).filter((key) => schema[key].isRequiredOptions !== undefined).map((key) => {
        return schema[key].isRequiredOptions;
    });

    let defaultValues = Object.keys(schema).filter((key) => schema[key].default !== undefined).map((key) => {
        return {
            key: schema[key].default.key,
            value: schema[key].default.value
        };
    });

    const entityProperties: _EntityProperties = {
        referenceEntities,
        uniqueKeys,
        defaultValues,
        requiredKeys,
        defaultSelectFields,
        dataValidators: EntityClass
    };

    return entityProperties;
}

export function isObjectID(id) {
    if (!id?.toString() || typeof id !== 'object') {
        return false;
    }

    try {
        new ObjectId(id.toString());
    } catch (e) {
        return false
    }
    return true
}
