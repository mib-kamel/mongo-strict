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
                .find({
                    select: {
                        email: 1,
                        numberKey: 1,
                        booleanKey: 1,
                    }
                });

            const recordsLength = records.length;
            expect(findRecords.length).toBe(recordsLength);
            expect(findRecords[recordsLength - 1].email).toBeDefined();
            expect(findRecords[recordsLength - 1].numberKey).toBeDefined();
            expect(findRecords[recordsLength - 1].booleanKey).toBeDefined();
            expect(findRecords[recordsLength - 1].notRequiredUnique).toBeUndefined();
        });

        it('Selects only on field', async () => {
            const findRecord = await repo.queryBuilder().findOne({
                select: {
                    email: 1,
                    numberKey: 1,
                    booleanKey: 1,
                }
            });

            expect(findRecord.numberKey).toBe(numberKey);
        });

        it('Selects only 2 records', async () => {
            const findRecords = await repo.queryBuilder()
                .where({ numberKey })
                .limit(2)
                .find({
                    select: {
                        email: 1,
                        numberKey: 1,
                        booleanKey: 1,
                    }
                });

            expect(findRecords.length).toBe(2);
            expect(findRecords[0].email).toBeDefined();
            expect(findRecords[0].notRequiredUnique).toBeUndefined();
        });


    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});