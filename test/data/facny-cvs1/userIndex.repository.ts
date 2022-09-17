import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, IsDate, MinLength, IsString, IsOptional, RefersTo, RELATION_TYPES } from '../../../src';

@Entity({ name: 'userIndex' })
class UserIndexEntity {
    @IsString()
    @RefersTo({
        collection: 'user',
        key: 'id',
        type: RELATION_TYPES.ONE_TO_ONE
    })
    user: string;
}

export class UserIndexRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(UserIndexEntity, {
            defaultSelectFields: ['user.id', 'user.name']
        });
        super(ORM);
    }
}
