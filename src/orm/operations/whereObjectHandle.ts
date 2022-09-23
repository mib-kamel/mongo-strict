import { ObjectId } from "mongodb";
import { ReferenceEntity } from "../interfaces/orm.interfaces";
import { isObjectID, isStringObjectID } from "../utils/utils";
import { getCurrentReference, isRefersToId } from "./operationsUtils";

export function getWhereObject(where: any, referenceEntities: ReferenceEntity[], parentKey?) {
    if (where === undefined) {
        return {};
    }

    if (isObjectID(where)) {
        return { _id: where };
    }

    if (typeof where === 'object' && Object.keys(where).length === 0) {
        return where;
    }

    const comparisonKeys = ['$eq', '$ne'];
    const arrayKeys = ['$in', '$ni', '$all'];
    const arrayLogicalKeys = ['$or', '$and', '$nor'];
    const logicalKeys = ['$not'];

    if (typeof where === 'object' && !Array.isArray(where)) {
        let newWhere: any = {};

        if (where.id) {
            where._id = where.id;
            delete where.id;
        }

        if (typeof where._id === 'string' && isStringObjectID(where._id)) {
            where._id = new ObjectId(where._id);
        } else if (where._id !== undefined) {
            where._id = where._id;
        }

        const keys = Object.keys(where);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = where[key];

            if (parentKey !== undefined && comparisonKeys.includes(key)) {
                let isToId = false;
                const currentRefersTo = getCurrentReference(parentKey, referenceEntities);
                const isId = parentKey === '_id' || parentKey === 'id';

                if (currentRefersTo) {
                    isToId = isRefersToId(currentRefersTo);
                }

                if ((isToId || isId) && isStringObjectID(value)) {
                    newWhere[key] = new ObjectId(value);
                } else if ((isToId || isId) && !isObjectID(value)) {
                    throw `${parentKey} refers to ${currentRefersTo.refersToCollectionName}.${currentRefersTo.refersToKey} and should be a valid ObjectId`;
                } else {
                    newWhere[key] = value
                }
            } else if (arrayLogicalKeys.includes(key)) {
                if (!Array.isArray(value)) {
                    throw `${key} operation should be an array`;
                }

                const newArr = [];
                for (let j = 0; j < value.length; j++) {
                    newArr.push(getWhereObject(value[j], referenceEntities));
                }
                newWhere[key] = newArr;

            } else if (logicalKeys.includes(key)) {
                if (Array.isArray(value) || typeof value !== 'object') {
                    throw `${key} operation should be an object`;
                }

                newWhere[key] = getWhereObject(value, referenceEntities, parentKey);

            } else if (parentKey !== undefined && arrayKeys.includes(key)) {
                if (!Array.isArray(value)) {
                    throw `${key} operation should be an array`;
                }

                let isToId = false;
                const currentRefersTo = getCurrentReference(parentKey, referenceEntities);
                const isId = parentKey === '_id' || parentKey === 'id';

                if (currentRefersTo) {
                    isToId = isRefersToId(currentRefersTo);
                }

                newWhere[key] = value.map(v => {
                    if ((isToId || isId) && isStringObjectID(v)) {
                        return new ObjectId(v);
                    } else if ((isToId || isId) && !isObjectID(v)) {
                        throw `${parentKey} refers to ${currentRefersTo.refersToCollectionName}.${currentRefersTo.refersToKey} and should be a valid ObjectId`;
                    } else {
                        return v;
                    }
                })
            } else {
                if (typeof value === 'object' && !isObjectID(value) && !Array.isArray(value)) {
                    newWhere[key] = getWhereObject(value, referenceEntities, key);
                } else if (typeof value === 'string') {
                    let isToId = false;
                    const currentRefersTo = getCurrentReference(key, referenceEntities);

                    if (currentRefersTo) {
                        isToId = isRefersToId(currentRefersTo);
                    }

                    if (isToId && isStringObjectID(value)) {
                        newWhere[key] = new ObjectId(value);
                    } else if (isToId && !isObjectID(value)) {
                        throw `${key} refers to ${currentRefersTo.refersToCollectionName}.${currentRefersTo.refersToKey} and should be a valid ObjectId`;
                    } else {
                        newWhere[key] = value;
                    }
                } else {
                    newWhere[key] = value;
                }
            }
        }
        return newWhere;
    } else if (typeof where === 'string') {
        if (isStringObjectID(where)) {
            return { _id: new ObjectId(where) };
        } else {
            throw 'Where should be a valid ObjectId or a mongodb query expression';
        }
    } else if (Array.isArray(where)) {
        return {
            $or: where.map((id) => {
                if (typeof id === 'string' && isStringObjectID(id)) {
                    return { _id: new ObjectId(id) };
                } else if (isObjectID(id)) {
                    return { _id: id };
                } else {
                    throw 'Where should be a valid ObjectId, array of ObjectId or a mongodb query expression';
                }
            })
        }
    } else {
        throw 'Invalid where query expression';
    }
}