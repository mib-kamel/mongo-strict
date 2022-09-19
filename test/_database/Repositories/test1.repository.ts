import { Allow, IsString, IsNumber, IsObject, IsEmail, MaxLength, IsNumberString, MinLength, Min, Max, IsBoolean, IsJSON, IsOptional, IsUnique, RefersTo, Default, Entity, IsRequired, addRepository, ORMOperations } from '../../../src';

import DATABASE_CONSTANTS from '../database.test.constants';

@Entity({ name: DATABASE_CONSTANTS.TEST1_COLLECTION })
class Test1Entity {
    @Allow()
    id;

    @Allow()
    @IsNumber()
    @Min(0)
    @Max(500)
    @Default(20)
    numberKey;

    @Allow()
    @IsString()
    @IsUnique({ isIgnoreCase: true, message: 'This email is already registered' })
    @IsRequired({ message: 'The Email Address is Required' })
    @IsEmail()
    @MaxLength(100)
    email;

    @Allow()
    @IsNumberString()
    @MaxLength(14)
    @MinLength(8)
    @IsUnique({ message: 'This phone is already registered' })
    @IsRequired({ message: 'The Phone Number is Required' })
    phone;

    @Allow()
    @IsString()
    @IsRequired({ message: 'The Email Address is Required' })
    @IsUnique({ message: 'This USer Name is already registered' })
    @MaxLength(10)
    @MinLength(3)
    userName;

    @Allow()
    @IsBoolean()
    booleanKey;

    @Allow()
    @IsObject()
    @Default({
        text: 'I am JSON Key ;)'
    })
    jsonKey;

    @Allow()
    @IsUnique()
    notRequiredUnique;

    @Allow()
    notRequiredStringKey;

    @Allow()
    @IsOptional()
    optionalKey;
}

const DEFAULT_SELECT_FIELDS: string[] = [
    'id',
    'email',
    'phone',
    'numberKey',
    'booleanKey',
    'jsonKey',
    "createdAt",
    "updatedAt"
];

export class Test1Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(Test1Entity, { defaultSelectFields: DEFAULT_SELECT_FIELDS });
        super(ORM);
    }
}
