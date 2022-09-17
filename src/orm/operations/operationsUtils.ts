
import { ObjectId } from "mongodb";
import { validate } from "class-validator";
import { isObjectID, isStringObjectID } from "../utils/utils";
import { getRefCheckCollection } from "../utils/refCheckCollection";
import { ReferenceEntity } from "../interfaces/orm.interfaces";

export async function checkReferenceEntities(collection, referenceEntities, updateData) {
    if (referenceEntities?.length) {
        const lookups = [];
        const toBeCheckedKeys = [];

        for (let i = 0; i < referenceEntities.length; i++) {
            const ref = referenceEntities[i];

            if (ref._refererCollectionName) continue;

            let refCreateData = updateData[ref.key];

            if (!!refCreateData && ref.isArray && !Array.isArray(refCreateData)) {
                throw new Error(ref.localKeyName + ' is not array.');
            } else if (!!refCreateData) {

                let refCreateDateArray = refCreateData;

                if (!ref.isArray) {
                    refCreateDateArray = [refCreateDateArray]
                }

                for (let j = 0; j < refCreateDateArray.length; j++) {
                    let findKey = ref.refersToKey;
                    if (findKey === 'id') {
                        findKey = '_id';
                    }

                    let findValue = refCreateDateArray[j];
                    if (findKey === '_id' && typeof findValue === 'string') {
                        findValue = new ObjectId(findValue);
                    }

                    toBeCheckedKeys.push({
                        key: ref.key,
                        message: ref.message
                    });

                    lookups.push(
                        {
                            "$lookup": {
                                "from": ref.refersToCollectionName,
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    '$' + findKey,
                                                    findValue
                                                ]
                                            }
                                        }
                                    },
                                    { "$project": { "_id": 1 } }
                                ],
                                as: ref.key
                            }
                        }
                    )
                }
            }
        }

        lookups.push({ '$limit': 1 });

        const x = getRefCheckCollection().aggregate(lookups);

        let res = await x.toArray();

        res = res[0];

        const notValidRefKeys = [];

        toBeCheckedKeys.forEach(({ key, message }) => {
            if (!res[key]?.length) {
                notValidRefKeys.push(key)
            }
        });

        if (notValidRefKeys.length) {
            throw {
                message: 'Not found reference keys',
                missedReferenceKeys: notValidRefKeys,
                errorMessages: notValidRefKeys.map((key) => {
                    const ref = referenceEntities.find((ref) => ref.key === key);
                    const message = ref?.message;
                    return message || `${key} is not found`
                })
            }
        }
    }

    return true;
}

export function updateRefObjectIdsKeys(referenceEntities, refData) {
    for (let i = 0; i < referenceEntities.length; i++) {
        const ref = referenceEntities[i];
        const refValue = refData[ref.key]
        if ((ref.refersToKey === 'id' || ref.refersToKey === '_id') && refValue) {
            if (typeof refValue === 'string') {
                refData[ref.key] = new ObjectId(refValue);
            } else if (Array.isArray(refValue)) {
                refData[ref.key] = refValue.map((r) => typeof r === 'string' ? new ObjectId(r) : r);
            }
        }
    }

    return refData;
}

export function checkRequiredKeys(requiredKeys, insertData) {
    const notFoundRequiredKeys = [];

    requiredKeys.forEach((req) => {
        if (insertData[req.key] === undefined) {
            notFoundRequiredKeys.push(req.key)
        }
    })

    if (notFoundRequiredKeys.length) {
        throw {
            message: 'Not Found Required Keys',
            notFoundRequiredKeys,
            errorMessages: notFoundRequiredKeys.map((key) => {
                return requiredKeys[key]?.message || `${key} is not found`
            })
        };
    }
}

export const validateData = async (EntityDataValidator, insertData, repositoryOptions, isPartial = false) => {
    const insertObject = new EntityDataValidator();
    Object.assign(insertObject, insertData);

    const { entityClassValidatorOptions } = repositoryOptions;
    entityClassValidatorOptions.skipMissingProperties = isPartial;

    const errors = await validate(insertObject, entityClassValidatorOptions);

    if (errors?.length) {
        let errorMessages = errors.map((e: any) => Object.keys(e.constraints).map((k: any) => e.constraints[k])).flat();
        let invalidKeys = errors.map((e: any) => e.property);

        throw {
            message: 'Invalid Data Found',
            invalidKeys,
            errorMessages
        };
    }
}

export function fillDefaultValue(defaultValues, insertData) {
    defaultValues.forEach(({ key, value }) => {
        if (insertData[key] === undefined) {
            insertData[key] = value;
        }
    })
}

export function checkDuplicatedUniqueKeys(uniqueKeys, updateData) {
    const foundUniqueKeys = [];

    uniqueKeys.forEach((uni) => {
        if (updateData[uni.key]) {
            foundUniqueKeys.push(uni.key);
        }
    })

    if (foundUniqueKeys.length) {
        throw {
            message: 'Can\'t set many entities with the same unique keys',
            existingUniqueKeys: foundUniqueKeys,
            errorMessages: foundUniqueKeys.map((key) => {
                return uniqueKeys[key]?.message || `${key} should be unique`
            })
        };
    }
}

export function getWhereObject(where: any, referenceEntities: ReferenceEntity[]) {
    if (where === undefined) {
        return {};
    }

    if (typeof where === 'object' && Object.keys(where).length === 0) {
        return where;
    }

    if (typeof where === 'string' && isStringObjectID(where)) {
        where = { _id: new ObjectId(where) };
    } else if (isObjectID(where)) {
        where = { _id: where };
    } else if (Array.isArray(where)) {
        where = {
            $or: where.map((id) => {
                if (typeof id === 'string' && isStringObjectID(id)) {
                    return { _id: new ObjectId(id) };
                } else if (isObjectID(id)) {
                    return { _id: id };
                }
            })
        }
    } else if (typeof where === 'object') {
        if (where.id) {
            where._id = where.id;
            delete where.id;
        }
        if (typeof where._id === 'string' && isStringObjectID(where._id)) {
            where._id = new ObjectId(where._id);
        }

        const dataKeys = Object.keys(where);

        for (let i = 0; i < dataKeys.length; i++) {
            const currentKey = dataKeys[i];
            const currentData = where[currentKey];

            const currentKeyRef = referenceEntities.find((ref) => ref.as === currentKey || ref.key === currentKey);

            if (currentKeyRef && isStringObjectID(currentData)) {
                where[currentKey] = new ObjectId(currentData);
            }
        }
    }

    return where;
}