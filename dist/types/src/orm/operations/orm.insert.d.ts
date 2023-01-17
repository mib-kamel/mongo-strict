import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
export declare function insertOne(collection: any, uniqueKeys: any[], EntityDataValidator: any, referenceEntities: ReferenceEntity[], insertData: any, defaultValues: string[], requiredKeys: any[], repositoryOptions: RepositoryOptions): Promise<any>;
export declare function validateInsert(collection: any, uniqueKeys: any[], EntityDataValidator: any, referenceEntities: ReferenceEntity[], insertData: any, isClone: boolean, requiredKeys: any[], repositoryOptions: RepositoryOptions): Promise<boolean>;
