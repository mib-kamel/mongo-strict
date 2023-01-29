import { ObjectId } from "mongodb";
import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
import { dataObjectIdToString, isObjectID } from "../utils/utils";
import { checkReferenceEntities, checkRequiredKeys, fillDefaultValue, updateRefObjectIdsKeys, validateData } from "./operationsUtils";

export async function insertOne(
    collection,
    uniqueKeys: any[],
    EntityDataValidator: any,
    referenceEntities: ReferenceEntity[],
    insertData: any,
    defaultValues: string[],
    requiredKeys: any[],
    repositoryOptions: RepositoryOptions
) {
    const createdAtKey = repositoryOptions.createdAtKey;
    const updatedAtKey = repositoryOptions.updatedAtKey;

    try {
        insertData = Object.assign({}, insertData);
        delete insertData._id;
        delete insertData.id;
        fillDefaultValue(defaultValues, insertData);
        await validateInsert(collection, uniqueKeys, EntityDataValidator, referenceEntities, insertData, false, requiredKeys, repositoryOptions);
        const now = new Date();
        repositoryOptions?.autoCreatedAt && (insertData[createdAtKey] = now);
        repositoryOptions?.autoUpdatedAt && (insertData[updatedAtKey] = now);
        await collection.insertOne(insertData);

        dataObjectIdToString(insertData, referenceEntities);
        return insertData;
    } catch (err: any) {
        if (err.code === 11000 || err.code === 11001) {
            throw {
                message: 'Existing unique keys',
                // existingUniqueKeys: foundUniqueKeys,
                errorMessages: ['Unique key already exists']
            };
        }
        throw err;
    }
}

export async function validateInsert(
    collection,
    uniqueKeys: any[],
    EntityDataValidator: any,
    referenceEntities: ReferenceEntity[],
    insertData: any,
    isClone = true,
    requiredKeys: any[],
    repositoryOptions: RepositoryOptions
) {
    try {
        if (isClone) {
            insertData = Object.assign({}, insertData);
        }

        checkRequiredKeys(requiredKeys, insertData);
        const validatePromise = validateData(EntityDataValidator, insertData, repositoryOptions, false);
        const uniquePromise = checkInsertUniqueKeys(collection, uniqueKeys, insertData, referenceEntities);
        await Promise.all([validatePromise, uniquePromise]);

        await checkReferenceEntities(collection, referenceEntities, insertData);

        insertData = updateRefObjectIdsKeys(referenceEntities, insertData);

        return true;
    } catch (err) {
        throw err;
    }
}

async function checkInsertUniqueKeys(collection, uniqueKeys, insertData, referenceEntities: ReferenceEntity[]) {
    const findUniqueKeysWhere = [];

    uniqueKeys.forEach((uni: any) => {
        let obj = {};
        const { key, isIgnoreCase } = uni;

        if (insertData[key] === undefined) {
            return;
        }

        const keyFromRefs = referenceEntities.find((ref: ReferenceEntity) => ref.key === key && !!ref.refersToCollectionName)

        const isIdKey = keyFromRefs?.refersToKey === 'id' || keyFromRefs?.refersToKey === '_id';

        if (isIdKey) {
            obj[key] = new ObjectId(insertData[key]);
        } else if (isIgnoreCase && typeof insertData[key] === 'string') {
            obj = {
                $expr: {
                    $eq: [
                        { $toLower: `$${key}` },
                        { $toLower: insertData[key] }
                    ]
                }
            }
        } else {
            obj[key] = insertData[key];
        }

        findUniqueKeysWhere.push(obj);
    });

    if (findUniqueKeysWhere && findUniqueKeysWhere.length) {
        const existingUniquesKeysRecords = await collection.find({
            $or: findUniqueKeysWhere
        }).limit(100).toArray();

        if (existingUniquesKeysRecords?.length) {
            const foundUniqueKeys = [];

            uniqueKeys.forEach((uni: any) => {
                const { key, isIgnoreCase } = uni;

                const ref = referenceEntities.find((r) => r.key === key || r.as === key);

                let isKeyFound;

                if (ref && (ref.refersToKey === 'id' || ref.refersToKey === '_id')) {
                    isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res: any) => {
                        return res[key]?.toString() === insertData[key];
                    })
                } else if (isIgnoreCase) {
                    isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res: any) => res[key]?.toString().toLowerCase() === insertData[key].toString()?.toLowerCase())
                } else {
                    isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res: any) => res[key] === insertData[key])
                }

                if (isKeyFound) {
                    foundUniqueKeys.push(key);
                }
            });

            throw {
                message: 'Existing unique keys',
                existingUniqueKeys: foundUniqueKeys,
                errorMessages: foundUniqueKeys.map((key) => {
                    const keyMessage = uniqueKeys.find((uni) => uni.key === key)?.message
                    return keyMessage || `${key} is already exists`
                })
            };
        }
    }
}