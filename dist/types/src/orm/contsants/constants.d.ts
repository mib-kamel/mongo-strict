export declare const ORM_DEFAULTS: {
    REPO_AUTO_CREATED_AT: boolean;
    REPO_AUTO_UPDATEDTED_AT: boolean;
    REPO_DEBUG: boolean;
    REPO_MAX_FIND_TIME_MS: number;
    ENTITY_AUTO_CREATED_AT: boolean;
    ENTITY_AUTO_UPDATEDTED_AT: boolean;
    ENTITY_DEBUG: boolean;
    ENTITY_MAX_FIND_TIME_MS: number;
};
export declare const REPOSITORIES_DEFAULT_OPTIONS: {
    autoCreatedAt: boolean;
    autoUpdatedAt: boolean;
    createdAtKey: string;
    updatedAtKey: string;
    maxFindTimeMS: number;
    debug: boolean;
    cacheTimeout: number;
    reverseRefering: boolean;
    entityClassValidatorOptions: {
        whitelist: boolean;
        forbidNonWhitelisted: boolean;
        validationError: {
            target: boolean;
        };
    };
};
