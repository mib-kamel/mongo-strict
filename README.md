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

Then we need to call this function to initialize the DB Mapping

```
import { initDBMap } from 'mongo-strict';

initDBMap();
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