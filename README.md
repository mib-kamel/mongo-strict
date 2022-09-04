# mongo-strict

Mongo Strict is a complete MongoDB ORM, It makes the usage of MongoDB safer, easier and faster with a better performance...

## mongo-strict Allows you to

- Define the **entity data types** and ensure the data validity (Using class-validator in the background).
- Define the **relations between the data**.
- Add a **default value** for any field.
- Mark any field as **required**.
- Get the **related data using the reference keys** whithout using any complicated lookups.
- Imporove the **App performance** by using the best practices in the background.
- Imporove the **code quality**.
- Cache any query for a better performance.


**mongo-strict gives you the safety of the SQL DBs with keeping the flexibility and the ease of use of MongoDB**


## Table of Contents

- [mongo-strict](#mongo-strict)
  - [mongo-strict Allows you to](#mongo-strict-allows-you-to)
  - [Table of Contents](#table-of-contents)
  - [Instalation](#instalation)
  - [Usage](#usage)

## Instalation

```
npm install mongo-strict --save
```

## Usage

Example: Suppose we have CVs management system => Every user can create multiple CVs and every CV has multiple sections.

Create your Database connection with the connection URL

```
import { createConnection } from 'mongo-strict';

await createConnection({
    url: `mongodb://localhost:27017/fancy-cvs`,
    synchronize: false,
    logging: false,
});
```

Add your DB Repositories:

```
import { addRepository, Entity, IsRequired, IsUnique, ORMOperations, Allow, IsEmail, IsDate, MinLength } from 'mongo-strict';

@Entity({ name: 'user' })
class UserEntity {
    @Allow()
    @IsEmail()
    @IsUnique({ isIgnoreCase: true })
    emailAddress: string;

    @Allow()
    @IsRequired()
    @MinLength(3)
    @IsUnique({ isIgnoreCase: true })
    userName: string;

    @Allow()
    @IsDate()
    lastSeenAt: Date;
}

export class UserRepository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(UserEntity).getORM();
        super(ORM);
    }
}

```

```
import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, IsString, IsBoolean, Allow } from 'mongo-strict';

@Entity({ name: DATABASE_CONSTANTS.'user-cv' })
class UserCVEntity {
    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'user',
        key: 'id'
    })
    user: string;

    @Allow()
    @IsRequired()
    @IsString()
    name: string;

    @Allow()
    @IsRequired()
    @IsString()
    currentPosition: string;

    @Allow()
    @IsRequired()
    @IsString()
    cvLanguage: string;

    @Allow()
    @IsBoolean()
    isDeleted: boolean;
}

export class UserCVRepository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(UserCVEntity, DEFAULT_SELECT_FIELDS).getORM();
        super(ORM);
    }
}
```

```
import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, RELATION_TYPES, Allow, IsNumber, IsString, IsObject, IsBoolean } from 'mongo-strict';

@Entity({ name: 'cv-section' })
class UserSectionEntity {
    @Allow()
    @IsRequired()
    @IsObject()
    sectionTitle: object;

    @Allow()
    @IsRequired()
    @IsObject()
    sectionContent: object;

    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'user',
        key: 'id'
    })
    user: string;

    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: DATABASE_CONSTANTS.'user-cv',
        key: 'id',
        type: RELATION_TYPES.MANY_TO_ONE,
        refererAs: 'sections'
    })
    cv: string;

    @Allow()
    @IsBoolean()
    isDeleted: boolean;
}

export class UserSectionRepository extends ORMOperations {
    public getORM;
    public getCollection;

    constructor() {
        const ORM = addRepository(UserSectionEntity, DEFAULT_SELECT_FIELDS).getORM();
        super(ORM);
    }
}
```

Then we need to call this function to initialize the DB Mapping

```
import { initDBMap } from 'mongo-strict';

initDBMap();
```

Then you are ready to start...