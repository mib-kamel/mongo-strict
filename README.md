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
- **Cache** any query for a better performance.


**mongo-strict gives you the safety of the SQL DBs with keeping the flexibility and the ease of use of MongoDB**


## Table of Contents

- [mongo-strict](#mongo-strict)
  - [mongo-strict Allows you to](#mongo-strict-allows-you-to)
  - [Table of Contents](#table-of-contents)
  - [Instalation](#instalation)
  - [Usage](#usage)
  - [Index file example:](#index-file-example)
  - [Entity Validation](#entity-validation)
    - [class-validator](#class-validator)
    - [IsRequired](#isrequired)
    - [IsUnique](#isunique)
    - [Default](#default)
    - [RefersTo](#refersto)
      - [RefersTo Options](#refersto-options)

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
    url: `mongodb://localhost:27017/fancy-cvs`
});
```

Define your DB Repositories:

```
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
        const ORM = addRepository(UserEntity, undefined, { debug: false }).getORM();
        super(ORM);
    }
}

```

```
import { addRepository, Entity, IsRequired, ORMOperations, RefersTo, IsString, Allow, IsArray } from 'mongo-strict';

@Entity({ name: 'cv' })
class CVEntity {
    @Allow()
    @IsRequired()
    @IsString()
    cvName: string;

    @Allow()
    @IsRequired()
    @IsString()
    currentPosition: string;

    @Allow()
    @IsArray()
    @RefersTo({
        collection: 'section',
        key: 'id',
        isArray: true
    })
    sections: any[]
}

export class CVRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CVEntity).getORM();
        super(ORM);
    }
}
```

```
import { addRepository, Entity, IsRequired, ORMOperations, Allow, IsString } from 'mongo-strict';

@Entity({ name: 'section' })
class SectionEntity {
    @Allow()
    @IsRequired()
    @IsString()
    sectionTitle: string;
}

export class SectionRepository extends ORMOperations {
    constructor() {
        const ORM = addRepository(SectionEntity).getORM();
        super(ORM);
    }
}
```

Then you are ready to start...

## Index file example:
```
import { createConnection, initDBMap } from 'mongo-strict';
import { SectionRepository } from './section.repository';
import { CVRepository } from './cv.repository';
import { UserRepository } from './user.repository';

const start = async () => {
    await createConnection({
        url: `mongodb://localhost:27017/fancy-cvs`
    });

    const userRepository = new UserRepository();
    const cvRepository = new CVRepository();
    const sectionRepository = new SectionRepository();

    // Should be called after initializing all the repositories
    initDBMap();

    let insertedUser;
    try {
        // You don't need to make any check before inserting or updating, mongo-strict will do that.
        insertedUser = await userRepository.insertOne({
            email: 'email@co.co',
            name: 'mongo user',
            country: 'mongolia',
            cvs: []
        });
    } catch (e) { }

    let insertedCV;
    if (insertedUser) {
        try {
            insertedCV = await cvRepository.insertOne({
                cvName: 'User CV 1',
                currentPosition: 'Developer !',
                sections: []
            });
            await userRepository.update(insertedUser.id).setOne({ cvs: [insertedCV.id] });
        } catch (e) { }
    }

    if (insertedCV && insertedUser) {
        const insertedSections: any = [];
        for (let i = 0; i < 6; i++) {
            try {
                const insertSection = await sectionRepository.insertOne({
                    sectionTitle: `Section ${i + 1}`
                });
                insertedSections.push(insertSection);
            } catch (e) { }
        }

        await cvRepository.update(insertedCV.id).setOne({ sections: insertedSections.map((section) => section.id) });
    }

    // This will fetch the user cvs and section with no need to make any lookups
    const userData = await userRepository.findOne({
        select: ["id", "name", "cvs.cvName", "cvs.currentPosition", "cvs.sections.sectionTitle"]
    })

    console.log(JSON.stringify(userData, null, 4));
}

start();
```

**You can check more examples in the samples folder**

## Entity Validation

### class-validator

We use [class-validator to validate the Entities](https://www.npmjs.com/package/class-validator#validation-decorators)

So you can call any validator class-validator provides, Exampels:

```
  @Length(10, 20)
  @Contains('hello')
  @IsInt()
  @Min(0)
  @Max(10)
  @IsEmail()
  @IsFQDN()
  @IsDate()
```

### IsRequired
You can mark any key as a required and pass the error message which will be passed if the key is not found.

```
@IsRequired({message: 'This Key is required'})
requiredKey;
```

### IsUnique
You can mark any key as unique key througt the collection.
You can determine if you need it case sensetive or not

```
@IsUnique({message 'The use email should be unique', isIgnoreCase: true}) // isIgnoreCase default false
userEmail;
```

### Default
You can pass the default value of any key
```
@Default(0)
@IsNumber()
counter;
```

### RefersTo
You can mark any key as a reference key.
```
@RefersTo({
    collection: 'user'.
    key: 'id',
    as: 'user'
})
user;
```
#### RefersTo Options

| Option | Description |
|--------|-------------|
|    collection    | The collection which the key refers to|
|    key    |       The key which the refer key refers to      |
|    as    |       Select the reference as (defaults to the collection name)     |
|    isArray    |      Determine if the key is an array (for example we may have array of users refer to many users with defferent Ids) (default fakse)      |
|    refersToAs    |       Select the current key form the refers to collection as      |
|    maxDepth    |      Max Depth in case of circular references       |
|    type    |       The relation type =>  RELATION_TYPES.ONE_ONE - RELATION_TYPES.ONE_TO_MANY - RELATION_TYPES.MANY_TO_ONE - RELATION_TYPES.MANY_TO_MANY (default many to one) |
|    message    |       The error messasge in case of inser or update refers to entity not found      |
