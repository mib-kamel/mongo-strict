import { getConnectionManager, getDB } from '../../src';
import { createTestingModule } from '../utils';
import { repo1Data } from '../data/repo1.data';
import {
    toBeSameSecondAs
} from 'jest-date/dist/matchers';

expect.extend({ toBeSameSecondAs });

describe('AppController', () => {
    let repo;
    let repo5;

    beforeAll(async () => {
        const testingMdolule = await createTestingModule();
        repo = testingMdolule.repo1;
        repo5 = testingMdolule.repo5;
    });

    describe('root', () => {
        it('should insert valid data', async () => {
            const inseretResponse = await repo.insertOne(repo1Data.validData1);
            expect(inseretResponse.id).toBeDefined();
            expect(inseretResponse.createdAt).toBeDefined();
            expect(inseretResponse.updatedAt).toBeDefined();
        });

        it('should insert created_at', async () => {
            try {
                const inseretResponse = await repo5.insertOne({ name: "test" });
                expect(inseretResponse.id).toBeDefined();
                expect(inseretResponse.created_at).toBeDefined();
                expect(inseretResponse.updated_at).toBeDefined();
                expect(inseretResponse.created_at).toBeSameSecondAs(inseretResponse.updated_at);
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('should refuse invalid email', async () => {
            try {
                await repo.insertOne(repo1Data.invalidEmail);
            } catch (e: any) {
                expect(e.invalidKeys.length).toBe(1);
                expect(e.invalidKeys).toContain("email");
            }
        });

        it('should refuse repeated data with unique keys', async () => {
            try {
                await repo.insertOne(repo1Data.validData1);
            } catch (e: any) {
                expect(e.existingUniqueKeys.length).toBe(3);
                expect(e.existingUniqueKeys).toContain("email");
                expect(e.existingUniqueKeys).toContain("phone");
                expect(e.existingUniqueKeys).toContain("userName");
            }
        });

        it('should refuse with required field not found', async () => {
            try {
                await repo.insertOne(repo1Data.requiredFieldNotFound);
            } catch (e: any) {
                expect(e.notFoundRequiredKeys.length).toBe(1);
                expect(e.notFoundRequiredKeys).toContain("userName");
            }
        });

        it('should inset data with default keys', async () => {
            try {
                await repo.insertOne(repo1Data.validDataWithNoDefaultValues);
                const insertedData = await repo.findOne({ where: { email: repo1Data.validDataWithNoDefaultValues.email } });
                expect(insertedData.id).toBeDefined();
                expect(insertedData.numberKey).toBe(20);
                expect(insertedData.jsonKey).toMatchObject({
                    text: 'I am JSON Key ;)'
                });
            } catch (e: any) {
                expect(e).toBeUndefined();
            }
        });

        it('should insert valid data with repeated key case insensetive', async () => {
            const inseretResponse = await repo.insertOne(repo1Data.validDataWithRepeatedUniqueCaseInsensetive);
            expect(inseretResponse.id).toBeDefined();
        });

        it('should refuse unregistedred key', async () => {
            try {
                const inseretResponse = await repo.insertOne(repo1Data.unRegesteredKey);
                expect(inseretResponse).toBeUndefined();
            } catch (e: any) {
                expect(e.invalidKeys.length).toBe(1);
                expect(e.invalidKeys).toContain("newKey");
            }
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        await connection.close();
    })
});