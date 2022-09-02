import { getConnectionManager, getDB } from '../../src';
import { createTestingModule } from '../utils';

const NEW_RECORDS_COUNT1 = 20;
const newNumberKey = 399;

describe('AppController', () => {
    let repo1;
    let repo3;
    let records1 = [];

    beforeAll(async () => {
        const testingMdolule = await createTestingModule();
        repo1 = testingMdolule.repo1;
        repo3 = testingMdolule.repo3;

        try {
            for (let i = 0; i < NEW_RECORDS_COUNT1; i++) {
                const rec: any = await repo1.insertOne({
                    email: `mib2.kame${i}@gmail.com`,
                    phone: `010253565${i}5`,
                    numberKey: newNumberKey,
                    booleanKey: false,
                    jsonKey: { key: `value${i}` },
                    userName: `MO2${i}`,
                    notRequiredUnique: `Not Required 2 but unique ${i}`
                });
                records1.push(rec);
            }

        } catch (e: any) {
            console.log(e);
            expect(e).toBeUndefined();
        }
    });

    describe('root', () => {
        it('New records should be inserted', async () => {
            const insetedRecordsCount1 = await repo1.count();
            expect(insetedRecordsCount1).toBe(NEW_RECORDS_COUNT1);
            expect(insetedRecordsCount1).toBe(records1.length);
        });

        it('Should insert record with refs', async () => {
            try {
                const rec = await repo3.insertOne({
                    repo1: records1[0].id,
                    repo1Email: records1[0].email
                });

                expect(rec).toBeDefined();

                const byFind = await repo3.queryBuilder().select({ 'repo1.id': 1, 'repo1Email.id': 1 }).findOne();
                expect(byFind).toBeDefined();
                expect(byFind.repo1?.id).toBeDefined();
                expect(byFind.repo1.id).toEqual(byFind.repo1Email.id);
            } catch (e: any) {
                console.log(e)
                expect(e).toBeUndefined();
            }
        });

        it('Should insert record with id ref', async () => {
            try {
                const rec = await repo3.insertOne({
                    repo1: records1[0].id
                });

                expect(rec).toBeDefined();
                expect(rec.repo1).toEqual(records1[0].id);

                const byFind = await repo3.queryBuilder().select({ 'repo1.id': 1 }).findOne();
                expect(byFind).toBeDefined();
                expect(byFind.repo1?.id).toBeDefined();
                expect(byFind.repo1.id).toEqual(records1[0].id);
            } catch (e: any) {
                console.log(e)
                expect(e).toBeUndefined();
            }
        });

        it('Should insert record with email ref', async () => {
            try {
                const rec = await repo3.insertOne({
                    repo1Email: records1[0].email
                });

                expect(rec).toBeDefined();
                expect(rec.repo1Email).toEqual(records1[0].email);
            } catch (e: any) {
                console.log(e)
                expect(e).toBeUndefined();
            }
        });

        it('Should NOT insert record with invalid ref number', async () => {
            try {
                const rec = await repo3.insertOne({
                    repo1: "6150ed60e03c2000123629cb"
                });

                expect(rec).toBeUndefined();
            } catch (e: any) {
                expect(e).toBeDefined();
                expect(e.missedReferenceKeys).toContain("repo1");
                expect(e.missedReferenceKeys.length).toBe(1);
            }
        });

        it('Should NOT insert record with invalid ref number 2', async () => {
            try {
                const rec = await repo3.insertOne({
                    repo1Email: "wrong@mail.co"
                });

                expect(rec).toBeUndefined();
            } catch (e: any) {
                expect(e).toBeDefined();
                expect(e.missedReferenceKeys).toContain("repo1Email")
            }
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});