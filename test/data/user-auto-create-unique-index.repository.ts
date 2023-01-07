import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, IsDate, MinLength, IsString, IsOptional } from '../../src';

@Entity({ name: 'user-auto-create-unique-index' })
class User3Entity {
    @Allow()
    @IsEmail(undefined, { message: "The email should be valid :(" })
    @IsUnique({ isAutoCreateUniqueIndex: true })
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

export class User3Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(User3Entity);
        super(ORM);
    }
}
