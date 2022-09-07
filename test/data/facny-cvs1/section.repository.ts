import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, Allow, IsString } from '../../../src';

@Entity({ name: 'section' })
class SectionEntity {
    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'cv',
        key: 'id',
        refersToAs: 'sections'
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
