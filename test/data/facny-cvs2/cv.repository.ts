import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, IsString, Allow, IsArray } from '../../../src';

@Entity({ name: 'cv' })
class CVEntity {
    @Allow()
    @IsRequired()
    @IsString()
    cvName: string;

    @Allow()
    @IsRequired()
    @IsString()
    currentPosition: string;

    @Allow()
    @IsArray()
    @RefersTo({
        collection: 'section',
        key: 'id',
        isArray: true
    })
    sections: any[]
}

export class CVRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CVEntity).getORM();
        super(ORM);
    }
}
