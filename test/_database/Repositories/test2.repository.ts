import { Default, Entity, IsRequired, addRepository, ORMOperations, Allow, IsString, IsNumber, IsEmail, MaxLength, IsNumberString, MinLength, Min, Max } from '../../../src';

import DATABASE_CONSTANTS from '../database.test.constants';

@Entity({ name: DATABASE_CONSTANTS.TEST2_COLLECTION })
class Test2Entity {
    @Allow()
    @IsString()
    @IsRequired({ message: 'The Email Address is Required' })
    @IsEmail()
    @MaxLength(100)
    email;

    @Allow()
    @IsNumberString()
    @MaxLength(14)
    @MinLength(8)
    @IsRequired({ message: 'The Phone Number is Required' })
    phone;

    @Allow()
    @IsNumber()
    @Min(0)
    @Max(500)
    @Default(20)
    numberKey;
}

const DEFAULT_SELECT_FIELDS: string[] = [
    'id',
    'email',
    'phone',
    'numberKey',
];

export class Test2Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(Test2Entity, DEFAULT_SELECT_FIELDS).getORM();
        super(ORM);
    }
}
