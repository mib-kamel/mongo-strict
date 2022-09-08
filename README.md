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
  - [Create Connection](#create-connection)
  - [Add Repository](#add-repository)
    - [Repository Options](#repository-options)
  - [Entity Class](#entity-class)
    - [Entity Validation](#entity-validation)
      - [class-validator](#class-validator)
      - [IsRequired](#isrequired)
      - [IsUnique](#isunique)
      - [Default](#default)
      - [RefersTo](#refersto)
      - [RefersTo Options](#refersto-options)
  - [Initialize the DB Map](#initialize-the-db-map)
  - [Operations](#operations)
    - [find(findOptionsObject)](#findfindoptionsobject)
      - [FindOptions](#findoptions)
      - [find example](#find-example)
    - [findAndCount(findOptionsObject)](#findandcountfindoptionsobject)
    - [findOne(findOptionsObject)](#findonefindoptionsobject)
    - [count(findOptionsObject)](#countfindoptionsobject)
    - [findOneById(id: string, select)](#findonebyidid-string-select)
    - [Query Caching](#query-caching)
    - [Query Builder](#query-builder)

## Instalation

```JavaScript
npm install mongo-strict --save
```

## Usage

Example: Suppose we have CVs management system => Every user can create multiple CVs and every CV has multiple sections.

Create your Database connection with the connection URL

```JavaScript
import { createConnection } from 'mongo-strict';

await createConnection({
    uri: `mongodb://localhost:27017/fancy-cvs`
});
```

Define your DB Repositories:

```JavaScript
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

```

```JavaScript
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
        const ORM = addRepository(CVEntity);
        super(ORM);
    }
}
```

```JavaScript
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
        const ORM = addRepository(SectionEntity);
        super(ORM);
    }
}
```

Then you are ready to start...

```JavaScript
import { createConnection, initDBMap } from 'mongo-strict';
import { SectionRepository } from './section.repository';
import { CVRepository } from './cv.repository';
import { UserRepository } from './user.repository';

const start = async () => {
    await createConnection({
        uri: `mongodb://localhost:27017/fancy-cvs`
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

## Create Connection

You should pass the connection options which should contains the connection uri.
You can pass the default repositoryOptions which will be applied to the all repositories.

```JavaScript
await createConnection({
    uri: `mongodb://localhost:27017/fancy-cvs`
}, repositoryOptions);
```

[Repository Options](#repository-options)

## Add Repository

You can add a new repository by calling:

```JavaScript
addRepository(EntityClass, repositoryOptions)
```

### Repository Options

| Option | Description |
|--------|-------------|
|    autoCreatedAt    |       default true      |
|    autoUpdatedAt    |       default true      |
|    createdAtKey    |      default 'createdAt'       |
|    updatedAtKey    |        default 'updatedAt'     |
|    maxFindTimeMS    |       default 60000      |
|    debug    |       default false      |
|    defaultSelectFields    |      default undefined       |
|    cacheTimeout    |      default 1000 MS       |
|    entityClassValidator    |      Entity Class Validator Options (defaults: {whitelist: true, forbidNonWhitelisted: true, validationError: { target: false }})       |
|    reverseRefering    |      Determine if you want to be able to select a refernce from the refers to collection (default : false), **BE CAREFUL BEFORE ENABLING THIS BECAUSE IT MAY AFFECT YOUR APP PERFORMANCE**       |

## Entity Class

You should pass the @Entity decorator before the Entity class and pass the collection name as a variable.

The entity class should contains all the entity keys.

You can add validations to every key and determine the default value, uniquness and the references.

```JavaScript
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
}
```

### Entity Validation

#### class-validator

We use [class-validator to validate the Entities](https://www.npmjs.com/package/class-validator#validation-decorators)

So you can call any validator class-validator provides, Exampels:

```JavaScript
  @Length(10, 20)
  @Contains('hello')
  @IsInt()
  @Min(0)
  @Max(10)
  @IsEmail()
  @IsFQDN()
  @IsDate()
```

#### IsRequired

You can mark any key as a required and pass the error message which will be passed if the key is not found.

```JavaScript
@IsRequired({message: 'This Key is required'})
requiredKey;
```

#### IsUnique

You can mark any key as unique key througt the collection.

You can determine if you need it case sensetive or not.

```JavaScript
@IsUnique({message 'The use email should be unique', isIgnoreCase: true}) // isIgnoreCase default false
userEmail;
```

#### Default

You can pass the default value of any key

```JavaScript
@Default(0)
@IsNumber()
counter;
```

#### RefersTo

You can mark any key as a reference key.

```JavaScript
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
|    reverseRefering    |       Determine if want to be able to select the current collection from the refers to collection (default false)     |
|    reverseReferingAs    |       Select the current key form the refers to collection as      |
|    maxDepth    |      Max Depth in case of circular references       |
|    type    |       The relation type =>  RELATION_TYPES.ONE_ONE - RELATION_TYPES.ONE_TO_MANY - RELATION_TYPES.MANY_TO_ONE - RELATION_TYPES.MANY_TO_MANY (default many to one) |
|    message    |       The error messasge in case of inser or update refers to entity not found      |

## Initialize the DB Map

You should call initDBMap() function after initializing all the repositories to inialize your database reference Map, Example:

```Javascript
    await createConnection({
        uri: `mongodb://localhost:27017/fancy-cvs`
    });

    const userRepository = new UserRepository();
    const cvRepository = new CVRepository();
    const sectionRepository = new SectionRepository();

    // Should be called after initializing all the repositories
    initDBMap();

    // You can find the complete example in the Samples folder
```

## Operations

mongo-strict supports the main Database operations and you can get the original collection for any operation we do not support until now.

### find(findOptionsObject)

To make a find query you have to pass the find options object which can contain where, select, sort...

#### FindOptions

|  findOption  |  Description  |
|---|---|
|  where  |  Filters the documents to pass only the documents that match the specified condition(s). (mongodb aggergation [$match](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/)) |
|  select  |  determine the field you want to select (can be array of strings or mongodb aggergation [$project](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/)) |
|  sort  |  returns the documents in sorted order (mongodb aggergation [$sort](https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/)) |
|  limit  |  Limits the number of the returned documents (mongodb aggergation [$limit](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/)) |
|  skip  |  Skips over the specified number of documents (mongodb aggergation [$skip](https://www.mongodb.com/docs/manual/reference/operator/aggregation/skip/)) |

#### find example

suppose we have a collection of users and we want to get the email of the latest 10 users from a specific country...

```JavaScript
// returns array of documents
const usersEmail = await userRepository.find({
    where: {country: "Mongolia"},
    sort: {createdAt: -1},
    limit: 10,
    skip: 0,
    select: ["email", "id"]
})
```

### findAndCount(findOptionsObject)

```JavaScript
const {data, count} = await userRepository.findAndCount({
    where: {country: "Mongolia"},
    sort: {createdAt: -1},
    limit: 10,
    skip: 0,
    select: ["email", "id"]
})

/* This will return {
    data: Array of the returned documents,
    count: the total count of user from mongolia
} */
```

### findOne(findOptionsObject)

It only finds one!

```JavaScript
const latestUserEmail = await userRepository.findOne({
    where: {country: "Mongolia"},
    sort: {createdAt: -1},
    select: ["email", "id"]
})
```

### count(findOptionsObject)

It will return the total number of documents apllies the where object.

```JavaScript
const usersCount = await userRepository.count({
    where: {country: "Mongolia"}
})
```

### findOneById(id: string, select)

It will find one document by its id and can select the wanted feilds.

```JavaScript
const user = await userRepository.findOneById("6309c6f839fc4980aeb34677", ["email"])
```

### Query Caching

You can cache any query to get the results directly from the memory

```JavaScript
repository.find({ where: { email: records[0].email }, cache: true })

or

repository.find({ where: { email: records[0].email }, cache: {timeout: 3000} }) // the default cache Timeout is 1000 MS = 1 Second
```

### Query Builder

You can use the query builder for a better code appearence!

```JavaScript
repo.queryBuilder()
    .where({isDeleted: false})
    .select(["email"])
    .sort({id: -1})
    .limit(10)
    .cache(true)
    .find();
```
