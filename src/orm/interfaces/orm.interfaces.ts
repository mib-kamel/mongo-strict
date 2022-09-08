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
    cache?: CacheOptions | boolean;
}

export interface ReferenceEntity {
    refersToCollectionName?: string;
    key: string,
    refersToKey?: string;
    isArray?: boolean;
    maxDepth?: number; // in case of cirecular reference
    type?: RELATION_TYPES;
    as?: string;
    _refererCollectionName?: string;
    _refererKey?: string;
    referenceEntities?: ReferenceEntity[];
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
    collection: string;
    key: string;
    as?: string;
    isArray?: boolean;
    reverseRefering?: boolean;
    reverseReferingAs?: string;
    maxDepth?: number;
    type?: RELATION_TYPES;
    message?: string;
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
    defaultSelectFields?: string[];
    cacheTimeout?: number;
    reverseRefering?: boolean;
}

export interface CacheOptions {
    timeout?: number;
}