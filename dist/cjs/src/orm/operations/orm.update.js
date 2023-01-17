"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("../utils/utils");
const operationsUtils_1 = require("./operationsUtils");
const whereObjectHandle_1 = require("./whereObjectHandle");
function update(collection, uniqueKeys, EntityDataValidator, referenceEntities, where, defaultValues, requiredKeys, repositoryOptions) {
    const createdAtKey = repositoryOptions.createdAtKey;
    const updatedAtKey = repositoryOptions.updatedAtKey;
    if (!where) {
        throw "Update Condition Not Found";
    }
    where = (0, whereObjectHandle_1.getWhereObject)(where, referenceEntities);
    const setOne = (updateData) => __awaiter(this, void 0, void 0, function* () {
        updateData = Object.assign({}, updateData);
        delete updateData._id;
        delete updateData.id;
        (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoCreatedAt) && (delete updateData[createdAtKey]);
        (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (delete updateData[updatedAtKey]);
        try {
            const validatePromise = (0, operationsUtils_1.validateData)(EntityDataValidator, updateData, repositoryOptions, true);
            const uniquePromise = checkUpdateUniqueKeys(collection, uniqueKeys, updateData, where, referenceEntities);
            yield Promise.all([validatePromise, uniquePromise]);
            yield (0, operationsUtils_1.checkReferenceEntities)(collection, referenceEntities, updateData);
            updateData = (0, operationsUtils_1.updateRefObjectIdsKeys)(referenceEntities, updateData);
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (updateData[updatedAtKey] = new Date());
            const res = yield collection.findOneAndUpdate(where, { $set: updateData }, { returnDocument: 'after', returnNewDocument: true });
            (0, utils_1.dataObjectIdToString)(res.value, referenceEntities);
            return res.value;
        }
        catch (err) {
            if (err.code === 11000 || err.code === 11001) {
                throw {
                    message: 'Existing unique keys',
                    errorMessages: ['Unique key already exists']
                };
            }
            throw err;
        }
    });
    const setMany = (updateData) => __awaiter(this, void 0, void 0, function* () {
        updateData = Object.assign({}, updateData);
        delete updateData._id;
        delete updateData.id;
        (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoCreatedAt) && (delete updateData[createdAtKey]);
        (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (delete updateData[updatedAtKey]);
        try {
            (0, operationsUtils_1.checkDuplicatedUniqueKeys)(uniqueKeys, updateData);
            const validatePromise = (0, operationsUtils_1.validateData)(EntityDataValidator, updateData, repositoryOptions, true);
            const uniquePromise = checkUpdateUniqueKeys(collection, uniqueKeys, updateData, where, referenceEntities);
            yield Promise.all([validatePromise, uniquePromise]);
            yield (0, operationsUtils_1.checkReferenceEntities)(collection, referenceEntities, updateData);
            updateData = (0, operationsUtils_1.updateRefObjectIdsKeys)(referenceEntities, updateData);
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (updateData[updatedAtKey] = new Date());
            return collection.updateMany(where, { $set: updateData });
            ;
        }
        catch (err) {
            if (err.code === 11000 || err.code === 11001) {
                throw {
                    message: 'Existing unique keys',
                    errorMessages: ['Unique key already exists']
                };
            }
            throw err;
        }
    });
    const replaceOne = (updateData) => __awaiter(this, void 0, void 0, function* () {
        updateData = Object.assign({}, updateData);
        delete updateData._id;
        delete updateData.id;
        (0, operationsUtils_1.fillDefaultValue)(defaultValues, updateData);
        try {
            const createdAt = updateData[createdAtKey];
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoCreatedAt) && (delete updateData[createdAtKey]);
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (delete updateData[updatedAtKey]);
            (0, operationsUtils_1.checkRequiredKeys)(requiredKeys, updateData);
            const validatePromise = (0, operationsUtils_1.validateData)(EntityDataValidator, updateData, repositoryOptions, true);
            const uniquePromise = checkUpdateUniqueKeys(collection, uniqueKeys, updateData, where, referenceEntities);
            yield Promise.all([validatePromise, uniquePromise]);
            yield (0, operationsUtils_1.checkReferenceEntities)(collection, referenceEntities, updateData);
            updateData = (0, operationsUtils_1.updateRefObjectIdsKeys)(referenceEntities, updateData);
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoCreatedAt) && (updateData[createdAtKey] = createdAt);
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (updateData[updatedAtKey] = new Date());
            return collection.replaceOne(where, updateData);
        }
        catch (err) {
            if (err.code === 11000 || err.code === 11001) {
                throw {
                    message: 'Existing unique keys',
                    errorMessages: ['Unique key already exists']
                };
            }
            throw err;
        }
    });
    return {
        setOne,
        setMany,
        replaceOne
    };
}
exports.default = update;
function checkUpdateUniqueKeys(collection, uniqueKeys, data, itemFindWhere, referenceEntities) {
    return __awaiter(this, void 0, void 0, function* () {
        const findUniqueKeysWhere = [];
        uniqueKeys.forEach((uni) => {
            const obj = {};
            const { key, isIgnoreCase } = uni;
            if (data[key] === undefined) {
                return;
            }
            if (data[key] === undefined)
                return;
            const keyFromRefs = referenceEntities.find((ref) => ref.key === key || ref.as === key);
            const isIdKey = (keyFromRefs === null || keyFromRefs === void 0 ? void 0 : keyFromRefs.refersToKey) === 'id' || (keyFromRefs === null || keyFromRefs === void 0 ? void 0 : keyFromRefs.refersToKey) === '_id';
            if (isIdKey) {
                obj[key] = new mongodb_1.ObjectId(data[key]);
            }
            else if (isIgnoreCase && typeof data[key] === 'string') {
                obj[key] = { $regex: new RegExp(`^${data[key]}$`), $options: 'i' };
            }
            else {
                obj[key] = data[key];
            }
            findUniqueKeysWhere.push(obj);
        });
        if (findUniqueKeysWhere && findUniqueKeysWhere.length) {
            const existingUniquesKeysRecords = yield collection.find({
                $or: findUniqueKeysWhere,
                $nor: Object.keys(itemFindWhere).map(key => {
                    return { [key]: itemFindWhere[key] };
                })
            }).limit(100).toArray();
            if (existingUniquesKeysRecords === null || existingUniquesKeysRecords === void 0 ? void 0 : existingUniquesKeysRecords.length) {
                const foundUniqueKeys = [];
                uniqueKeys.forEach((uni) => {
                    const { key, isIgnoreCase } = uni;
                    const ref = referenceEntities.find((r) => r.key === key || r.as === key);
                    let isKeyFound;
                    if (ref && (ref.refersToKey === 'id' || ref.refersToKey === '_id')) {
                        isKeyFound = data[key] !== undefined && existingUniquesKeysRecords.find((res) => {
                            var _a;
                            return ((_a = res[key]) === null || _a === void 0 ? void 0 : _a.toString()) === data[key];
                        });
                    }
                    else if (isIgnoreCase) {
                        isKeyFound = data[key] !== undefined && existingUniquesKeysRecords.find((res) => { var _a, _b; return ((_a = res[key].toString()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = data[key].toString()) === null || _b === void 0 ? void 0 : _b.toLowerCase()); });
                    }
                    else {
                        isKeyFound = data[key] !== undefined && existingUniquesKeysRecords.find((res) => res[key] === data[key]);
                    }
                    if (isKeyFound) {
                        foundUniqueKeys.push(key);
                    }
                });
                throw {
                    message: 'Existing unique keys',
                    existingUniqueKeys: foundUniqueKeys,
                    errorMessages: foundUniqueKeys.map((key) => {
                        var _a;
                        const keyMessage = (_a = uniqueKeys.find((uni) => uni.key === key)) === null || _a === void 0 ? void 0 : _a.message;
                        return keyMessage || `${key} is already exists`;
                    })
                };
            }
        }
    });
}
