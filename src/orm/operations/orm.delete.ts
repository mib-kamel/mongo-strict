import { ReferenceEntity } from "../interfaces/orm.interfaces";
import { getWhereObject } from "./operationsUtils";

export async function deleteOne(
    Repository,
    referenceEntities: ReferenceEntity[],
    where: any
) {
    where = getWhereObject(where, referenceEntities);

    return Repository.deleteOne(where);
}

export async function deleteMany(
    Repository,
    referenceEntities: ReferenceEntity[],
    where: any
) {
    where = getWhereObject(where, referenceEntities);

    return Repository.deleteMany(where);
}