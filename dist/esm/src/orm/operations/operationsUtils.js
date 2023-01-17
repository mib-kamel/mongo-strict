var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ObjectId } from "mongodb";
import { validate } from "class-validator";
import { isObjectID, isStringObjectID } from "../utils/utils";
import { getRefCheckCollection } from "../utils/refCheckCollection";
export function checkReferenceEntities(collection, referenceEntities, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (referenceEntities === null || referenceEntities === void 0 ? void 0 : referenceEntities.length) {
            const lookups = [];
            const toBeCheckedKeys = [];
            for (let i = 0; i < referenceEntities.length; i++) {
                const ref = referenceEntities[i];
                if (ref._refererCollectionName)
                    continue;
                let refCreateData = updateData[ref.key];
                if (!!refCreateData && ref.isArray && !Array.isArray(refCreateData)) {
                    throw {
                        message: 'Invalid Data Found',
                        invalidKeys: [ref.key],
                        errorMessages: [ref.key + ' is not array.']
                    };
                }
                else if (!!refCreateData) {
                    let refCreateDateArray = refCreateData;
                    if (!ref.isArray) {
                        refCreateDateArray = [refCreateDateArray];
                    }
                    for (let j = 0; j < refCreateDateArray.length; j++) {
                        let findKey = ref.refersToKey;
                        if (findKey === 'id') {
                            findKey = '_id';
                        }
                        let findValue = refCreateDateArray[j];
                        if (findKey === '_id' && isStringObjectID(findValue)) {
                            findValue = new ObjectId(findValue);
                        }
                        else if (findKey === '_id' && !isObjectID(findValue)) {
                            throw {
                                message: 'Invalid Data Found',
                                invalidKeys: [findKey],
                                errorMessages: [`${findKey} refers to ${ref.refersToCollectionName}.${ref.refersToKey} and should be a valid ObjectId`]
                            };
                        }
                        toBeCheckedKeys.push({
                            key: ref.key,
                            message: ref.message
                        });
                        lookups.push({
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
                        });
                    }
                }
            }
            lookups.push({ '$limit': 1 });
            const x = getRefCheckCollection().aggregate(lookups);
            let res = yield x.toArray();
            res = res[0];
            const notValidRefKeys = [];
            toBeCheckedKeys.forEach(({ key, message }) => {
                var _a;
                if (!((_a = res[key]) === null || _a === void 0 ? void 0 : _a.length)) {
                    notValidRefKeys.push(key);
                }
            });
            if (notValidRefKeys.length) {
                throw {
                    message: 'Not found reference keys',
                    missedReferenceKeys: notValidRefKeys,
                    errorMessages: notValidRefKeys.map((key) => {
                        const ref = referenceEntities.find((ref) => ref.key === key);
                        const message = ref === null || ref === void 0 ? void 0 : ref.message;
                        return message || `${key} is not found`;
                    })
                };
            }
        }
        return true;
    });
}
export function updateRefObjectIdsKeys(referenceEntities, refData) {
    for (let i = 0; i < referenceEntities.length; i++) {
        const ref = referenceEntities[i];
        const refValue = refData[ref.key];
        if ((ref.refersToKey === 'id' || ref.refersToKey === '_id') && refValue) {
            if (typeof refValue === 'string' && isStringObjectID(refValue)) {
                refData[ref.key] = new ObjectId(refValue);
            }
            else if (Array.isArray(refValue)) {
                refData[ref.key] = refValue.map((r) => typeof r === 'string' ? new ObjectId(r) : r);
            }
            else if (!isObjectID(refValue)) {
                throw {
                    message: 'Invalid Data Found',
                    invalidKeys: [ref.key],
                    errorMessages: [`${ref.key} refers to ${ref.refersToCollectionName}.${ref.refersToKey} and should be a valid ObjectId`]
                };
            }
        }
    }
    return refData;
}
export function checkRequiredKeys(requiredKeys, insertData) {
    const notFoundRequiredKeys = [];
    requiredKeys.forEach((req) => {
        if (insertData[req.key] === undefined) {
            notFoundRequiredKeys.push(req.key);
        }
    });
    if (notFoundRequiredKeys.length) {
        throw {
            message: 'Not Found Required Keys',
            notFoundRequiredKeys,
            errorMessages: notFoundRequiredKeys.map((key) => {
                var _a;
                return ((_a = requiredKeys[key]) === null || _a === void 0 ? void 0 : _a.message) || `${key} is not found`;
            })
        };
    }
}
export const validateData = (EntityDataValidator, insertData, repositoryOptions, isPartial = false) => __awaiter(void 0, void 0, void 0, function* () {
    const insertObject = new EntityDataValidator();
    Object.assign(insertObject, insertData);
    const { entityClassValidatorOptions } = repositoryOptions;
    entityClassValidatorOptions.skipMissingProperties = isPartial;
    const errors = yield validate(insertObject, entityClassValidatorOptions);
    if (errors === null || errors === void 0 ? void 0 : errors.length) {
        let errorMessages = errors.map((e) => Object.keys(e.constraints).map((k) => e.constraints[k])).flat();
        let invalidKeys = errors.map((e) => e.property);
        throw {
            message: 'Invalid Data Found',
            invalidKeys,
            errorMessages
        };
    }
});
export function fillDefaultValue(defaultValues, insertData) {
    defaultValues.forEach(({ key, value }) => {
        if (insertData[key] === undefined) {
            insertData[key] = value;
        }
    });
}
export function checkDuplicatedUniqueKeys(uniqueKeys, updateData) {
    const foundUniqueKeys = [];
    uniqueKeys.forEach((uni) => {
        if (updateData[uni.key]) {
            foundUniqueKeys.push(uni.key);
        }
    });
    if (foundUniqueKeys.length) {
        throw {
            message: 'Can\'t set many entities with the same unique keys',
            existingUniqueKeys: foundUniqueKeys,
            errorMessages: foundUniqueKeys.map((key) => {
                var _a;
                return ((_a = uniqueKeys[key]) === null || _a === void 0 ? void 0 : _a.message) || `${key} should be unique`;
            })
        };
    }
}
export function getCurrentReference(key, referenceEntities) {
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
        }
        else {
            curRefs = undefined;
        }
    }
    return returnRef;
}
export function isRefersToId(referenceEntity) {
    if (!referenceEntity)
        return false;
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
