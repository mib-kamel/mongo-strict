import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, IsDate, MinLength, IsString } from '../../../src';

@Entity({ name: 'user' })
class UserEntity {
    @Allow()
    @IsEmail(undefined, { message: "The email should be valid :(" })
    @IsUnique({ isIgnoreCase: true })
    email: string;

    @Allow()
    @IsRequired()
    @MinLength(3)
    name: string;

    @Allow()
    @IsString()
    country: string;
}

export class UserRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(UserEntity, undefined, { debug: false }).getORM();
        super(ORM);
    }
}
