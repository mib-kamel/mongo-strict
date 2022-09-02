import { ObjectId } from "mongodb";
import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
import { getWhereObject } from "./operationsUtils";

export async function deleteOne(
    Repository,
    referenceEntities: ReferenceEntity[],
    where: any,
    repositoryOptions: RepositoryOptions
) {
    where = getWhereObject(where);

    if (referenceEntities?.length) {
        for (let i = 0; i < referenceEntities.length; i++) {
            const ref = referenceEntities[i];
            const refWhereData = where[ref.key];
            if (ref.refersToKey === 'id' && typeof refWhereData === 'string') {
                where[ref.key] = new ObjectId(where[ref.key]);
            }
        }
    }

    return Repository.deleteOne(where);
}

export async function deleteMany(
    Repository,
    referenceEntities: ReferenceEntity[],
    where: any,
    repositoryOptions: RepositoryOptions
) {
    where = getWhereObject(where);

    if (referenceEntities?.length) {
        for (let i = 0; i < referenceEntities.length; i++) {
            const ref = referenceEntities[i];
            const refWhereData = where[ref.key];
            if (ref.refersToKey === 'id' && typeof refWhereData === 'string') {
                where[ref.key] = new ObjectId(where[ref.key]);
            }
        }
    }

    return Repository.deleteMany(where);
}