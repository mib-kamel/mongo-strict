import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, IsString, IsBoolean, Allow } from '../../../src';

@Entity({ name: 'cv' })
class CVEntity {
    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'user',
        key: 'id',
        reverseRefering: true,
        reverseReferingAs: 'cv'
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
