import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, Allow, IsString, RELATION_TYPES } from '../../../src';

@Entity({ name: 'circular' })
class CircularEntity {
    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'circular',
        key: 'id',
        maxDepth: 3,
    })
    parent: string;
}

export class CircularRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CircularEntity);
        super(ORM);
    }
}
