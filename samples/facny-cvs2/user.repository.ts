import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, MinLength, IsString, IsArray, RefersTo } from 'mongo-strict';

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

    @Allow()
    @IsArray()
    @RefersTo({
        collection: 'cv',
        key: 'id',
        isArray: true
    })
    cvs: any[];
}

export class UserRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(UserEntity, { debug: false });
        super(ORM);
    }
}
