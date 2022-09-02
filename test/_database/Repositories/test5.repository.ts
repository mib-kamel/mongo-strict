import { addRepository, IsArray, IsString, Entity, ORMOperations, RefersTo, RELATION_TYPES } from '../../../src';

import DATABASE_CONSTANTS from '../database.test.constants';

@Entity({ name: DATABASE_CONSTANTS.TEST5_COLLECTION })
class Test5Entity {
    @IsString()
    name;

    @IsArray()
    @RefersTo({
        collection: DATABASE_CONSTANTS.TEST3_COLLECTION,
        key: 'id',
        type: RELATION_TYPES.MANY_TO_MANY
    })
    repo3;

    @IsArray()
    @RefersTo({
        collection: DATABASE_CONSTANTS.TEST1_COLLECTION,
        key: 'email',
        type: RELATION_TYPES.MANY_TO_MANY
    })
    repo1Email;
}

const DEFAULT_SELECT_FIELDS: string[] = [
    'id',
    'repo3',
    "createdAt",
    "updatedAt"
];

export class Test5Repository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(Test5Entity, DEFAULT_SELECT_FIELDS).getORM();
        super(ORM);
    }
}
