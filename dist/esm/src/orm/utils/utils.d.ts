import { ReferenceEntity, RepositoryOptions, _EntityProperties } from "../interfaces/orm.interfaces";
export declare function getEntityProperties(entity: any, repositoryOptions: RepositoryOptions, EntityClass: any): _EntityProperties;
export declare function isObjectID(id: any): boolean;
export declare function isStringObjectID(id: any): boolean;
export declare const dataObjectIdToString: (data: any, referenceEntities?: ReferenceEntity[]) => void;
