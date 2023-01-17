var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RELATION_TYPES } from "../interfaces/orm.interfaces";
import { dataObjectIdToString } from "../utils/utils";
import { isId } from "./operationsUtils";
import { getWhereObject } from "./whereObjectHandle";
import { stringify } from 'telejson';
const NodeCache = require("node-cache");
var hash = require('object-hash');
const queryCache = new NodeCache({ stdTTL: 1000, checkperiod: 120 });
const PAGINATION_OPTIONS_DEFAULTS = {
    limit: 50,
    skip: 0,
    where: {},
    select: {},
    sort: undefined
};
const FIND_KEYS = ['where', 'select', 'skip', 'limit', 'selectFields', 'sort', 'cache', 'debug', 'populate', 'collation'];
const checkAllFindOptionsKeysValid = (findOptions) => {
    const keys = Object.keys(findOptions);
    for (const key of keys) {
        if (!FIND_KEYS.includes(key)) {
            throw {
                message: `${key} is not a valid find options key`
            };
        }
    }
    ;
};
export function find(Repository, defaultSelectFields = [], findOptions, referenceEntities, repositoryOptions, collectionName) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        checkAllFindOptionsKeysValid(findOptions);
        let cacheKey;
        const isDebug = findOptions.debug === true || (findOptions.debug !== false && repositoryOptions.debug === true);
        if (isFindoptionsCache(findOptions)) {
            const findClone = Object.assign({}, findOptions);
            delete findClone.cache;
            findClone.collectionName = collectionName;
            findClone.operation = "FIND";
            cacheKey = hash(stringify(findClone));
            if (queryCache.has(cacheKey)) {
                return queryCache.get(cacheKey);
            }
        }
        const aggregateArray = getFindAggregateArray(Repository, defaultSelectFields, findOptions, referenceEntities, repositoryOptions, collectionName);
        if (isDebug) {
            console.log(JSON.stringify(aggregateArray, null, 4));
        }
        const aggregateOptions = {};
        if (findOptions.collation) {
            aggregateOptions['collation'] = findOptions.collation;
        }
        const res = yield Repository.aggregate(aggregateArray, aggregateOptions).maxTimeMS(repositoryOptions.maxFindTimeMS).toArray();
        dataObjectIdToString(res, referenceEntities);
        if (cacheKey !== undefined) {
            let cacheTimeout = repositoryOptions.cacheTimeout;
            if (typeof findOptions.cache === 'object' && !isNaN(Number((_a = findOptions.cache) === null || _a === void 0 ? void 0 : _a.timeout))) {
                cacheTimeout = Number(findOptions.cache.timeout);
            }
            queryCache.set(cacheKey, res, cacheTimeout);
        }
        return res;
    });
}
export function getFindAggregateArray(Repository, defaultSelectFields = [], findOptions, referenceEntities, repositoryOptions, collectionName) {
    var _a, _b, _c;
    const takeOption = !isNaN(Number(findOptions.limit)) ? parseInt(String(findOptions.limit)) : undefined;
    const skipOption = !isNaN(Number(findOptions.skip))
        ? findOptions.skip
        : PAGINATION_OPTIONS_DEFAULTS.skip;
    let sort = findOptions.sort ? findOptions.sort : PAGINATION_OPTIONS_DEFAULTS.sort;
    sort && (sort = replaceObjectIds(sort));
    let populate = findOptions.populate ? findOptions.populate : undefined;
    if (typeof populate === 'string')
        populate = [populate];
    if (Array.isArray(populate)) {
        populate = populate.map((item) => {
            return item + '.id';
        });
    }
    let selectItems = [];
    let where = findOptions.where || {};
    where = getWhereObject(where, referenceEntities);
    let project = findOptions.select;
    if (!project || Array.isArray(project)) {
        selectItems = (project === null || project === void 0 ? void 0 : project.length) ? project : [...defaultSelectFields];
        if (selectItems === null || selectItems === void 0 ? void 0 : selectItems.length) {
            project = selectItemsToProject(selectItems);
        }
    }
    if (project) {
        replaceProjectIds(project);
    }
    const isSort = !!sort && !!((_a = Object.keys(sort)) === null || _a === void 0 ? void 0 : _a.length);
    const isWhere = where && ((_b = Object.keys(where)) === null || _b === void 0 ? void 0 : _b.length);
    const isPorject = project && ((_c = Object.keys(project)) === null || _c === void 0 ? void 0 : _c.length);
    const projectKeys = getDeepKeys(project).filter(key => isValidRefKey(key, referenceEntities));
    const whereKeys = getDeepKeys(where).filter(key => isValidRefKey(key, referenceEntities));
    const sortKeys = !!sort ? getDeepKeys(sort).filter(key => isValidRefKey(key, referenceEntities)) : [];
    const populateKeys = !!(populate === null || populate === void 0 ? void 0 : populate.length) ? populate.filter(key => isValidRefKey(key, referenceEntities)) : [];
    const lookups = getLookups(referenceEntities, [...projectKeys, ...whereKeys, ...sortKeys, ...populateKeys]);
    const lookup_preWhere = !!(whereKeys === null || whereKeys === void 0 ? void 0 : whereKeys.length) && hasValidRefKeys(whereKeys, referenceEntities);
    const lookup_preSort = !!(sortKeys === null || sortKeys === void 0 ? void 0 : sortKeys.length) && hasValidRefKeys(sortKeys, referenceEntities);
    const lookup_preLimit = lookup_preWhere || lookup_preSort;
    const isDebug = findOptions.debug === true || (findOptions.debug !== false && repositoryOptions.debug === true);
    if (isDebug) {
        console.log("populate", populate);
        console.log('populateKeys', populateKeys);
    }
    project = Object.assign(Object.assign({}, project), addId_toProject(projectKeys, referenceEntities));
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
    if (lookup_preLimit && (lookups === null || lookups === void 0 ? void 0 : lookups.length)) {
        aggregateArray.push(...lookups);
    }
    if (lookup_preWhere && isWhere) {
        aggregateArray.push({ $match: where });
    }
    if (lookup_preSort && isSort) {
        aggregateArray.push({ $sort: sort });
    }
    if (skipOption !== 0) {
        aggregateArray.push({ $skip: skipOption });
    }
    if (!isNaN(takeOption)) {
        aggregateArray.push({ $limit: takeOption });
    }
    if (!lookup_preLimit && (lookups === null || lookups === void 0 ? void 0 : lookups.length)) {
        aggregateArray.push(...lookups);
    }
    if (project && isPorject) {
        aggregateArray.push({ $project: project });
    }
    return aggregateArray;
}
const isFindoptionsCache = (findOptions) => {
    var _a;
    return findOptions.cache === true || (typeof findOptions.cache === 'object' && !isNaN(Number((_a = findOptions.cache) === null || _a === void 0 ? void 0 : _a.timeout)));
};
export function count(Repository, findOptions, referenceEntities, repositoryOptions, collectionName) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        checkAllFindOptionsKeysValid(findOptions);
        const isDebug = findOptions.debug === true || (findOptions.debug !== false && repositoryOptions.debug === true);
        let cacheKey;
        if (findOptions.cache === true || (typeof findOptions.cache === 'object' && !isNaN(Number((_a = findOptions.cache) === null || _a === void 0 ? void 0 : _a.timeout)))) {
            const findClone = Object.assign({}, findOptions);
            delete findClone.cache;
            findClone.collectionName = collectionName;
            findClone.operation = "COUNT";
            cacheKey = hash(stringify(findClone));
            if (queryCache.has(cacheKey)) {
                return queryCache.get(cacheKey);
            }
        }
        const aggregateArray = getCountAggregateArray(findOptions, referenceEntities, repositoryOptions);
        if (isDebug) {
            console.log(JSON.stringify(aggregateArray, null, 4));
        }
        const res = yield Repository.aggregate(aggregateArray).maxTimeMS(repositoryOptions.maxFindTimeMS).toArray();
        const count = ((_c = (_b = res[0]) === null || _b === void 0 ? void 0 : _b.count[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
        if (!!cacheKey) {
            let cacheTimeout = repositoryOptions.cacheTimeout;
            if (typeof findOptions.cache === 'object' && !isNaN(Number((_d = findOptions.cache) === null || _d === void 0 ? void 0 : _d.timeout))) {
                cacheTimeout = Number(findOptions.cache.timeout);
            }
            queryCache.set(cacheKey, count, cacheTimeout);
        }
        return count;
    });
}
export function getCountAggregateArray(findOptions, referenceEntities, repositoryOptions) {
    var _a;
    checkAllFindOptionsKeysValid(findOptions);
    let where = findOptions.where || {};
    where = getWhereObject(where, referenceEntities);
    const isWhere = where && ((_a = Object.keys(where)) === null || _a === void 0 ? void 0 : _a.length);
    const whereKeys = getDeepKeys(where);
    const isLookup = whereKeys.some((key) => isValidRefKey(key, referenceEntities));
    const aggregateArray = [];
    if (isLookup) {
        const lookups = getLookups(referenceEntities, [...whereKeys]);
        if (lookups === null || lookups === void 0 ? void 0 : lookups.length) {
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
    return aggregateArray;
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
};
const getLookups = (referenceEntities, lookupStrings) => {
    const container = [];
    lookupStrings.forEach((str) => {
        var _a;
        const lookupKeys = str.split('.');
        let curRefs = referenceEntities;
        let curContainer = container;
        let lastLookup;
        lookupKeys.forEach((currentKey, i) => {
            var _a;
            if (i >= lookupKeys.length - 1 || !(curRefs === null || curRefs === void 0 ? void 0 : curRefs.length)) {
                return;
            }
            const ref = curRefs.find((r) => r.key === currentKey || r.as === currentKey);
            if (ref) {
                const as = ref.as || currentKey;
                let newLookup = {
                    from: ref.refersToCollectionName || ref._refererCollectionName,
                    localField: ref.key,
                    foreignField: ref.refersToKey || ref._refererKey,
                    as
                };
                if (newLookup.foreignField === 'id') {
                    newLookup.foreignField = '_id';
                }
                else if (newLookup.localField === 'id') {
                    newLookup.localField = '_id';
                }
                const existingLookup = curContainer.find((obj) => {
                    const look = obj.$lookup;
                    return look && look.from === newLookup.from && look.localField === newLookup.localField && look.foreignField === newLookup.foreignField && look.as === newLookup.as;
                });
                if (existingLookup) {
                    newLookup = existingLookup.$lookup;
                }
                else {
                    curContainer.push({
                        $lookup: newLookup
                    });
                    if (!ref.isArray && (ref.type === RELATION_TYPES.ONE_TO_ONE || ref.type === RELATION_TYPES.MANY_TO_ONE)) {
                        curContainer.push({
                            "$unwind": {
                                "path": "$" + as,
                                preserveNullAndEmptyArrays: true
                            }
                        });
                    }
                }
                if (!((_a = newLookup === null || newLookup === void 0 ? void 0 : newLookup.pipeline) === null || _a === void 0 ? void 0 : _a.length)) {
                    newLookup.pipeline = [];
                    curContainer = newLookup.pipeline;
                }
                if (!existingLookup && (ref.type === RELATION_TYPES.ONE_TO_ONE || ref.type === RELATION_TYPES.MANY_TO_ONE)) {
                    newLookup.pipeline.push({
                        $limit: 1
                    });
                }
                curContainer = newLookup.pipeline;
                curRefs = ref.referenceEntities;
                lastLookup = newLookup;
            }
        });
        if (lastLookup && !((_a = lastLookup === null || lastLookup === void 0 ? void 0 : lastLookup.pipeline) === null || _a === void 0 ? void 0 : _a.length)) {
            delete lastLookup.pipeline;
        }
    });
    return container;
};
const replaceProjectIds = (project) => {
    const dataKeys = Object.keys(project);
    if (Array.isArray(project)) {
        for (let projectItem of project) {
            replaceProjectIds(projectItem);
        }
    }
    else if (typeof project === 'object') {
        for (let key of dataKeys) {
            if (project[key] instanceof Object) {
                replaceProjectIds(project[key]);
            }
            else {
                if (isId(key)) {
                    const projectValue = project[key];
                    delete project[key];
                    if (key === 'id') {
                        key = '_id';
                    }
                    else {
                        key = key.replace(/\.id$/g, '._id');
                    }
                    project[key] = projectValue;
                }
            }
        }
    }
};
const replaceObjectIds = (obj) => {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [replaceId(key), value]));
};
const replaceId = (key) => {
    if (key === 'id') {
        key = '_id';
    }
    else {
        key = key.replace(/\.id$/g, '._id');
    }
    return key;
};
function getDeepKeys(obj) {
    const keys = [];
    for (let key in obj) {
        if (key.indexOf('$') !== 0) {
            keys.push(key);
        }
        if (typeof obj[key] === "object" && obj[key].length === undefined) {
            var subkeys = getDeepKeys(obj[key]);
            keys.push(...subkeys);
        }
        else if (typeof obj[key] === "object" && obj[key].length) {
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
const hasValidRefKeys = (keys, referenceEntities) => {
    return keys.some((key) => isValidRefKey(key, referenceEntities));
};
const isValidRefKey = (key, referenceEntities) => {
    let splittedKey = key.split(".");
    if (splittedKey.length < 2) {
        return false;
    }
    let curRefs = referenceEntities;
    for (let i = 0; i < splittedKey.length && curRefs !== undefined; i++) {
        const curKey = splittedKey[i];
        const ref = curRefs.find((ref) => ref.key === curKey || ref.as === curKey);
        if (ref) {
            return true;
        }
    }
    return false;
};
const addId_toProject = (selectItems, referenceEntities) => {
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
};
