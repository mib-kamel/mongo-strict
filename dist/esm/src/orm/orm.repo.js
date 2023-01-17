var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { find as ormFind, count as ormCount, getFindAggregateArray as ormGetFindAggregateArray, getCountAggregateArray as omrGetCountAggregateArray } from './operations/orm.find';
import { insertOne, validateInsert } from './operations/orm.insert';
import update from './operations/orm.update';
import { deleteMany, deleteOne } from './operations/orm.delete';
import { QueryBuilder } from './QueryBuilder';
import { getRepositoriesMap } from './mongo-strict';
import { getWhereObject } from './operations/whereObjectHandle';
export class ORMRepo {
    constructor(collection, entityProperties, repositoryptions, collectionName) {
        this.collection = collection;
        this.getCollection = () => {
            return this.collection;
        };
        this.find = (findOptions) => __awaiter(this, void 0, void 0, function* () {
            if (typeof findOptions !== "object") {
                findOptions = {};
            }
            return ormFind(this.collection, this.defaultSelectFields, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
        });
        this.count = (findOptions) => __awaiter(this, void 0, void 0, function* () {
            if (typeof findOptions !== "object") {
                findOptions = {};
            }
            return ormCount(this.collection, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
        });
        this.findAndCount = (findOptions) => __awaiter(this, void 0, void 0, function* () {
            if (typeof findOptions !== "object") {
                findOptions = {};
            }
            const findPromise = this.find(findOptions);
            const countPromise = this.count(findOptions);
            const [find, count] = yield Promise.all([findPromise, countPromise]);
            return {
                count: count,
                data: find
            };
        });
        this.findOneById = (id, select) => __awaiter(this, void 0, void 0, function* () {
            const findOptions = {
                where: { id },
                select,
                limit: 1
            };
            return this.findOne(findOptions);
        });
        this.findOne = (findOptions) => __awaiter(this, void 0, void 0, function* () {
            if (typeof findOptions !== "object") {
                findOptions = {};
            }
            findOptions.limit = 1;
            const res = yield this.find(findOptions);
            return (res === null || res === void 0 ? void 0 : res.length) ? res[0] : undefined;
        });
        this.insertOne = (insertData) => __awaiter(this, void 0, void 0, function* () {
            return insertOne(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, insertData, this.defaultValues, this.requiredKeys, this.repositoryptions);
        });
        this.validateInsertData = (insertData) => __awaiter(this, void 0, void 0, function* () {
            return validateInsert(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, insertData, true, this.requiredKeys, this.repositoryptions);
        });
        this.update = (where) => {
            return update(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, where, this.defaultValues, this.requiredKeys, this.repositoryptions);
        };
        this.deleteOne = (where) => __awaiter(this, void 0, void 0, function* () {
            return deleteOne(this.collection, this.referenceEntities, where);
        });
        this.deleteMany = (where) => __awaiter(this, void 0, void 0, function* () {
            return deleteMany(this.collection, this.referenceEntities, where);
        });
        this.queryBuilder = () => {
            return new QueryBuilder(this.find, this.findOne, this.count, this.findAndCount);
        };
        this.listIndexes = () => __awaiter(this, void 0, void 0, function* () {
            return this.collection.listIndexes().toArray();
        });
        this._test = () => {
            return {
                getFindAggregateArray: (findOptions) => {
                    if (typeof findOptions !== "object") {
                        findOptions = {};
                    }
                    return ormGetFindAggregateArray(this.collection, this.defaultSelectFields, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
                },
                getCountAggregateArray: (findOptions) => {
                    if (typeof findOptions !== "object") {
                        findOptions = {};
                    }
                    return omrGetCountAggregateArray(findOptions, this.referenceEntities, this.repositoryptions);
                },
                getRepositoriesMap: () => {
                    return getRepositoriesMap();
                },
                getWhereObject: (where) => {
                    return getWhereObject(where, this.referenceEntities);
                }
            };
        };
        this.defaultSelectFields = entityProperties.defaultSelectFields;
        this.referenceEntities = entityProperties.referenceEntities;
        this.uniqueKeys = entityProperties.uniqueKeys;
        this.dataValidators = entityProperties.dataValidators;
        this.requiredKeys = entityProperties.requiredKeys;
        this.defaultValues = entityProperties.defaultValues;
        this.repositoryptions = repositoryptions;
        this.collectionName = collectionName;
        this.lifecycle = repositoryptions === null || repositoryptions === void 0 ? void 0 : repositoryptions.lifecycle;
    }
}
