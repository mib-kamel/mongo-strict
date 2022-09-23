# mongo-strict

![Lines](https://img.shields.io/badge/lines-96.64%25-brightgreen.svg?style=flat)
![Statements](https://img.shields.io/badge/statements-96.55%25-brightgreen.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-98.25%25-brightgreen.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-86.44%25-yellow.svg?style=flat)

**mongo-strict is compatible with mongo >= 5**

Mongo Strict is a TypeScript-based smart MongoDB ORM, It makes the usage of MongoDB safer, easier and faster with better performance...

mongo-strict gives you the safety of the SQL DBs with keeping the flexibility and the ease of use of MongoDB.

## mongo-strict Allows you to

- Define the **entity data types** and ensure the data validity (Using class-validator in the background).
- Define the **relations between the data**.
- Add a **default value** for any field.
- Mark any field as **required**.
- Get the **related data using the reference keys** whithout using any complicated lookups.
- Imporove the **App performance** by using the best practices in the background.
- Imporove the **code quality**.
- **Cache** any query for a better performance.

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
    - [find(findOptions: FindOptions)](#findfindoptions-findoptions)
      - [FindOptions](#findoptions)
      - [find example](#find-example)
    - [findAndCount(findOptions: FindOptions)](#findandcountfindoptions-findoptions)
    - [findOne(findOptions: FindOptions)](#findonefindoptions-findoptions)
    - [count(findOptions: FindOptions)](#countfindoptions-findoptions)
    - [findOneById(id: string, select)](#findonebyidid-string-select)
    - [Query Caching](#query-caching)
    - [Query Builder](#query-builder)
    - [Find reference Entities](#find-reference-entities)
      - [Reverse Refering](#reverse-refering)
    - [inserOne](#inserone)
    - [Update(filter: object | id: string)](#updatefilter-object--id-string)
      - [1- setOne(data)](#1--setonedata)
      - [2- setMany(data)](#2--setmanydata)
      - [3- replaceOne(completeEntityData)](#3--replaceonecompleteentitydata)
    - [Errors Handling](#errors-handling)
      - [Invalid data error](#invalid-data-error)
      - [Existing Unique Keys](#existing-unique-keys)
      - [Not Found Reference Keys](#not-found-reference-keys)
    - [deleteOne(filter: any | id: string)](#deleteonefilter-any--id-string)
    - [deleteMany(filter: any | ids: string[])](#deletemanyfilter-any--ids-string)
    - [getCollection()](#getcollection)

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

You can pass the default repository Options which will be applied to the all repositories.

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
|    reverseRefering    |      Determine if you want to be able to select a reference from the refers to collection (default : false), **BE CAREFUL BEFORE ENABLING THIS BECAUSE IT MAY AFFECT YOUR APP PERFORMANCE**       |

## Entity Class

You should pass the @Entity decorator before the Entity class and pass the collection name as a variable.

The entity class should contains all the entity keys.

You can add validations to every key and determine the default value, uniqueness and the references.

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

So you can call any validator class-validator provides, Examples:

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

You can mark any key as unique key through the collection.

You can determine if you need it case sensitive or not.

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
|    isArray    |      Determine if the key is an array (for example we may have array of users refer to many users with different Ids) (default false)      |
|    reverseRefering    |       Determine if want to be able to select the current collection from the refers to collection (default false)     |
|    reverseReferingAs    |       Select the current key form the refers to collection as      |
|    maxDepth    |      Max Depth in case of circular references       |
|    type    |       The relation type =>  RELATION_TYPES.ONE_ONE - RELATION_TYPES.ONE_TO_MANY - RELATION_TYPES.MANY_TO_ONE - RELATION_TYPES.MANY_TO_MANY (default many to one) |
|    message    |       The error message in case of insert or update refers to entity not found      |

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

### find(findOptions: FindOptions)

To make a find query you have to pass the find options object which can contain where, select, sort...

#### FindOptions

|  findOption  |  Description  |
|---|---|
|  where  |  Filters the documents to pass only the documents that match the specified condition(s). (mongodb aggregation [$match](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/)) |
|  select  |  determine the field you want to select (can be array of strings or mongodb aggregation [$project](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/)) |
|  sort  |  returns the documents in sorted order (mongodb aggregation [$sort](https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/)) |
|  limit  |  Limits the number of the returned documents (mongodb aggregation [$limit](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/)) |
|  skip  |  Skips over the specified number of documents (mongodb aggregation [$skip](https://www.mongodb.com/docs/manual/reference/operator/aggregation/skip/)) |
| debug | true or false to print the final lookup DB method in the console, default = false |

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

### findAndCount(findOptions: FindOptions)

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

### findOne(findOptions: FindOptions)

It only finds one!

```JavaScript
const latestUserEmail = await userRepository.findOne({
    where: {country: "Mongolia"},
    sort: {createdAt: -1},
    select: ["email", "id"]
})
```

### count(findOptions: FindOptions)

It will return the total number of documents applies the where object.

```JavaScript
const usersCount = await userRepository.count({
    where: {country: "Mongolia"}
})
```

### findOneById(id: string, select)

It will find one document by its id and can select the wanted fields.

```JavaScript
const user = await userRepository.findOneById("6309c6f839fc4980aeb34677", ["email"])
```

### Query Caching

You can cache any query to get the results directly from the memory

```JavaScript
repository.find({ where: { email: 'email@co.co' }, cache: true }) // the default cache Timeout is 1000 MS = 1 Second

or

repository.find({ where: { email: 'email@co.co' }, cache: {timeout: 3000} })
```

### Query Builder

You can use the query builder for a better code organizing!

```JavaScript
repo.queryBuilder()
    .where({isDeleted: false})
    .select(["email"])
    .sort({id: -1})
    .limit(10)
    .cache(true)
    .find();
```

### Find reference Entities

Suppose we have user and CV repositories

```JavaScript
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
}

@Entity({ name: 'user' })
class UserEntity {
    @Allow()
    @IsEmail(undefined, { message: "The email should be valid :(" })
    @IsUnique({ isIgnoreCase: true })
    email: string;

    @Allow()
    @IsArray()
    @RefersTo({
        collection: 'cv',
        key: 'id',
        isArray: true
    })
    cvs: any[];
}
```

Here the user entity contains the CVs IDs (@RefersTo({collection: 'cv', .... }))

To get the all the user CVs we can easly do:

```JavaScript
userRepository.find({select: ['cvs.cvName']})
```

Once we select an inner value of the CVs, that will notify the mongo-strict to get the referenced entity.
**We can select, match and sort by cvs.cvName or any cvs inner key**

#### Reverse Refering

Suppose we have user and CV repositories but the CV repo is the container of the user Id.

```JavaScript
@Entity({ name: 'user' })
class UserEntity {
    @Allow()
    @IsEmail(undefined, { message: "The email should be valid :(" })
    @IsUnique({ isIgnoreCase: true })
    email: string;
}

@Entity({ name: 'cv' })
class CVEntity {
    @Allow()
    @IsRequired()
    @IsString()
    @RefersTo({
        collection: 'user',
        key: 'id',
        reverseRefering: true,
        reverseReferingAs: 'cv'
    })
    user: string;

    @Allow()
    @IsRequired()
    @IsString()
    cvName: string;

    @Allow()
    @IsRequired()
    @IsString()
    currentPosition: string;
}
```

We can easly get the user of any CV by doing:

```JavaScript
cvRepository.find({select: ['user.email', 'user.id']})
```

But in case if we need to get the user CVs we will need to use the **Reverse Refering**.

In the User entity we have nothing indicates that this user has CV/s.

Fortunutly mongo-strict supports this operation but it will not be good for the app performance.

So to be able to use that we had to add => reverseRefering: true, reverseReferingAs: 'cv' **(Be carefull before doing that)**.

Then we can do:

```JavaScript
userRepository.find({select: ['cv.cvName']})
```

**The problem here that the user repository contains nothing about the CV repository so to get the user CVs the DB will have to loop through all the CV entities to get the CVs which refer to the wanted user**

### inserOne

mongo-strict uses a simple insertOne operation and returns the inserted document.

```JavaScript
const insertedUser = await userRepository.insertOne({
                    email: 'email@co.co',
                    name: 'mongo user',
                    country: 'mongolia'
                });

const insertedCV = await cvRepository.insertOne({
                    user: insertedUser.id,
                    cvName: 'User CV 1',
                    currentPosition: 'Developer !'
                });
```

You can simply insert an Object contains your entity data.

mongo-strict will validate the inserted entity and check if any uniques key are previously existing or not, check for the existence of the reference keys and all the other checks, in case of any any error it will throw an error.

We doesn't fully support the mongoDB advanced insert operations.

### Update(filter: object | id: string)

To perform an update operation you need to call the Update function with the update filter or the id of the entity you want to update.

This will return 3 function you will need to pass the updated data/entity to:

#### 1- setOne(data)

- You need to pass just the keys you want to update in the entity.
- Updates only one matching document in the collection that match the filter.
- Returns the full updated Entity

```JavaScript
const updatedUser = await userRepository.update({email: 'email@co.co'}).setOne({
                    name: 'updated mongo user',
                  });

Or

const updatedUser = await userRepository.update(user.id). setOne({
                    name: 'updated mongo user',
                  });

```

#### 2- setMany(data)

updates all matching documents in the collection that match the filter.

**The method returns a document that contains:**

- A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled.
- matchedCount containing the number of matched documents.
- modifiedCount containing the number of modified documents.
- upsertedId containing the id for the upserted document

```JavaScript
await userRepository.update({}).setMany({
    isDeleted: false
});
// the will set isDelete to false in all users in the collection
```

#### 3- replaceOne(completeEntityData)

replaceOne() replaces the first matching document in the collection that matches the filter, using the replacement document

**Returns a document containing:**

- A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled.
- matchedCount containing the number of matched documents.
- modifiedCount containing the number of modified documents.
- upsertedId containing the id for the upserted document.

```JavaScript
await userRepository.update(user.id).replaceOne({
    email: 'newEmail@co.com',
    name: 'mongo user :)',
    country: 'mongolia'
});
```

### Errors Handling

Our goal in mongo-strict is to unify the way of throwing the exceptions and give you the full control of the error message to make you able to catch the error then pass it as a response directly with no more code.

#### Invalid data error

For example if you marked a field as @IsEmail()

```JavaScript
@Entity({ name: 'user' })
class UserEntity {
    @Allow()
    @IsEmail(undefined, { message: "The email should be valid :(" })
    @IsUnique({ isIgnoreCase: true, message: 'The email should be unique' })
    email: string;
}
```

Then you inserted an invalid email in insert or update it will throw:

```JavaScript
try {
    // insert invalid email
} catch(e) {
    console.log(e);

    // {
    //     message: 'Invalid Data Found',
    //     invalidKeys: ['email'],
    //     errorMessages: ['The email should be valid :(']
    // }
}
```

#### Existing Unique Keys

If you marked the email as a unique key and you tried to insert an email which is already exists it will throw:

```JavaScript
try {
    // insert already exists email
} catch(e) {
    console.log(e);

    // {
    //     message: 'Existing unique keys',
    //     existingUniqueKeys: ['email'],
    //     errorMessages: ['The email should be unique']
    // }
}
```

#### Not Found Reference Keys

If you marked any field as a reference to another collection and you inserted a not found reference it will throw:

```JavaScript
try {
    // insert not found reference
} catch(e) {
    console.log(e);

    // {
    //     message: 'Not found reference keys',
    //     missedReferenceKeys: ['user'],
    //     errorMessages: ['The user is not found']
    // }
}
```

### deleteOne(filter: any | id: string)

Deletes the first document that matches the filter. Use a field that is part of a unique index such as id for precise deletions.

**We just call the mongoDB deleteOne, in the future we will support sql DBs onDelete...**

**Returns a document containing:**

- A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled.
- deletedCount containing the number of deleted documents

### deleteMany(filter: any | ids: string[])

Deletes documents one at a time. If the primary node fails during a deleteMany() operation, documents that were not yet deleted from secondary nodes are not deleted from the collection.

**We just call the mongoDB deleteMany, in the future we will support sql DBs onDelete...**

**Returns a document containing:**

- A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled.
- deletedCount containing the number of deleted documents

### getCollection()

If you want to make any operation we don't support until now you can get the MongoDB collection and run the orginal mongo query

```JavaScript
userRepository.getCollection().find({}).limit(10).toArray();
```
