import { ObjectId } from "mongodb";
import { FindOptions, ReferenceEntity, RELATION_TYPES, RepositoryOptions } from "../interfaces/orm.interfaces";
import { dataObjectIdToString, isObjectID, isStringObjectID } from "../utils/utils";
import { getWhereObject } from "./whereObjectHandle";

const structuredClone = require('realistic-structured-clone');
const NodeCache = require("node-cache");
var hash = require('object-hash');

const queryCache = new NodeCache({ stdTTL: 1000, checkperiod: 120 });

const PAGINATION_OPTIONS_DEFAULTS = {
    limit: 50,
    skip: 0,
    where: {},
    select: {},
    sort: undefined
}

export async function find(
    Repository,
    defaultSelectFields: string[] = [],
    findOptions: FindOptions,
    referenceEntities: ReferenceEntity[],
    repositoryOptions: RepositoryOptions,
    collectionName: string
): Promise<any> {
    let cacheKey;
    const isDebug = findOptions.debug === true || (findOptions.debug !== false && repositoryOptions.debug === true);

    if (isFindoptionsCache(findOptions)) {
        const findClone: any = structuredClone(findOptions);
        delete findClone.cache;
        findClone.collectionName = collectionName;
        findClone.operation = "FIND";
        cacheKey = hash(findClone);
        if (queryCache.has(cacheKey)) {
            return queryCache.get(cacheKey);
        }
    }

    const aggregateArray = getFindAggregateArray(Repository,
        defaultSelectFields,
        findOptions,
        referenceEntities,
        repositoryOptions,
        collectionName);

    if (isDebug) {
        console.log(JSON.stringify(aggregateArray, null, 4));
    }

    const res = await Repository.aggregate(aggregateArray).maxTimeMS(repositoryOptions.maxFindTimeMS).toArray();

    dataObjectIdToString(res, referenceEntities);

    if (cacheKey) {
        let cacheTimeout = repositoryOptions.cacheTimeout;

        if (typeof findOptions.cache === 'object' && !isNaN(findOptions.cache?.timeout)) {
            cacheTimeout = Number(findOptions.cache.timeout);
        }

        queryCache.set(cacheKey, res, cacheTimeout);
    }

    return res;
}

export function getFindAggregateArray(Repository,
    defaultSelectFields: string[] = [],
    findOptions: FindOptions,
    referenceEntities: ReferenceEntity[],
    repositoryOptions: RepositoryOptions,
    collectionName: string
) {
    const takeOption = !isNaN(findOptions.limit) ? parseInt(String(findOptions.limit)) : PAGINATION_OPTIONS_DEFAULTS.limit;
    const skipOption = !isNaN(findOptions.skip)
        ? findOptions.skip
        : PAGINATION_OPTIONS_DEFAULTS.skip;
    let sort = findOptions.sort ? findOptions.sort : PAGINATION_OPTIONS_DEFAULTS.sort;

    sort && (sort = replaceObjectIds(sort));

    let selectItems = [];

    let where = findOptions.where || {};
    where = getWhereObject(where, referenceEntities);
    replaceWhereIds(where, referenceEntities);

    let project: any = findOptions.select;

    if (!project || Array.isArray(project)) {
        selectItems = project?.length ? project : [...defaultSelectFields];
        if (selectItems?.length) {
            project = selectItemsToProject(selectItems);
        }
    }

    if (project) {
        replaceProjectIds(project);
    }

    const isSort = !!sort && !!Object.keys(sort)?.length;
    const isWhere = where && Object.keys(where)?.length;
    const isPorject = project && Object.keys(project)?.length;

    const projectKeys = getDeepKeys(project);
    const whereKeys = getDeepKeys(where);
    const sortKeys = !!sort ? getDeepKeys(sort) : [];

    const lookups: any = getLookups(referenceEntities, [...projectKeys, ...whereKeys]);

    const lookup_preWhere = !!whereKeys?.length && hasValidRefKeys(whereKeys, referenceEntities);
    const lookup_preSort = !!sortKeys?.length && hasValidRefKeys(sortKeys, referenceEntities);
    const lookup_preLimit = lookup_preWhere || lookup_preSort;

    project = { ...project, ...addId_toProject(projectKeys, referenceEntities) };

    if (!project._id) {
        project._id = 1;
    }

    const aggregateArray = [];

    if (!lookup_preWhere && isWhere) {
        aggregateArray.push({ $match: where });
    }

    if (!lookup_preSort && isSort) {
        aggregateArray.push({ $sort: sort });
    }

    if (lookup_preLimit && lookups?.length) {
        aggregateArray.push(...lookups);
    }

    if (lookup_preWhere && isWhere) {
        aggregateArray.push({ $match: where });
    }

    if (lookup_preSort && isSort) {
        aggregateArray.push({ $sort: sort });
    }

    if (skipOption !== 0) {
        aggregateArray.push(
            { $skip: skipOption }
        );
    }

    aggregateArray.push(
        { $limit: takeOption }
    );

    if (!lookup_preLimit && lookups?.length) {
        aggregateArray.push(...lookups);
    }

    if (project && isPorject) {
        aggregateArray.push({ $project: project });
    }

    return aggregateArray;
}

const isFindoptionsCache = (findOptions: FindOptions) => {
    return findOptions.cache === true || (typeof findOptions.cache === 'object' && !isNaN(findOptions.cache?.timeout));
}

export async function count(
    Repository,
    findOptions: FindOptions,
    referenceEntities: ReferenceEntity[],
    repositoryOptions: RepositoryOptions,
    collectionName: string
): Promise<any> {
    let cacheKey;

    if (findOptions.cache === true || (typeof findOptions.cache === 'object' && !isNaN(findOptions.cache?.timeout))) {
        const findClone: any = structuredClone(findOptions);
        delete findClone.cache;
        findClone.collectionName = collectionName;
        findClone.operation = "COUNT";
        cacheKey = hash(findClone);
        if (queryCache.has(cacheKey)) {
            return queryCache.get(cacheKey);
        }
    }

    let where = findOptions.where || {};
    where = getWhereObject(where, referenceEntities);
    replaceWhereIds(where, referenceEntities);

    const isWhere = where && Object.keys(where)?.length;
    const whereKeys = getDeepKeys(where);
    const isLookup = whereKeys.some((key) => isValidRefKey(key, referenceEntities)) && !isAllFirstLevelIds(whereKeys);

    const aggregateArray = [];

    if (isLookup) {
        const lookups: any = getLookups(referenceEntities, [...whereKeys]);
        if (lookups?.length) {
            aggregateArray.push(...lookups);
        }
    }

    if (isWhere) {
        aggregateArray.push({ $match: where });
    }

    aggregateArray.push({
        "$facet": {
            count: [{ $count: 'total' }],
        }
    });

    const isDebug = findOptions.debug === true || (findOptions.debug !== false && repositoryOptions.debug === true);

    if (isDebug) {
        console.log(JSON.stringify(aggregateArray, null, 4));
    }

    const res = await Repository.aggregate(aggregateArray).maxTimeMS(repositoryOptions.maxFindTimeMS).toArray();

    const count = res[0]?.count[0]?.total || 0;

    if (!!cacheKey) {
        let cacheTimeout = repositoryOptions.cacheTimeout;
        if (typeof findOptions.cache === 'object' && !isNaN(findOptions.cache?.timeout)) {
            cacheTimeout = Number(findOptions.cache.timeout);
        }
        queryCache.set(cacheKey, count, cacheTimeout);
    }

    return count;
}

const selectItemsToProject = (selectItems) => {
    const selectList = {};

    for (let selectItem of selectItems) {
        if (isId(selectItem)) {
            selectItem = replaceId(selectItem);
        }
        selectList[selectItem] = 1;
    }

    return selectList;
}

const getLookups = (referenceEntities: ReferenceEntity[], lookupStrings: string[]) => {
    const container = [];

    lookupStrings.forEach((str) => {
        const lookupKeys = str.split('.');
        let curRefs = referenceEntities;
        let curContainer: any = container;
        let lastLookup;

        lookupKeys.forEach((currentKey, i) => {
            if (i >= lookupKeys.length - 1 || !curRefs?.length) {
                return;
            }

            const ref = curRefs.find((r) => r.key === currentKey || r.as === currentKey);
            if (ref) {
                const as = ref.as || currentKey;
                let newLookup: any = {
                    from: ref.refersToCollectionName || ref._refererCollectionName,
                    localField: ref.key,
                    foreignField: ref.refersToKey || ref._refererKey,
                    as
                }

                if (newLookup.foreignField === 'id') {
                    newLookup.foreignField = '_id';
                } else if (newLookup.localField === 'id') {
                    newLookup.localField = '_id';
                }

                const existingLookup = curContainer.find((obj) => {
                    const look = obj.$lookup;
                    return look && look.from === newLookup.from && look.localField === newLookup.localField && look.foreignField === newLookup.foreignField && look.as === newLookup.as;
                });

                if (existingLookup) {
                    newLookup = existingLookup.$lookup;
                } else {
                    curContainer.push({
                        $lookup: newLookup
                    });
                    if (!ref.isArray && (ref.type === RELATION_TYPES.ONE_TO_ONE || ref.type === RELATION_TYPES.MANY_TO_ONE)) {
                        curContainer.push({
                            "$unwind": {
                                "path": "$" + as,
                                preserveNullAndEmptyArrays: true
                            }
                        })
                    }
                }

                if (!newLookup?.pipeline?.length) {
                    newLookup.pipeline = [];
                    curContainer = newLookup.pipeline;
                }

                if (!existingLookup && (ref.type === RELATION_TYPES.ONE_TO_ONE || ref.type === RELATION_TYPES.MANY_TO_ONE)) {
                    newLookup.pipeline.push({
                        $limit: 1
                    })
                }

                curContainer = newLookup.pipeline;
                curRefs = ref.referenceEntities;
                lastLookup = newLookup;
            }
        });
        if (lastLookup && !lastLookup?.pipeline?.length) {
            delete lastLookup.pipeline;
        }
    })

    return container;
}

const replaceWhereIds = (where, referenceEntities: ReferenceEntity[]) => {
    const dataKeys = Object.keys(where);

    if (Array.isArray(where)) {
        for (let whereItem of where) {
            replaceWhereIds(whereItem, referenceEntities)
        }
    } else if (typeof where === 'object') {
        for (let key of dataKeys) {
            if (typeof where[key] === 'object' && !isObjectID(where[key])) {
                replaceWhereIds(where[key], referenceEntities)
            } else {
                if (isId(key)) {
                    const searchValue = where[key];
                    delete where[key];
                    if (key === 'id') {
                        key = '_id';
                    } else {
                        key = key.replace(/\.id$/g, '._id');
                    }
                    if (isStringObjectID(searchValue)) {
                        where[key] = new ObjectId(searchValue);
                    } else {
                        where[key] = searchValue;
                    }
                } else if (typeof where[key] === "string" && isStringObjectID(where[key]) && isKeyRefersToId(key, referenceEntities)) {
                    where[key] = new ObjectId(where[key]);
                }
            }
        }
    }
}

const replaceProjectIds = (project) => {
    const dataKeys = Object.keys(project);

    if (Array.isArray(project)) {
        for (let projectItem of project) {
            replaceProjectIds(projectItem)
        }
    } else if (typeof project === 'object') {
        for (let key of dataKeys) {
            if (project[key] instanceof Object) {
                replaceProjectIds(project[key])
            } else {
                if (isId(key)) {
                    const projectValue = project[key];
                    delete project[key];
                    if (key === 'id') {
                        key = '_id';
                    } else {
                        key = key.replace(/\.id$/g, '._id');
                    }
                    project[key] = projectValue;
                }
            }
        }
    }
}

const replaceObjectIds = (obj: any) => {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [replaceId(key), value]));
}

const replaceId = (key: string) => {
    if (key === 'id') {
        key = '_id';
    } else {
        key = key.replace(/\.id$/g, '._id');
    }
    return key;
}

const isId = (searchKey) => {
    if (searchKey === undefined) {
        return false;
    }

    const _idIndex = searchKey.indexOf('._id');
    const idIndex = searchKey.indexOf('.id');
    const keyLength = searchKey.length;
    return searchKey === 'id' || (idIndex === keyLength - 3 && keyLength > 2) || (_idIndex === keyLength - 4 && keyLength > 3);
}

function getDeepKeys(obj: any) {
    const keys = [];
    for (let key in obj) {
        if (key.indexOf('$') !== 0) {
            keys.push(key);
        }
        if (typeof obj[key] === "object" && obj[key].length === undefined) {
            var subkeys = getDeepKeys(obj[key]);
            keys.push(...subkeys);
        } else if (typeof obj[key] === "object" && obj[key].length) {
            for (let i = 0; i < obj[key].length; i++) {
                if (typeof obj[key][i] === 'object') {
                    const subkeys = getDeepKeys(obj[key][i]);
                    keys.push(...subkeys);
                }
            }
        }
    }
    return keys;
}

const hasValidRefKeys = (keys: string[], referenceEntities: ReferenceEntity[]) => {
    return keys.some((key) => isValidRefKey(key, referenceEntities));
}

const isValidRefKey = (key: string, referenceEntities: ReferenceEntity[]) => {
    let splittedKey = key.split(".");

    if (splittedKey.length < 2) {
        return false;
    }

    const currentKey = splittedKey[0];
    const ref = referenceEntities.find((r) => r.key === currentKey || r.as === currentKey);

    if (ref) {
        return true;
    }

    return false;
}

const isAllFirstLevelIds = (keys: string[]) => {
    return keys.every((key) => {
        if (key.split('.').length === 1) return true;
        return key.split('.').length === 2 && key.indexOf('._id') === key.length - 4;
    });
}

const addId_toProject = (selectItems: string[], referenceEntities: ReferenceEntity[]) => {
    const newProjectItems = {};

    for (let i = 0; i < selectItems.length; i++) {
        const item = selectItems[i];
        if (isValidRefKey(item, referenceEntities)) {
            const splitted = item.split('.');

            let addedString = '';
            for (let j = 0; j < splitted.length - 1; j++) {
                addedString += splitted[j] + '.';
                newProjectItems[addedString + '_id'] = 1;
            }
        }
    }

    return newProjectItems;
}

const isKeyRefersToId = (key: string, referenceEntities: ReferenceEntity[]) => {
    for (let i = 0; i < referenceEntities.length; i++) {
        const ref = referenceEntities[i];
        if (ref.key === key && !!ref.refersToKey && isId(ref.refersToKey)) {
            return true;
        }
    }
    return false;
}