import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, IsDate, MinLength, IsString, IsOptional } from '../../src';

@Entity({ name: 'user-no-ignore' })
class User2Entity {
    @Allow()
    @IsEmail(undefined, { message: "The email should be valid :(" })
    @IsUnique()
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

export class User2Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(User2Entity);
        super(ORM);
    }
}
