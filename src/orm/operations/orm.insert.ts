import { ObjectId } from "mongodb";
import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
import { checkReferenceEntities, checkRequiredKeys, fillDefaultValue, revertRefsObjectIdsToString, updateRefObjectIdsKeys, validateData } from "./operationsUtils";
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

        revertRefsObjectIdsToString(referenceEntities, insertData);
        insertData.id = insertData._id.toString();
        delete insertData._id;
        return insertData;
    } catch (err) {
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
            insertData = structuredClone(insertData);
        }

        checkRequiredKeys(requiredKeys, insertData);
        const validatePromise = validateData(EntityDataValidator, insertData, false);
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
        const { key, isCaseInsensitive } = uni;

        if (insertData[key] === undefined) {
            return;
        }

        if (isCaseInsensitive && typeof insertData[key] === 'string') {
            obj[key] = { $regex: new RegExp(`^${insertData[key]}$`), $options: 'i' };
        } else {
            obj[key] = insertData[key];
        }

        const keyFromRefs = referenceEntities.find((ref: ReferenceEntity) => ref.key === key && !!ref.refersToCollectionName)

        if (keyFromRefs?.refersToKey === 'id') {
            obj[key] = new ObjectId(insertData[key]);
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
                const { key, isCaseInsensitive } = uni;

                let isKeyFound;

                if (isCaseInsensitive) {
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