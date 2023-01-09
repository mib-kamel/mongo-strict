import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, IsDate, MinLength, IsString, IsOptional, Referers } from '../../../src';

@Entity({ name: 'user' })
class UserEntity {
    @Referers([{
        collection: 'cv',
        key: 'user',
        as: 'cvs'
    }])
    id: string;

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
    @IsOptional()
    country: string;
}

export class UserRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(UserEntity, { debug: false });
        super(ORM);
    }
}
