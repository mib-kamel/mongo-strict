import { addRepository, IsOptional, IsString, Entity, ORMOperations, RefersTo, RELATION_TYPES } from '../../../src';

import DATABASE_CONSTANTS from '../database.test.constants';

@Entity({ name: DATABASE_CONSTANTS.TEST3_COLLECTION })
class Test3Entity {
    @IsString()
    @IsOptional()
    @RefersTo({
        collection: DATABASE_CONSTANTS.TEST1_COLLECTION,
        key: 'id'
    })
    repo1;

    @IsString()
    @IsOptional()
    @RefersTo({
        collection: DATABASE_CONSTANTS.TEST1_COLLECTION,
        key: 'email'
    })
    repo1Email;
}

const DEFAULT_SELECT_FIELDS: string[] = [
    'id',
    'repo1',
    'repo2',
    "createdAt",
    "updatedAt"
];

export class Test3Repository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(Test3Entity, DEFAULT_SELECT_FIELDS).getORM();
        super(ORM);
    }
}
