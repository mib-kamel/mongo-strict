import { ReferenceEntity, RELATION_TYPES } from "../interfaces/orm.interfaces";

const MAX_DEPTH = 10;

export default function initRefsMap(repositoriesMap: Map<string, any>) {
    repositoriesMap.forEach((value, collectionName) => {
        for (let i = 0; i < value.entityProperties?.referenceEntities?.length || 0; i++) {
            const ref = value.entityProperties.referenceEntities[i];
            if (!ref.type && !ref.isArray) {
                ref.type = RELATION_TYPES.MANY_TO_ONE;
            }

            if (ref.type === RELATION_TYPES.MANY_TO_MANY || ref.type === RELATION_TYPES.ONE_TO_MANY) {
                ref.isArray = true
            }

            checkReferenceEntity(ref);
        }
    });

    repositoriesMap.forEach((value, collectionName) => {
        const referenceEntites = value.entityProperties.referenceEntities;

        for (let i = 0; i < referenceEntites?.length || 0; i++) {
            const ref = referenceEntites[i];

            if (!ref._refererCollectionName || ref._refererCollectionName === collectionName) continue;

            const refererCollectionProps = repositoriesMap.get(ref._refererCollectionName);

            if (!refererCollectionProps?.entityProperties?.referenceEntities?.length) {
                continue;
            }

            const referer = refererCollectionProps.entityProperties.referenceEntities.find((r) => r.key === ref._refererKey);

            if (!referer) {
                continue;
            }

            let newRelationType = '';

            if (referer.type === RELATION_TYPES.MANY_TO_ONE) {
                newRelationType = RELATION_TYPES.ONE_TO_MANY;
            } else if (referer.type === RELATION_TYPES.ONE_TO_MANY) {
                newRelationType = RELATION_TYPES.MANY_TO_ONE;
            } else {
                newRelationType = ref.type;
            }

            ref.type = newRelationType;
        }
    });

    repositoriesMap.forEach((value, collectionName) => {
        const referenceEntites = value.entityProperties.referenceEntities;
        for (let i = 0; i < referenceEntites?.length || 0; i++) {
            extendReferenceEntities(repositoriesMap, referenceEntites[i], 0, 0, [collectionName]);
        }
    });

    // drawMap(repositoriesMap);
}

function checkReferenceEntity(ref: ReferenceEntity) {
    if (ref.refersToCollectionName && !ref.refersToKey) {
        throw new Error("Invalid Reference Entity - " + JSON.stringify(ref));
    }

    if (ref._refererCollectionName && (!ref._refererKey || !ref.as)) {
        throw new Error("Invalid Reference Entity - " + JSON.stringify(ref));
    }

    if (ref.refersToCollectionName && ref._refererCollectionName) {
        throw new Error("Invalid Reference Entity - " + JSON.stringify(ref));
    }

}

function extendReferenceEntities(repositoriesMap: any, parent: ReferenceEntity, depth, circulatDepth = 0, parents) {

    const targetCollectionName = parent.refersToCollectionName || parent._refererCollectionName;
    const refersTo = repositoriesMap.get(targetCollectionName);

    const newParent = [...parents, targetCollectionName];

    const refersToOptions = refersTo?.entityProperties;

    const newReferenceEntities = [];

    for (let i = 0; i < refersToOptions?.referenceEntities?.length || 0; i++) {
        const ref = refersToOptions.referenceEntities[i];
        let newRef: ReferenceEntity = { key: '' };

        const newTargetCollectionName = ref.refersToCollectionName || ref._refererCollectionName;

        if (newParent.find(p => p === newTargetCollectionName) && newParent[newParent.length - 1] !== newTargetCollectionName) {
            continue;
        }

        Object.keys(ref).forEach(key => {
            if (key === 'referenceEntities') return;
            newRef[key] = ref[key];
        })

        newReferenceEntities.push(newRef);
    }

    if (!newReferenceEntities.length) {
        return;
    }

    parent.referenceEntities = newReferenceEntities;

    for (let i = 0; i < parent?.referenceEntities?.length || 0; i++) {

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

// const drawMap = (repositoriesMap) => {
//     console.log("")
//     console.log("")
//     console.log("START DRAW MAP")
//     console.log("")
//     repositoriesMap.forEach((value, collectionName) => {
//         console.log(collectionName)
//         console.log("------------------->")
//         const referenceEntites = value.entityProperties.referenceEntities;

//         if (referenceEntites?.length) {
//             for (let i = 0; i < referenceEntites.length; i++) {
//                 const ref = referenceEntites[i];
//                 drawRefsMap(ref)
//             }
//         }
//     })

// }

// const drawRefsMap = (ref: ReferenceEntity) => {
//     console.log(JSON.stringify(ref, null, 4));
// }