import { getConnectionManager, getDB } from '../../src';
import { createTestingModule } from '../utils';

const NEW_RECORDS_COUNT = 20;
const numberKey = 365;

describe('AppController', () => {
    let repo;
    let records = []

    beforeAll(async () => {
        const testingMdolule = await createTestingModule();
        repo = testingMdolule.repo1;

        try {
            for (let i = 0; i < NEW_RECORDS_COUNT; i++) {
                const rec = await repo.insertOne({
                    email: `mib1.kame${i}@gmail.com`,
                    phone: `011153565${i}5`,
                    numberKey,
                    booleanKey: false,
                    jsonKey: { key: `value${i}` },
                    userName: `MO1${i}`,
                    notRequiredUnique: `Not Required 1 but unique ${i}`
                });
                records.push(rec);
            }
        } catch (e: any) {
            console.log(e);
            expect(e).toBeUndefined();
        }
    });

    describe('root', () => {
        it(NEW_RECORDS_COUNT + ' records should be inserted', async () => {
            const insetedRecordsCount = await repo.count();
            expect(insetedRecordsCount).toBe(NEW_RECORDS_COUNT);
            expect(insetedRecordsCount).toBe(records.length);
        });

        it('records array length should be' + NEW_RECORDS_COUNT, async () => {
            const newRecords = await repo.queryBuilder().find();
            expect(newRecords).toBeDefined();
            expect(newRecords.length).toBe(records.length);
        });

        it('Selects only the selected fields', async () => {
            const findRecords = await repo
                .queryBuilder()
                .select({
                    email: 1,
                    numberKey: 1,
                    booleanKey: 1,
                }).find();

            const recordsLength = records.length;
            expect(findRecords.length).toBe(recordsLength);
            expect(findRecords[recordsLength - 1].email).toBeDefined();
            expect(findRecords[recordsLength - 1].numberKey).toBeDefined();
            expect(findRecords[recordsLength - 1].booleanKey).toBeDefined();
            expect(findRecords[recordsLength - 1].notRequiredUnique).toBeUndefined();
        });

        it('Selects only on field', async () => {
            const findRecord = await repo.queryBuilder().select({
                email: 1,
                numberKey: 1,
                booleanKey: 1,
            }).findOne();

            expect(findRecord.numberKey).toBe(numberKey);
        });

        it('Selects only 2 records', async () => {
            const findRecords = await repo.queryBuilder()
                .where({ numberKey })
                .limit(2)
                .select(["email", "numberKey", "booleanKey"])
                .find();

            expect(findRecords.length).toBe(2);
            expect(findRecords[0].email).toBeDefined();
            expect(findRecords[0].notRequiredUnique).toBeUndefined();
        });


        it('Should cache and get Data', async () => {
            const findRecords = await repo.queryBuilder().cache(true).limit(1).find();
            expect(findRecords.length).toBe(1);
        });

        it('Should get cached Data', async () => {
            const findRecords = await repo.queryBuilder().cache(true).limit(1).find();
            expect(findRecords.length).toBe(1);
        });

        it('Should cache and get Data with timeout', async () => {
            const findRecords = await repo.queryBuilder().cache({ timeout: 3000 }).limit(1).find();
            expect(findRecords.length).toBe(1);
        });

        it('Should get cached Data with timeout', async () => {
            const findRecords = await repo.queryBuilder().cache({ timeout: 3000 }).limit(1).find();
            expect(findRecords.length).toBe(1);
        });

        it('Should cache and get Count', async () => {
            const count = await repo.queryBuilder().cache(true).count();
            expect(count).toBe(records.length);
        });

        it('Should get cached Data', async () => {
            const count = await repo.queryBuilder().cache(true).count();
            expect(count).toBe(records.length);
        });

        it('Should cache and get Data with timeout', async () => {
            const count = await repo.queryBuilder().cache({ timeout: 3000 }).count();
            expect(count).toBe(records.length);
        });

        it('Should get cached Data with timeout', async () => {
            const count = await repo.queryBuilder().cache({ timeout: 3000 }).count();
            expect(count).toBe(records.length);
        });

    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});