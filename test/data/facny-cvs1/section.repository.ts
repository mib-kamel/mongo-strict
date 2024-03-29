import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, Allow, IsString, RELATION_TYPES } from '../../../src';

@Entity({ name: 'section' })
class SectionEntity {
    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'cv',
        key: 'id',
        type: RELATION_TYPES.MANY_TO_ONE
    })
    cv: string;

    @Allow()
    @IsRequired()
    @IsString()
    sectionTitle: string;
}

export class SectionRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(SectionEntity);
        super(ORM);
    }
}
