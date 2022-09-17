import { ObjectId } from 'mongodb';
import { createConnection, initDBMap } from '../src';
import { Test1Repository } from './_database/Repositories/test1.repository';
import { Test2Repository } from './_database/Repositories/test2.repository';
import { Test3Repository } from './_database/Repositories/test3.repository';
import { Test4Repository } from './_database/Repositories/test4.repository';
import { Test5Repository } from './_database/Repositories/test5.repository';

const databaseName = process.env.TEST_DATABASE_NAME || 'relation_ORM_test_DB';
const mongoHostName = process.env.DATABASE_HOST_NAME || 'localhost';

export async function createTestingModule() {
    await createConnection({
        uri: `mongodb://${mongoHostName}:27017/${databaseName}`
    }, { debug: false });

    const repo1 = new Test1Repository();
    const repo2 = new Test2Repository();
    const repo3 = new Test3Repository();
    const repo4 = new Test4Repository();
    const repo5 = new Test5Repository();

    initDBMap();

    return {
        repo1, repo2, repo3, repo4, repo5
    }
}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}