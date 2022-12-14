import { _EntityProperties, FindOptions, ReferenceEntity } from './interfaces/orm.interfaces';
import { find as ormFind, count as ormCount, getFindAggregateArray as ormGetFindAggregateArray, getCountAggregateArray as omrGetCountAggregateArray } from './operations/orm.find';
import { insertOne, validateInsert } from './operations/orm.insert';
import update from './operations/orm.update';
import { deleteMany, deleteOne } from './operations/orm.delete';
import { QueryBuilder } from './QueryBuilder';
import { getRepositoriesMap } from './mongo-strict';
import { getWhereObject } from './operations/whereObjectHandle';

export class ORMRepo {
    private defaultSelectFields;
    private referenceEntities;
    private uniqueKeys;
    private dataValidators;
    private requiredKeys;
    private defaultValues;
    private repositoryptions;
    private collectionName;
    private lifecycle;

    constructor(
        private collection: any, entityProperties: _EntityProperties, repositoryptions: any, collectionName: string
    ) {
        this.defaultSelectFields = entityProperties.defaultSelectFields;
        this.referenceEntities = entityProperties.referenceEntities;
        this.uniqueKeys = entityProperties.uniqueKeys;
        this.dataValidators = entityProperties.dataValidators;
        this.requiredKeys = entityProperties.requiredKeys;
        this.defaultValues = entityProperties.defaultValues;
        this.repositoryptions = repositoryptions;
        this.collectionName = collectionName;

        this.lifecycle = repositoryptions?.lifecycle;
    }

    getCollection = () => {
        return this.collection;
    }

    find = async (findOptions: FindOptions) => {
        if (typeof findOptions !== "object") { findOptions = {}; }
        return ormFind(this.collection, this.defaultSelectFields, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
    }

    count = async (findOptions: FindOptions) => {
        if (typeof findOptions !== "object") { findOptions = {}; }
        return ormCount(this.collection, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
    }

    findAndCount = async (findOptions: FindOptions) => {
        if (typeof findOptions !== "object") { findOptions = {}; }
        const findPromise = this.find(findOptions);
        const countPromise = this.count(findOptions);

        const [find, count] = await Promise.all([findPromise, countPromise]);

        return {
            count: count,
            data: find
        };
    }

    findOneById = async (id: string, select: any) => {
        const findOptions = {
            where: { id },
            select,
            limit: 1
        };

        return this.findOne(findOptions);
    }

    findOne = async (findOptions: FindOptions) => {
        if (typeof findOptions !== "object") { findOptions = {}; }

        findOptions.limit = 1;

        const res = await this.find(
            findOptions
        );

        return res?.length ? res[0] : undefined;
    }

    insertOne = async (insertData: any) => {
        return insertOne(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, insertData, this.defaultValues, this.requiredKeys, this.repositoryptions);
    }

    validateInsertData = async (insertData: any) => {
        return validateInsert(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, insertData, true, this.requiredKeys, this.repositoryptions);
    }

    update = (where: any) => {
        return update(this.collection, this.uniqueKeys, this.dataValidators, this.referenceEntities, where, this.defaultValues, this.requiredKeys, this.repositoryptions);
    }

    deleteOne = async (where: any) => {
        return deleteOne(this.collection, this.referenceEntities, where);
    }

    deleteMany = async (where: any) => {
        return deleteMany(this.collection, this.referenceEntities, where);
    }

    queryBuilder = () => {
        return new QueryBuilder(this.find, this.findOne, this.count, this.findAndCount);
    }

    listIndexes = async () => {
        return this.collection.listIndexes().toArray();
    }

    _test = () => {
        return {
            getFindAggregateArray: (findOptions: FindOptions) => {
                if (typeof findOptions !== "object") { findOptions = {}; }
                return ormGetFindAggregateArray(this.collection, this.defaultSelectFields, findOptions, this.referenceEntities, this.repositoryptions, this.collectionName);
            },
            getCountAggregateArray: (findOptions: FindOptions) => {
                if (typeof findOptions !== "object") { findOptions = {}; }
                return omrGetCountAggregateArray(findOptions, this.referenceEntities, this.repositoryptions);
            },
            getRepositoriesMap: () => {
                return getRepositoriesMap();
            },
            getWhereObject: (where: any) => {
                return getWhereObject(where, this.referenceEntities);
            }
        }
    }
}