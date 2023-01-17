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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORMRepo = void 0;
const orm_find_1 = require("./operations/orm.find");
const orm_insert_1 = require("./operations/orm.insert");
const orm_update_1 = __importDefault(require("./operations/orm.update"));
const orm_delete_1 = require("./operations/orm.delete");
const QueryBuilder_1 = require("./QueryBuilder");
const mongo_strict_1 = require("./mongo-strict");
const whereObjectHandle_1 = require("./operations/whereObjectHandle");
class ORMRepo {
    constructor(collection, entityProperties, repositoryptions, collectionName) {
        this.collection = collection;
        this.getCollection = () => {
            return this.collection;
        };
        this.find = (findOptions) => __awaiter(this, void 0, void 0, function* () {
            if (typeof findOptions !== "object") {
                findOptions = {};
            }
            return (0, orm_find_1.find)(this.collection, this.defaultSelectFields, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
        });
        this.count = (findOptions) => __awaiter(this, void 0, void 0, function* () {
            if (typeof findOptions !== "object") {
                findOptions = {};
            }
            return (0, orm_find_1.count)(this.collection, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
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
            return (0, orm_insert_1.insertOne)(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, insertData, this.defaultValues, this.requiredKeys, this.repositoryptions);
        });
        this.validateInsertData = (insertData) => __awaiter(this, void 0, void 0, function* () {
            return (0, orm_insert_1.validateInsert)(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, insertData, true, this.requiredKeys, this.repositoryptions);
        });
        this.update = (where) => {
            return (0, orm_update_1.default)(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, where, this.defaultValues, this.requiredKeys, this.repositoryptions);
        };
        this.deleteOne = (where) => __awaiter(this, void 0, void 0, function* () {
            return (0, orm_delete_1.deleteOne)(this.collection, this.referenceEntities, where);
        });
        this.deleteMany = (where) => __awaiter(this, void 0, void 0, function* () {
            return (0, orm_delete_1.deleteMany)(this.collection, this.referenceEntities, where);
        });
        this.queryBuilder = () => {
            return new QueryBuilder_1.QueryBuilder(this.find, this.findOne, this.count, this.findAndCount);
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
                    return (0, orm_find_1.getFindAggregateArray)(this.collection, this.defaultSelectFields, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
                },
                getCountAggregateArray: (findOptions) => {
                    if (typeof findOptions !== "object") {
                        findOptions = {};
                    }
                    return (0, orm_find_1.getCountAggregateArray)(findOptions, this.referenceEntities, this.repositoryptions);
                },
                getRepositoriesMap: () => {
                    return (0, mongo_strict_1.getRepositoriesMap)();
                },
                getWhereObject: (where) => {
                    return (0, whereObjectHandle_1.getWhereObject)(where, this.referenceEntities);
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
exports.ORMRepo = ORMRepo;
