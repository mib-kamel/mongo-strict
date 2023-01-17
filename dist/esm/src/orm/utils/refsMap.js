import { RELATION_TYPES } from "../interfaces/orm.interfaces";
const MAX_DEPTH = 10;
export default function initRefsMap(repositoriesMap) {
    repositoriesMap.forEach((value, collectionName) => {
        var _a, _b;
        for (let i = 0; i < ((_b = (_a = value.entityProperties) === null || _a === void 0 ? void 0 : _a.referenceEntities) === null || _b === void 0 ? void 0 : _b.length) || 0; i++) {
            const ref = value.entityProperties.referenceEntities[i];
            if (!ref.type && !ref.isArray) {
                ref.type = RELATION_TYPES.MANY_TO_ONE;
            }
            if (ref.type === RELATION_TYPES.MANY_TO_MANY || ref.type === RELATION_TYPES.ONE_TO_MANY) {
                ref.isArray = true;
            }
            checkReferenceEntity(ref);
        }
    });
    repositoriesMap.forEach((value, collectionName) => {
        const referenceEntites = value.entityProperties.referenceEntities;
        const repositoryOptions = value.repositoryOptions;
        for (let i = 0; i < (referenceEntites === null || referenceEntites === void 0 ? void 0 : referenceEntites.length) || 0; i++) {
            const ref = referenceEntites[i];
            if (!ref.refersToCollectionName || ref._refererCollectionName || ref.refersToCollectionName === collectionName)
                continue;
            if (ref.reverseRefering === false ||
                (ref.reverseRefering !== true && repositoryOptions.reverseRefering === false)) {
                continue;
            }
            const refersTo = repositoriesMap.get(ref.refersToCollectionName);
            if (!refersTo.entityProperties.referenceEntities === undefined) {
                refersTo.entityProperties.referenceEntities = [];
            }
            let newRelationType = '';
            if (ref.type === RELATION_TYPES.MANY_TO_ONE) {
                newRelationType = RELATION_TYPES.ONE_TO_MANY;
            }
            else if (ref.type === RELATION_TYPES.ONE_TO_MANY) {
                newRelationType = RELATION_TYPES.MANY_TO_ONE;
            }
            else {
                newRelationType = ref.type;
            }
            refersTo.entityProperties.referenceEntities.push({
                key: ref.refersToKey,
                _refererCollectionName: collectionName,
                _refererKey: ref.key,
                as: ref.reverseReferingAs || collectionName,
                type: newRelationType,
                maxDepth: ref.maxDepth
            });
        }
    });
    repositoriesMap.forEach((value, collectionName) => {
        const referenceEntites = value.entityProperties.referenceEntities;
        for (let i = 0; i < (referenceEntites === null || referenceEntites === void 0 ? void 0 : referenceEntites.length) || 0; i++) {
            extendReferenceEntities(repositoriesMap, referenceEntites[i], 0, 0, [collectionName]);
        }
    });
}
function checkReferenceEntity(ref) {
    if (!ref.refersToCollectionName || !ref.refersToKey) {
        throw new Error("Invalid Reference Entity - " + JSON.stringify(ref));
    }
}
function extendReferenceEntities(repositoriesMap, parent, depth, circulatDepth = 0, parents) {
    var _a, _b;
    const targetCollectionName = parent.refersToCollectionName || parent._refererCollectionName;
    const refersTo = repositoriesMap.get(targetCollectionName);
    const newParent = [...parents, targetCollectionName];
    const refersToOptions = refersTo === null || refersTo === void 0 ? void 0 : refersTo.entityProperties;
    const newReferenceEntities = [];
    for (let i = 0; i < ((_a = refersToOptions === null || refersToOptions === void 0 ? void 0 : refersToOptions.referenceEntities) === null || _a === void 0 ? void 0 : _a.length) || 0; i++) {
        const ref = refersToOptions.referenceEntities[i];
        let newRef = { key: '' };
        const newTargetCollectionName = ref.refersToCollectionName || ref._refererCollectionName;
        if (newParent.find(p => p === newTargetCollectionName) && newParent[newParent.length - 1] !== newTargetCollectionName) {
            continue;
        }
        Object.keys(ref).forEach(key => {
            if (key === 'referenceEntities')
                return;
            newRef[key] = ref[key];
        });
        newReferenceEntities.push(newRef);
    }
    if (!newReferenceEntities.length) {
        return;
    }
    parent.referenceEntities = newReferenceEntities;
    for (let i = 0; i < ((_b = parent === null || parent === void 0 ? void 0 : parent.referenceEntities) === null || _b === void 0 ? void 0 : _b.length) || 0; i++) {
        const ref = parent.referenceEntities[i];
        const ref1 = parent.refersToCollectionName || parent._refererCollectionName;
        const ref2 = ref.refersToCollectionName || ref._refererCollectionName;
        const isCircular = ref1 === ref2;
        const maxCircularDepth = ref.maxDepth || MAX_DEPTH;
        if (isCircular && (circulatDepth > maxCircularDepth - 2)) {
            continue;
        }
        if (depth >= MAX_DEPTH) {
            continue;
        }
        extendReferenceEntities(repositoriesMap, ref, depth + 1, isCircular ? circulatDepth + 1 : 0, newParent);
    }
}
