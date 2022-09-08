export const ORM_DEFAULTS = {
    REPO_AUTO_CREATED_AT: true,
    REPO_AUTO_UPDATEDTED_AT: true,
    REPO_DEBUG: false,
    REPO_MAX_FIND_TIME_MS: 360000,
    ENTITY_AUTO_CREATED_AT: true,
    ENTITY_AUTO_UPDATEDTED_AT: true,
    ENTITY_DEBUG: false,
    ENTITY_MAX_FIND_TIME_MS: 60000,
}

export const REPOSITORIES_DEFAULT_OPTIONS = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    createdAtKey: 'createdAt',
    updatedAtKey: 'updatedAt',
    maxFindTimeMS: 360000,
    debug: false,
    cacheTimeout: 1000,
    reverseRefering: false
}