export enum RELATION_TYPES {
    ONE_TO_ONE = 'ONE_TO_ONE',
    ONE_TO_MANY = 'ONE_TO_MANY',
    MANY_TO_ONE = 'MANY_TO_ONE',
    MANY_TO_MANY = 'MANY_TO_MANY'
}

export interface FindOptions {
    limit?: number;
    skip?: number;
    where?: any;
    selectFields?: string[];
    select?: any;
    sort?: any;
    cache?: any;
}

export interface ReferenceEntity {
    key: string,
    refersToCollectionName?: string,
    refersToKey?: string,
    refererCollectionName?: string,
    refererKey?: string,
    referenceEntities?: ReferenceEntity[];
    isArray?: boolean,
    as?: string;
    maxDepth?: number;
    type?: RELATION_TYPES
}

export interface _EntityProperties {
    defaultSelectFields: string[];
    referenceEntities: ReferenceEntity[];
    uniqueKeys: string[];
    dataValidators: any;
    requiredKeys: string[];
    defaultValues: any[];
}

export interface EntityRefersTo {
    isArray?: boolean;
    collection: string;
    key: string;
    as?: string;
    refererAs?: string;
    maxDepth?: number;
    type?: RELATION_TYPES,
    message?: string
}

export interface EntityProperties {
    name: string
}

export interface RepositoryOptions {
    autoCreatedAt?: boolean;
    autoUpdatedAt?: boolean;
    createdAtKey?: string;
    updatedAtKey?: string;
    maxFindTimeMS?: number;
    debug?: boolean;
    // cache?: any;
}