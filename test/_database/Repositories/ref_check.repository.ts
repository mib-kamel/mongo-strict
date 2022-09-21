import { addRepository, IsArray, IsString, Entity, ORMOperations, RefersTo, RELATION_TYPES, IsOptional, Allow } from '../../../src';

import DATABASE_CONSTANTS from '../database.test.constants';

@Entity({ name: 'STRICT_ORM__REC_CHECK_COLLECTION++' })
class Test15Entity {
    @Allow()
    id;
}

export class RefCheckRepository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(Test15Entity);
        super(ORM);
    }
}
