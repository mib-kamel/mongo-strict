import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, IsString, IsBoolean, Allow, Referers } from '../../../src';

@Entity({ name: 'cv' })
class CVEntity {
    @Referers([{
        collection: 'section',
        key: 'cv',
        as: 'sections'
    }])
    id: string;

    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'user',
        key: 'id'
    })
    user: string;

    @Allow()
    @IsRequired()
    @IsString()
    cvName: string;

    @Allow()
    @IsRequired()
    @IsString()
    currentPosition: string;
}

export class CVRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CVEntity);
        super(ORM);
    }
}
