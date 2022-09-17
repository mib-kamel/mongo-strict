import { ObjectId } from "mongodb";
import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
import { dataObjectIdToString } from "../utils/utils";
import { checkReferenceEntities, checkRequiredKeys, fillDefaultValue, updateRefObjectIdsKeys, validateData } from "./operationsUtils";
const structuredClone = require('realistic-structured-clone');

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
        insertData = structuredClone(insertData);
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
    } catch (err) {
        throw err;
    }
}

// export async function insertMany(
//     collection,
//     uniqueKeys: any[],
//     EntityDataValidator: any,
//     referenceEntities: ReferenceEntity[],
//     insertData: any[],
//     defaultValues: string[],
//     requiredKeys: any[],
//     repositoryOptions: RepositoryOptions,
//     ordered = true
// ) {
//     const createdAtKey = repositoryOptions.createdAtKey;
//     const updatedAtKey = repositoryOptions.updatedAtKey;

//     try {
//         insertData = structuredClone(insertData);

//         for (let i = 0; i < insertData.length; i++) {
//             const cur = insertData[i];
//             delete cur._id;
//             delete cur.id;
//             fillDefaultValue(defaultValues, cur);
//             checkRequiredKeys(requiredKeys, cur);
//         }

//         await validateInsert(collection, uniqueKeys, EntityDataValidator, referenceEntities, insertData, false, requiredKeys, repositoryOptions);

//         // const now = new Date();
//         // repositoryOptions?.autoCreatedAt && (insertData[createdAtKey] = now);
//         // repositoryOptions?.autoUpdatedAt && (insertData[updatedAtKey] = now);
//         // await collection.insertOne(insertData);

//         // revertRefsObjectIdsToString(referenceEntities, insertData);
//         // insertData.id = insertData._id.toString();
//         // delete insertData._id;
//         // return insertData;
//     } catch (err) {
//         throw err;
//     }
// }

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
            insertData = structuredClone(insertData);
        }

        checkRequiredKeys(requiredKeys, insertData);
        const validatePromise = validateData(EntityDataValidator, insertData, repositoryOptions, false);
        const uniquePromise = checkInsertUniqueKeys(collection, uniqueKeys, insertData, referenceEntities);
        await Promise.all([validatePromise, uniquePromise]);

        insertData = updateRefObjectIdsKeys(referenceEntities, insertData);
        await checkReferenceEntities(collection, referenceEntities, insertData);
    } catch (err) {
        throw err;
    }
}

async function checkInsertUniqueKeys(collection, uniqueKeys, insertData, referenceEntities: ReferenceEntity[]) {
    const findUniqueKeysWhere = [];

    uniqueKeys.forEach((uni: any) => {
        const obj = {};
        const { key, isIgnoreCase } = uni;

        if (insertData[key] === undefined) {
            return;
        }

        const keyFromRefs = referenceEntities.find((ref: ReferenceEntity) => ref.key === key && !!ref.refersToCollectionName)

        const isIdKey = keyFromRefs?.refersToKey === 'id' || keyFromRefs?.refersToKey === '_id';

        if (!Array.isArray(insertData)) {
            if (isIgnoreCase && typeof insertData[key] === 'string') {
                obj[key] = { $regex: new RegExp(`^${insertData[key]}$`), $options: 'i' };
            } else if (isIdKey) {
                obj[key] = new ObjectId(insertData[key]);
            } else {
                obj[key] = insertData[key];
            }
        } else {
            if (isIgnoreCase && typeof insertData[key] === 'string') {
                obj[key] = { $in: [insertData.map((d) => new RegExp(`^${d[key]}$`), '$i')] };
            } else if (isIdKey) {
                obj[key] = { $in: [insertData.map((d) => new ObjectId(d[key]))] };
            } else {
                obj[key] = { $in: [insertData.map((d) => d[key])] };
            }
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

                let isKeyFound;

                if (isIgnoreCase) {
                    isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res: any) => res[key].toString().toLowerCase() === insertData[key].toString().toLowerCase())
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