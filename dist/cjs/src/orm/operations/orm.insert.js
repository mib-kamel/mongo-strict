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
exports.validateInsert = exports.insertOne = void 0;
const mongodb_1 = require("mongodb");
const utils_1 = require("../utils/utils");
const operationsUtils_1 = require("./operationsUtils");
function insertOne(collection, uniqueKeys, EntityDataValidator, referenceEntities, insertData, defaultValues, requiredKeys, repositoryOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const createdAtKey = repositoryOptions.createdAtKey;
        const updatedAtKey = repositoryOptions.updatedAtKey;
        try {
            insertData = Object.assign({}, insertData);
            delete insertData._id;
            delete insertData.id;
            (0, operationsUtils_1.fillDefaultValue)(defaultValues, insertData);
            yield validateInsert(collection, uniqueKeys, EntityDataValidator, referenceEntities, insertData, false, requiredKeys, repositoryOptions);
            const now = new Date();
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoCreatedAt) && (insertData[createdAtKey] = now);
            (repositoryOptions === null || repositoryOptions === void 0 ? void 0 : repositoryOptions.autoUpdatedAt) && (insertData[updatedAtKey] = now);
            yield collection.insertOne(insertData);
            (0, utils_1.dataObjectIdToString)(insertData, referenceEntities);
            return insertData;
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
}
exports.insertOne = insertOne;
function validateInsert(collection, uniqueKeys, EntityDataValidator, referenceEntities, insertData, isClone = true, requiredKeys, repositoryOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (isClone) {
                insertData = Object.assign({}, insertData);
            }
            (0, operationsUtils_1.checkRequiredKeys)(requiredKeys, insertData);
            const validatePromise = (0, operationsUtils_1.validateData)(EntityDataValidator, insertData, repositoryOptions, false);
            const uniquePromise = checkInsertUniqueKeys(collection, uniqueKeys, insertData, referenceEntities);
            yield Promise.all([validatePromise, uniquePromise]);
            yield (0, operationsUtils_1.checkReferenceEntities)(collection, referenceEntities, insertData);
            insertData = (0, operationsUtils_1.updateRefObjectIdsKeys)(referenceEntities, insertData);
            return true;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.validateInsert = validateInsert;
function checkInsertUniqueKeys(collection, uniqueKeys, insertData, referenceEntities) {
    return __awaiter(this, void 0, void 0, function* () {
        const findUniqueKeysWhere = [];
        uniqueKeys.forEach((uni) => {
            const obj = {};
            const { key, isIgnoreCase } = uni;
            if (insertData[key] === undefined) {
                return;
            }
            const keyFromRefs = referenceEntities.find((ref) => ref.key === key && !!ref.refersToCollectionName);
            const isIdKey = (keyFromRefs === null || keyFromRefs === void 0 ? void 0 : keyFromRefs.refersToKey) === 'id' || (keyFromRefs === null || keyFromRefs === void 0 ? void 0 : keyFromRefs.refersToKey) === '_id';
            if (isIdKey) {
                obj[key] = new mongodb_1.ObjectId(insertData[key]);
            }
            else if (isIgnoreCase && typeof insertData[key] === 'string') {
                obj[key] = { $regex: new RegExp(`^${insertData[key]}$`), $options: 'i' };
            }
            else {
                obj[key] = insertData[key];
            }
            findUniqueKeysWhere.push(obj);
        });
        if (findUniqueKeysWhere && findUniqueKeysWhere.length) {
            const existingUniquesKeysRecords = yield collection.find({
                $or: findUniqueKeysWhere
            }).limit(100).toArray();
            if (existingUniquesKeysRecords === null || existingUniquesKeysRecords === void 0 ? void 0 : existingUniquesKeysRecords.length) {
                const foundUniqueKeys = [];
                uniqueKeys.forEach((uni) => {
                    const { key, isIgnoreCase } = uni;
                    const ref = referenceEntities.find((r) => r.key === key || r.as === key);
                    let isKeyFound;
                    if (ref && (ref.refersToKey === 'id' || ref.refersToKey === '_id')) {
                        isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res) => {
                            var _a;
                            return ((_a = res[key]) === null || _a === void 0 ? void 0 : _a.toString()) === insertData[key];
                        });
                    }
                    else if (isIgnoreCase) {
                        isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res) => { var _a, _b; return ((_a = res[key]) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()) === ((_b = insertData[key].toString()) === null || _b === void 0 ? void 0 : _b.toLowerCase()); });
                    }
                    else {
                        isKeyFound = insertData[key] !== undefined && existingUniquesKeysRecords.find((res) => res[key] === insertData[key]);
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
