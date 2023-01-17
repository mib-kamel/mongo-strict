import { FindOptions, ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
export declare function find(Repository: any, defaultSelectFields: string[], findOptions: FindOptions, referenceEntities: ReferenceEntity[], repositoryOptions: RepositoryOptions, collectionName: string): Promise<any>;
export declare function getFindAggregateArray(Repository: any, defaultSelectFields: string[], findOptions: FindOptions, referenceEntities: ReferenceEntity[], repositoryOptions: RepositoryOptions, collectionName: string): any[];
export declare function count(Repository: any, findOptions: FindOptions, referenceEntities: ReferenceEntity[], repositoryOptions: RepositoryOptions, collectionName: string): Promise<any>;
export declare function getCountAggregateArray(findOptions: FindOptions, referenceEntities: ReferenceEntity[], repositoryOptions: RepositoryOptions): any[];
