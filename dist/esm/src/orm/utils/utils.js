import { ObjectId } from "mongodb";
import { RELATION_TYPES } from "../interfaces/orm.interfaces";
export function getEntityProperties(entity, repositoryOptions, EntityClass) {
    let defaultSelectFields = repositoryOptions.defaultSelectFields || [];
    let isAutoCreateUniqueIndex = !!repositoryOptions.isAutoCreateUniqueIndex;
    let schema = entity.ORM_SCHEMA || {};
    let referenceEntities = Object.keys(schema).filter((key) => schema[key].refersTo).map((key) => {
        return {
            key,
            refersToCollectionName: schema[key].refersTo.collection,
            refersToKey: schema[key].refersTo.key,
            maxDepth: !isNaN(schema[key].refersTo.maxDepth) ? schema[key].refersTo.maxDepth : 1,
            isArray: !!schema[key].refersTo.isArray,
            reverseRefering: schema[key].refersTo.reverseRefering,
            reverseReferingAs: schema[key].refersTo.reverseReferingAs,
            type: schema[key].refersTo.type
        };
    });
    const uniqueOptions = Object.keys(schema)
        .filter((key) => schema[key].uniqueOptions !== undefined) || [];
    let uniqueKeys = [];
    let uniqueIndexes = [];
    if (isAutoCreateUniqueIndex) {
        uniqueKeys = uniqueOptions
            .filter((key) => schema[key].uniqueOptions.isAutoCreateUniqueIndex === false)
            .map((key) => {
            return schema[key].uniqueOptions;
        });
        uniqueIndexes = uniqueOptions
            .filter((key) => schema[key].uniqueOptions.isAutoCreateUniqueIndex !== false)
            .map((key) => {
            return schema[key].uniqueOptions;
        });
    }
    else {
        uniqueKeys = uniqueOptions
            .filter((key) => schema[key].uniqueOptions.isAutoCreateUniqueIndex !== true)
            .map((key) => {
            return schema[key].uniqueOptions;
        });
        uniqueIndexes = uniqueOptions
            .filter((key) => schema[key].uniqueOptions.isAutoCreateUniqueIndex === true)
            .map((key) => {
            return schema[key].uniqueOptions;
        });
    }
    if (!uniqueKeys) {
        uniqueKeys = [];
    }
    referenceEntities.forEach((ref) => {
        if (ref.refersToKey && (ref.type === RELATION_TYPES.ONE_TO_ONE) && !uniqueKeys.find((uni) => uni.key === ref.key)) {
            uniqueKeys.push({
                key: ref.key
            });
        }
        if (ref.refersToKey && !ref.type && ref.isArray) {
            ref.type = RELATION_TYPES.MANY_TO_MANY;
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
    const entityProperties = {
        referenceEntities,
        uniqueKeys,
        uniqueIndexes,
        defaultValues,
        requiredKeys,
        defaultSelectFields,
        dataValidators: EntityClass
    };
    return entityProperties;
}
export function isObjectID(id) {
    if (!(id === null || id === void 0 ? void 0 : id.toString()) || typeof id !== 'object') {
        return false;
    }
    try {
        new ObjectId(id.toString());
    }
    catch (e) {
        return false;
    }
    return true;
}
export function isStringObjectID(id) {
    if (typeof id !== 'string') {
        return false;
    }
    try {
        new ObjectId(id);
    }
    catch (e) {
        return false;
    }
    return true;
}
export const dataObjectIdToString = (data, referenceEntities = []) => {
    var _a, _b, _c, _d;
    if (!data) {
        return;
    }
    if (data === null || data === void 0 ? void 0 : data._id) {
        data.id = data._id;
    }
    const dataKeys = Object.keys(data);
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            if (isObjectID(data[i])) {
                data[i] = (_a = data[i]) === null || _a === void 0 ? void 0 : _a.toString();
            }
            else if (typeof data[i] === 'object') {
                dataObjectIdToString(data[i], referenceEntities);
            }
        }
    }
    else if (data instanceof Object && (dataKeys === null || dataKeys === void 0 ? void 0 : dataKeys.length)) {
        for (let i = 0; i < dataKeys.length; i++) {
            const currentKey = dataKeys[i];
            if (currentKey === 'id' && isObjectID(data[currentKey])) {
                data[currentKey] = (_b = data[currentKey]) === null || _b === void 0 ? void 0 : _b.toString();
                continue;
            }
            let keyRefEntity;
            if (referenceEntities === null || referenceEntities === void 0 ? void 0 : referenceEntities.length) {
                keyRefEntity = referenceEntities.find((ref) => ref.as === currentKey || ref.key === currentKey);
            }
            if (keyRefEntity && Array.isArray(data[currentKey])) {
                for (let j = 0; j < data[currentKey].length; j++) {
                    if (isObjectID(data[currentKey][j])) {
                        data[currentKey][j] = (_c = data[currentKey][j]) === null || _c === void 0 ? void 0 : _c.toString();
                    }
                    else if (typeof data[currentKey][j] === 'object') {
                        dataObjectIdToString(data[currentKey][j], keyRefEntity.referenceEntities);
                    }
                }
            }
            else if (keyRefEntity && typeof data[currentKey] === 'object') {
                if (isObjectID(data[currentKey])) {
                    data[currentKey] = (_d = data[currentKey]) === null || _d === void 0 ? void 0 : _d.toString();
                }
                else if (keyRefEntity && data[currentKey]) {
                    dataObjectIdToString(data[currentKey], keyRefEntity.referenceEntities);
                }
            }
        }
        delete data._id;
    }
};
