import { _EntityProperties, FindOptions } from './interfaces/orm.interfaces';
import { find as ormFind, count as ormCount } from './operations/orm.find';
import { insertOne, validateInsert } from './operations/orm.insert';
import update from './operations/orm.update';
import { deleteMany, deleteOne } from './operations/orm.delete';
import { QueryBuilder } from './QueryBuilder';
import { ObjectId } from 'mongodb';
import { isObjectID } from './utils/utils';


export class ORMRepo {
    private defaultSelectFields;
    private referenceEntities;
    private uniqueKeys;
    private dataValidators;
    private requiredKeys;
    private defaultValues;
    private repositoryptions;
    private collectionName;

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
        return deleteOne(this.collection, this.referenceEntities, where, this.repositoryptions);
    }

    deleteMany = async (where: any) => {
        return deleteMany(this.collection, this.referenceEntities, where, this.repositoryptions);
    }

    queryBuilder = () => {
        return new QueryBuilder(this.find, this.findOne, this.count);
    }
}