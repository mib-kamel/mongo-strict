import { addRepository, IsString, Entity, ORMOperations, RefersTo, RELATION_TYPES } from '../../../src';

import DATABASE_CONSTANTS from '../database.test.constants';

@Entity({ name: DATABASE_CONSTANTS.TEST4_COLLECTION })
class Test4Entity {
    @IsString()
    name;

    @IsString()
    @RefersTo({
        collection: DATABASE_CONSTANTS.TEST1_COLLECTION,
        key: 'id',
        type: RELATION_TYPES.ONE_TO_ONE
    })
    repo1;
}

const DEFAULT_SELECT_FIELDS: string[] = [
    'id',
    'repo1',
    "createdAt",
    "updatedAt"
];

export class Test4Repository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(Test4Entity, { defaultSelectFields: DEFAULT_SELECT_FIELDS });
        super(ORM);
    }
}
