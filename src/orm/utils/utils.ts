import { ObjectId } from "mongodb";
import { ReferenceEntity, RELATION_TYPES, RepositoryOptions, _EntityProperties } from "../interfaces/orm.interfaces";

export function getEntityProperties(entity: any, repositoryOptions: RepositoryOptions, EntityClass: any) {
    let defaultSelectFields = repositoryOptions.defaultSelectFields || [];
    let isAutoCreateUniqueIndex = !!repositoryOptions.isAutoCreateUniqueIndex;
    let schema = entity.ORM_SCHEMA || {};

    let referenceEntities: any = Object.keys(schema).filter((key) => schema[key].refersTo).map((key) => {
        return {
            key,
            refersToCollectionName: schema[key].refersTo.collection,
            refersToKey: schema[key].refersTo.key,
            maxDepth: !isNaN(schema[key].refersTo.maxDepth) ? schema[key].refersTo.maxDepth : 1,
            isArray: !!schema[key].refersTo.isArray,
            type: schema[key].refersTo.type
        }
    });

    Object.keys(schema).filter((key) => schema[key].referers).forEach((key) => {
        const referers = schema[key].referers;

        referers.forEach((referer: any) => {
            referenceEntities.push({
                key,
                _refererCollectionName: referer.collection,
                _refererKey: referer.key,
                as: referer.as,
                maxDepth: !isNaN(referer.maxDepth) ? referer.maxDepth : 1,
            })
        })
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
    } else {
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
        uniqueIndexes,
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

export function isStringObjectID(id) {
    if (typeof id !== 'string') {
        return false;
    }

    try {
        new ObjectId(id);
    } catch (e) {
        return false
    }
    return true
}

export const dataObjectIdToString = (data, referenceEntities: ReferenceEntity[] = []) => {
    if (!data) {
        return;
    }

    if (data?._id) {
        data.id = data._id;
    }

    const dataKeys = Object.keys(data);

    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            if (isObjectID(data[i])) {
                data[i] = data[i]?.toString();
            } else if (typeof data[i] === 'object') {
                dataObjectIdToString(data[i], referenceEntities)
            }
        }
    } else if (data instanceof Object && dataKeys?.length) {
        for (let i = 0; i < dataKeys.length; i++) {
            const currentKey = dataKeys[i];

            if (currentKey === 'id' && isObjectID(data[currentKey])) {
                data[currentKey] = data[currentKey]?.toString();
                continue;
            }

            let keyRefEntity: ReferenceEntity;

            if (referenceEntities?.length) {
                keyRefEntity = referenceEntities.find((ref) => ref.as === currentKey || ref.key === currentKey);
            }

            if (keyRefEntity && Array.isArray(data[currentKey])) {
                for (let j = 0; j < data[currentKey].length; j++) {
                    if (isObjectID(data[currentKey][j])) {
                        data[currentKey][j] = data[currentKey][j]?.toString();
                    } else if (typeof data[currentKey][j] === 'object') {
                        dataObjectIdToString(data[currentKey][j], keyRefEntity.referenceEntities)
                    }
                }
            } else if (keyRefEntity && typeof data[currentKey] === 'object') {
                if (isObjectID(data[currentKey])) {
                    data[currentKey] = data[currentKey]?.toString();
                } else if (keyRefEntity && data[currentKey]) {
                    dataObjectIdToString(data[currentKey], keyRefEntity.referenceEntities)
                }
            }
        }
        delete data._id;
    }
}
