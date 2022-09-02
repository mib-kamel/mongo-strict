import { ReferenceEntity, RELATION_TYPES } from "../interfaces/orm.interfaces";

const MAX_DEPTH = 10;

export default function initRefsMap(repositoriesMap: Map<string, any>) {
    repositoriesMap.forEach((value, collectionName) => {
        for (let i = 0; i < value.entityProperties?.referenceEntities?.length || 0; i++) {
            const ref = value.entityProperties.referenceEntities[i];
            if (!ref.type) {
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

            if (!ref.refersToCollectionName || ref.refererCollectionName || ref.refersToCollectionName === collectionName) continue;

            const refersTo = repositoriesMap.get(ref.refersToCollectionName);

            if (!refersTo.entityProperties.referenceEntities === undefined) {
                refersTo.entityProperties.referenceEntities = [];
            }

            let newRelationType = '';

            if (ref.type === RELATION_TYPES.MANY_TO_ONE) {
                newRelationType = RELATION_TYPES.ONE_TO_MANY;
            } else if (ref.type === RELATION_TYPES.ONE_TO_MANY) {
                newRelationType = RELATION_TYPES.MANY_TO_ONE;
            } else {
                newRelationType = ref.type;
            }

            refersTo.entityProperties.referenceEntities.push({
                key: ref.refersToKey,
                refererCollectionName: collectionName,
                refererKey: ref.key,
                as: ref.refererAs || collectionName,
                type: newRelationType,
                maxDepth: ref.maxDepth
            })
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
    if (!ref.refersToCollectionName || !ref.refersToKey) {
        throw new Error("Invalid Reference Entity - " + JSON.stringify(ref));
    }
}

function extendReferenceEntities(repositoriesMap: any, parent: ReferenceEntity, depth, circulatDepth = 0, parents) {

    const targetCollectionName = parent.refersToCollectionName || parent.refererCollectionName;
    const refersTo = repositoriesMap.get(targetCollectionName);

    const newParent = [...parents, targetCollectionName];

    const refersToOptions = refersTo?.entityProperties;

    const newReferenceEntities = [];

    for (let i = 0; i < refersToOptions?.referenceEntities?.length || 0; i++) {
        const ref = refersToOptions.referenceEntities[i];
        let newRef: ReferenceEntity = { key: '' };

        const newTargetCollectionName = ref.refersToCollectionName || ref.refererCollectionName;

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

        const ref1 = parent.refersToCollectionName || parent.refererCollectionName;
        const ref2 = ref.refersToCollectionName || ref.refererCollectionName;
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

const drawMap = (repositoriesMap) => {
    console.log("")
    console.log("")
    console.log("START DRAW MAP")
    console.log("")
    repositoriesMap.forEach((value, collectionName) => {
        console.log(collectionName)
        console.log("------------------->")
        const referenceEntites = value.entityProperties.referenceEntities;

        if (referenceEntites?.length) {
            for (let i = 0; i < referenceEntites.length; i++) {
                const ref = referenceEntites[i];
                drawRefsMap(ref)
            }
        }
    })

}

const drawRefsMap = (ref: ReferenceEntity) => {
    console.log(JSON.stringify(ref, null, 4));
}