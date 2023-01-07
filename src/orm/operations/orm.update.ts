import { ObjectId } from "mongodb";
import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
import { dataObjectIdToString, isObjectID } from "../utils/utils";
import { checkDuplicatedUniqueKeys, checkReferenceEntities, checkRequiredKeys, fillDefaultValue, updateRefObjectIdsKeys, validateData } from "./operationsUtils";
import { getWhereObject } from "./whereObjectHandle";

export default function update(
    collection,
    uniqueKeys: string[],
    EntityDataValidator: any,
    referenceEntities: ReferenceEntity[],
    where: any,
    defaultValues: string[],
    requiredKeys: any[],
    repositoryOptions: RepositoryOptions
) {
    const createdAtKey = repositoryOptions.createdAtKey;
    const updatedAtKey = repositoryOptions.updatedAtKey;

    if (!where) {
        throw "Update Condition Not Found";
    }

    where = getWhereObject(where, referenceEntities);

    const setOne = async (updateData: any) => {
        updateData = Object.assign({}, updateData);
        delete updateData._id;
        delete updateData.id;

        repositoryOptions?.autoCreatedAt && (delete updateData[createdAtKey]);
        repositoryOptions?.autoUpdatedAt && (delete updateData[updatedAtKey]);

        try {
            const validatePromise = validateData(EntityDataValidator, updateData, repositoryOptions, true);
            const uniquePromise = checkUpdateUniqueKeys(collection, uniqueKeys, updateData, where, referenceEntities);
            await Promise.all([validatePromise, uniquePromise]);

            await checkReferenceEntities(collection, referenceEntities, updateData);

            updateData = updateRefObjectIdsKeys(referenceEntities, updateData);

            repositoryOptions?.autoUpdatedAt && (updateData[updatedAtKey] = new Date());

            const res = await collection.findOneAndUpdate(where, { $set: updateData }, { returnDocument: 'after', returnNewDocument: true });
            dataObjectIdToString(res.value, referenceEntities);
            return res.value;
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

    const setMany = async (updateData: any) => {
        updateData = Object.assign({}, updateData);
        delete updateData._id;
        delete updateData.id;

        repositoryOptions?.autoCreatedAt && (delete updateData[createdAtKey]);
        repositoryOptions?.autoUpdatedAt && (delete updateData[updatedAtKey]);

        try {
            checkDuplicatedUniqueKeys(uniqueKeys, updateData);
            const validatePromise = validateData(EntityDataValidator, updateData, repositoryOptions, true);
            const uniquePromise = checkUpdateUniqueKeys(collection, uniqueKeys, updateData, where, referenceEntities);
            await Promise.all([validatePromise, uniquePromise]);

            await checkReferenceEntities(collection, referenceEntities, updateData);

            updateData = updateRefObjectIdsKeys(referenceEntities, updateData);

            repositoryOptions?.autoUpdatedAt && (updateData[updatedAtKey] = new Date());

            return collection.updateMany(where, { $set: updateData });;
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

    const replaceOne = async (updateData: any) => {
        updateData = Object.assign({}, updateData);
        delete updateData._id;
        delete updateData.id;
        fillDefaultValue(defaultValues, updateData);
        try {
            const createdAt = updateData[createdAtKey];

            repositoryOptions?.autoCreatedAt && (delete updateData[createdAtKey]);
            repositoryOptions?.autoUpdatedAt && (delete updateData[updatedAtKey]);

            checkRequiredKeys(requiredKeys, updateData);
            const validatePromise = validateData(EntityDataValidator, updateData, repositoryOptions, true);
            const uniquePromise = checkUpdateUniqueKeys(collection, uniqueKeys, updateData, where, referenceEntities);
            await Promise.all([validatePromise, uniquePromise]);

            await checkReferenceEntities(collection, referenceEntities, updateData);
            updateData = updateRefObjectIdsKeys(referenceEntities, updateData);

            repositoryOptions?.autoCreatedAt && (updateData[createdAtKey] = createdAt);
            repositoryOptions?.autoUpdatedAt && (updateData[updatedAtKey] = new Date());

            return collection.replaceOne(where, updateData);
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

    return {
        setOne,
        setMany,
        replaceOne
    }
}

async function checkUpdateUniqueKeys(collection, uniqueKeys, data, itemFindWhere, referenceEntities: ReferenceEntity[]/*, isManyOperation = false*/) {
    const findUniqueKeysWhere = [];

    uniqueKeys.forEach((uni: any) => {
        const obj = {};
        const { key, isIgnoreCase } = uni;

        if (data[key] === undefined) {
            return;
        }

        if (data[key] === undefined) return;

        const keyFromRefs = referenceEntities.find((ref: ReferenceEntity) => ref.key === key || ref.as === key)

        const isIdKey = keyFromRefs?.refersToKey === 'id' || keyFromRefs?.refersToKey === '_id';

        if (isIdKey) {
            obj[key] = new ObjectId(data[key]);
        } else if (isIgnoreCase && typeof data[key] === 'string') {
            obj[key] = { $regex: new RegExp(`^${data[key]}$`), $options: 'i' };
        } else {
            obj[key] = data[key];
        }


        findUniqueKeysWhere.push(obj);
    });

    if (findUniqueKeysWhere && findUniqueKeysWhere.length) {
        const existingUniquesKeysRecords = await collection.find({
            $or: findUniqueKeysWhere,
            $nor: Object.keys(itemFindWhere).map(key => {
                return { [key]: itemFindWhere[key] }
            })
        }).limit(100).toArray();

        if (existingUniquesKeysRecords?.length) {
            const foundUniqueKeys = [];

            uniqueKeys.forEach((uni: any) => {
                const { key, isIgnoreCase } = uni;

                const ref = referenceEntities.find((r) => r.key === key || r.as === key);

                let isKeyFound;

                if (ref && (ref.refersToKey === 'id' || ref.refersToKey === '_id')) {
                    isKeyFound = data[key] !== undefined && existingUniquesKeysRecords.find((res: any) => {
                        return res[key]?.toString() === data[key];
                    });
                } else if (isIgnoreCase) {
                    isKeyFound = data[key] !== undefined && existingUniquesKeysRecords.find((res: any) => res[key].toString()?.toLowerCase() === data[key].toString()?.toLowerCase())
                } else {
                    isKeyFound = data[key] !== undefined && existingUniquesKeysRecords.find((res: any) => res[key] === data[key])
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