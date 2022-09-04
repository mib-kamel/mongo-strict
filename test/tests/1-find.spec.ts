import { getConnectionManager, getDB } from '../../src';
import { createTestingModule } from '../utils';

const NEW_RECORDS_COUNT = 20;
const numberKey = 365;

describe('AppController', () => {
    let repo;
    let records: any[] = [];
    let cachedFindOptions;
    let cachedFindOptionsTimout;
    let cachedCountOptions;
    let cachedCountOptionsTimout;

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
            cachedFindOptions = { where: { email: records[0].email }, cache: true };
            cachedFindOptionsTimout = { where: { email: records[0].email }, cache: { timeout: 3000 } };

            cachedCountOptions = { cache: true };
            cachedCountOptionsTimout = { cache: { timeout: 3000 } };
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
            const newRecords = await repo.find();
            expect(newRecords).toBeDefined();
            expect(newRecords.length).toBe(records.length);
        });

        it('Find and count', async () => {
            const newRecords = await repo.findAndCount();
            expect(newRecords?.data).toBeDefined();
            expect(newRecords.data.length).toBe(records.length);
            expect(newRecords?.count).toBeDefined();
            expect(newRecords.count).toBe(records.length);
        });

        it('Selects only the selected fields', async () => {
            const findRecords = await repo.find({
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

        it('Selects only the selected fields by array', async () => {
            const findRecords = await repo.find({
                select: ["email", "numberKey", "booleanKey"]
            });

            const recordsLength = records.length;
            expect(findRecords.length).toBe(recordsLength);
            expect(findRecords[recordsLength - 1].email).toBeDefined();
            expect(findRecords[recordsLength - 1].numberKey).toBeDefined();
            expect(findRecords[recordsLength - 1].booleanKey).toBeDefined();
            expect(findRecords[recordsLength - 1].notRequiredUnique).toBeUndefined();
        });

        it('Selects only on field', async () => {
            const findRecord = await repo.findOne({
                select: {
                    email: 1,
                    numberKey: 1,
                    booleanKey: 1,
                }
            });

            expect(findRecord.numberKey).toBe(numberKey);
        });

        it('Selects the first field by id', async () => {
            const findRecord = await repo.findOneById(records[0].id);
            expect(findRecord.numberKey).toBe(numberKey);
        });

        it('Selects condition result', async () => {
            const findRecords = await repo.find({ where: { email: records[0].email } });
            expect(findRecords.length).toBe(1);
        });

        it('Should cache and get Data', async () => {
            const findRecords = await repo.find(cachedFindOptions);
            expect(findRecords.length).toBe(1);
        });

        it('Should get cached Data', async () => {
            const findRecords = await repo.find(cachedFindOptions);
            expect(findRecords.length).toBe(1);
        });

        it('Should cache and get Data with timeout', async () => {
            const findRecords = await repo.find(cachedFindOptionsTimout);
            expect(findRecords.length).toBe(1);
        });

        it('Should get cached Data with timeout', async () => {
            const findRecords = await repo.find(cachedFindOptionsTimout);
            expect(findRecords.length).toBe(1);
        });

        it('Should cache and get Count', async () => {
            const count = await repo.count(cachedCountOptions);
            expect(count).toBe(records.length);
        });

        it('Should get cached Data', async () => {
            const count = await repo.count(cachedCountOptions);
            expect(count).toBe(records.length);
        });

        it('Should cache and get Data with timeout', async () => {
            const count = await repo.count(cachedCountOptionsTimout);
            expect(count).toBe(records.length);
        });

        it('Should get cached Data with timeout', async () => {
            const count = await repo.count(cachedCountOptionsTimout);
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