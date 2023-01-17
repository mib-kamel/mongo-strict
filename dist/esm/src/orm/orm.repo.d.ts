import { _EntityProperties, FindOptions } from './interfaces/orm.interfaces';
import { QueryBuilder } from './QueryBuilder';
export declare class ORMRepo {
    private collection;
    private defaultSelectFields;
    private referenceEntities;
    private uniqueKeys;
    private dataValidators;
    private requiredKeys;
    private defaultValues;
    private repositoryptions;
    private collectionName;
    private lifecycle;
    constructor(collection: any, entityProperties: _EntityProperties, repositoryptions: any, collectionName: string);
    getCollection: () => any;
    find: (findOptions: FindOptions) => Promise<any>;
    count: (findOptions: FindOptions) => Promise<any>;
    findAndCount: (findOptions: FindOptions) => Promise<{
        count: any;
        data: any;
    }>;
    findOneById: (id: string, select: any) => Promise<any>;
    findOne: (findOptions: FindOptions) => Promise<any>;
    insertOne: (insertData: any) => Promise<any>;
    validateInsertData: (insertData: any) => Promise<boolean>;
    update: (where: any) => {
        setOne: (updateData: any) => Promise<any>;
        setMany: (updateData: any) => Promise<any>;
        replaceOne: (updateData: any) => Promise<any>;
    };
    deleteOne: (where: any) => Promise<any>;
    deleteMany: (where: any) => Promise<any>;
    queryBuilder: () => QueryBuilder;
    listIndexes: () => Promise<any>;
    _test: () => {
        getFindAggregateArray: (findOptions: FindOptions) => any[];
        getCountAggregateArray: (findOptions: FindOptions) => any[];
        getRepositoriesMap: () => Map<any, any>;
        getWhereObject: (where: any) => any;
    };
}
