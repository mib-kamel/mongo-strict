
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
                throw {
                    message: 'Invalid Data Found',
                    invalidKeys: [ref.key],
                    errorMessages: [ref.key + ' is not array.']
                }
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
                    if (findKey === '_id' && isStringObjectID(findValue)) {
                        findValue = new ObjectId(findValue);
                    } else if (findKey === '_id' && !isObjectID(findValue)) {
                        throw {
                            message: 'Invalid Data Found',
                            invalidKeys: [findKey],
                            errorMessages: [`${findKey} refers to ${ref.refersToCollectionName}.${ref.refersToKey} and should be a valid ObjectId`]
                        }
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
            if (typeof refValue === 'string' && isStringObjectID(refValue)) {
                refData[ref.key] = new ObjectId(refValue);
            } else if (Array.isArray(refValue)) {
                refData[ref.key] = refValue.map((r) => typeof r === 'string' ? new ObjectId(r) : r);
            } else if (!isObjectID(refValue)) {
                throw {
                    message: 'Invalid Data Found',
                    invalidKeys: [ref.key],
                    errorMessages: [`${ref.key} refers to ${ref.refersToCollectionName}.${ref.refersToKey} and should be a valid ObjectId`]
                }
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

export function getCurrentReference(key: string, referenceEntities: ReferenceEntity[]) {
    const splittedKey = key.split('.');
    let returnRef;
    let curRefs = referenceEntities;

    for (let i = 0; i < splittedKey.length && curRefs !== undefined; i++) {
        const curKey = splittedKey[i];
        returnRef = curRefs.find((ref) => ref.key === curKey || (ref.refersToCollectionName && ref.as === curKey));
        if (returnRef) {
            curRefs = returnRef.referenceEntities;
            if (!curRefs && i !== splittedKey.length - 1) {
                returnRef = undefined;
            }
        } else {
            curRefs = undefined;
        }
    }
    return returnRef;
}

export function isRefersToId(referenceEntity: ReferenceEntity) {
    if (!referenceEntity) return false;
    return referenceEntity.refersToKey === 'id' || referenceEntity.refersToKey === '_id';
}

export function isId(searchKey) {
    if (searchKey === undefined) {
        return false;
    }

    const _idIndex = searchKey.indexOf('._id');
    const idIndex = searchKey.indexOf('.id');
    const keyLength = searchKey.length;
    return searchKey === 'id' || searchKey === '_id' || (idIndex === keyLength - 3 && keyLength > 2) || (_idIndex === keyLength - 4 && keyLength > 3);
}