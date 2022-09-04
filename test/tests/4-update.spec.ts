import { getConnectionManager, getDB } from '../../src';
import { createTestingModule } from '../utils';
import {
    toBeBefore, toBeSameDayAs
} from 'jest-date/dist/matchers';

expect.extend({ toBeBefore, toBeSameDayAs });

const NEW_RECORDS_COUNT = 20;
const NEW_RECORDS_COUNT2 = 4;
const newPhone = '02000033000';
const newPhone2 = '02000033001';
const newPhone3 = '020000113001';
const newNumberKey = 399;
const newNumberKey2 = 401;
const newNumberKey3 = 403;

describe('AppController', () => {
    let repo;
    let repo2;
    let records = []
    let records2 = []

    beforeAll(async () => {
        const testingMdolule = await createTestingModule();
        repo = testingMdolule.repo1;
        repo2 = testingMdolule.repo2;

        try {
            for (let i = 0; i < NEW_RECORDS_COUNT; i++) {
                const rec = await repo.insertOne({
                    email: `mib2.kame${i}@gmail.com`,
                    phone: `010253565${i}5`,
                    numberKey: i,
                    booleanKey: false,
                    jsonKey: { key: `value${i}` },
                    userName: `MO2${i}`,
                    notRequiredUnique: `Not Required 2 but unique ${i}`
                });
                records.push(rec);
            }

            for (let i = 0; i < NEW_RECORDS_COUNT2; i++) {
                const rec = await repo2.insertOne({
                    email: `mib.kame${i}@gmail.com`,
                    phone: `010153565${i}5`,
                    numberKey: i
                });
                records2.push(rec);
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

        it('Should update first record', async () => {
            const id = records[0].id;

            const updatedRec = await repo.update({ id }).setOne({
                phone: newPhone
            });

            expect(updatedRec).toBeDefined();
            expect(updatedRec.phone).toBe(newPhone);
            expect(updatedRec.createdAt).toBeBefore(updatedRec.updatedAt);
            expect(updatedRec.createdAt).toBeSameDayAs(updatedRec.updatedAt);
        });

        it('Should update first record again with the same phone number', async () => {
            const id = records[0].id;

            const updatedRec = await repo.update({ id }).setOne({
                phone: newPhone
            });

            expect(updatedRec).toBeDefined();
            expect(updatedRec.phone).toBe(newPhone);
        });

        it('Should NOT update the second record because the phone is repeated', async () => {
            const id = records[1].id;

            try {
                const res = await repo.update({ id }).setOne({
                    phone: newPhone
                });
                expect(res).toBeUndefined();
            } catch (e: any) {
                expect(e.existingUniqueKeys).toContain("phone")
            }
        });

        it('Should NOT update duplicated unique records', async () => {
            const id = records[0].id;

            try {
                const res = await repo.update({ id }).setMany({
                    phone: newPhone
                });
                expect(res).toBeUndefined();
            } catch (e: any) {
                expect(e.existingUniqueKeys).toContain("phone")
            }
        });

        it('Should update record by id', async () => {
            const id = records[4].id;

            const updatedRec = await repo.update(id).setOne({
                phone: newPhone3
            });

            expect(updatedRec).toBeDefined();
            expect(updatedRec.phone).toBe(newPhone3);
        });

        it('Should set many by array of keys', async () => {
            const ids = records.map(rec => rec.id);

            try {
                await repo.update(ids).setMany({
                    numberKey: newNumberKey
                });

                const newKeyRecordsCount = await repo.count({ numberKey: newNumberKey });
                expect(newKeyRecordsCount).toBe(ids.length);
            } catch (e: any) {
                expect(e.existingUniqueKeys).toContain("phone")
            }
        });

        it('Should set one by array of keys', async () => {
            const ids = records.map(rec => rec.id);

            try {
                await repo.update(ids).setOne({
                    numberKey: newNumberKey2
                });

                const newKeyRecordsCount = await repo.count({ where: { numberKey: newNumberKey2 } });
                expect(newKeyRecordsCount).toBe(1);
            } catch (e: any) {
                expect(e).toBeUndefined()
            }
        });

        it('Should replace one by the same old value', async () => {
            const record = records[7];
            try {
                const newKeyRecordsCountBefore = await repo.count({ where: { numberKey: newNumberKey3 } });
                expect(newKeyRecordsCountBefore).toBe(0);

                await repo.update(record.id).replaceOne({ ...record, numberKey: newNumberKey3 });

                const newKeyRecordsCount = await repo.count({ where: { numberKey: newNumberKey3 } });
                expect(newKeyRecordsCount).toBe(1);
            } catch (e: any) {
                console.log(e)
                expect(e).toBeUndefined()
            }
        });

        // it('Should NOT replace many by the same old value', async () => {
        //     const record = records[7];
        //     try {
        //         const res = await repo.update(record.id).replaceMany({ ...record, numberKey: newNumberKey3 });
        //         expect(res.existingUniqueKeys).toBeDefined();
        //     } catch (e: any) {
        //         expect(e.existingUniqueKeys).toBeDefined()
        //     }
        // });

        // it('Should replace many ', async () => {
        //     const duplicatedRecord = records2[0];
        //     try {
        //         const newKeyRecordsCountBefore = await repo2.count({ where: { numberKey: duplicatedRecord.numberKey } });
        //         expect(newKeyRecordsCountBefore).toBe(1);

        //         await repo2.update({numberKey: duplicatedRecord[0]}).replaceMany(duplicatedRecord);

        //         const newKeyRecordsCount = await repo2.count({ where: { numberKey: duplicatedRecord.numberKey } });
        //         expect(newKeyRecordsCount).toBe(NEW_RECORDS_COUNT2);
        //     } catch (e: any) {
        //         expect(e).toBeUndefined();
        //     }
        // });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});