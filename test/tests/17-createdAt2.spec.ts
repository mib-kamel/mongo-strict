import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { CR1Repository, CR2Repository, CR3Repository, CR4Repository, CR5Repository } from '../_database/Repositories/createdAtRepositories';

const CREATED_AT_KEY = 'created_at_key';
const UPDATED_AT_KEY = 'updated_at_key';

describe('AppController', () => {
    let cr1epository;
    let cr2epository;
    let cr3epository;
    let cr4epository;
    let cr5epository;

    beforeAll(async () => {
        try {
            await createConnection({
                uri: `mongodb://localhost:27017/cr`
            }, {
                autoCreatedAt: false,
                autoUpdatedAt: false,
                createdAtKey: CREATED_AT_KEY,
                updatedAtKey: UPDATED_AT_KEY
            });

            cr1epository = new CR1Repository();
            cr2epository = new CR2Repository();
            cr3epository = new CR3Repository();
            cr4epository = new CR4Repository();
            cr5epository = new CR5Repository();

            // Should be called after initializing all the repositories
            initDBMap();

        } catch (e: any) {
            expect(e).toBeUndefined();
        }
    });

    describe('root', () => {
        it('Should get createdAt', async () => {
            const res = await cr1epository.insertOne({ name: 'name' });
            expect(res).toBeDefined();
            expect(res.createdAt).toBeUndefined();
            expect(res.updatedAt).toBeUndefined();
            expect(res[CREATED_AT_KEY]).toBeUndefined();
            expect(res[UPDATED_AT_KEY]).toBeUndefined();
        });
    });

    describe('root', () => {
        it('Should get createdAt 2', async () => {
            const res = await cr2epository.insertOne({ name: 'name' });
            expect(res).toBeDefined();
            expect(res.createdAt).toBeUndefined();
            expect(res.updatedAt).toBeUndefined();
            expect(res[CREATED_AT_KEY]).toBeDefined();
            expect(res[UPDATED_AT_KEY]).toBeDefined();
        });
    });

    describe('root', () => {
        it('Should not get createdt', async () => {
            const res = await cr3epository.insertOne({ name: 'name' });
            expect(res).toBeDefined();
            expect(res.createdAt).toBeUndefined();
            expect(res.updatedAt).toBeUndefined();
            expect(res[CREATED_AT_KEY]).toBeUndefined();
            expect(res[UPDATED_AT_KEY]).toBeUndefined();
        });
    });

    describe('root', () => {
        it('Should get created_at', async () => {
            const res = await cr4epository.insertOne({ name: 'name' });
            expect(res).toBeDefined();
            expect(res.createdAt).toBeUndefined();
            expect(res.updatedAt).toBeUndefined();
            expect(res[CREATED_AT_KEY]).toBeUndefined();
            expect(res[UPDATED_AT_KEY]).toBeUndefined();
            expect(res.created_at).toBeUndefined();
            expect(res.updated_at).toBeUndefined();
        });
    });

    describe('root', () => {
        it('Should get created_at 2', async () => {
            const res = await cr5epository.insertOne({ name: 'name' });
            expect(res).toBeDefined();
            expect(res.createdAt).toBeUndefined();
            expect(res.updatedAt).toBeUndefined();
            expect(res[CREATED_AT_KEY]).toBeUndefined();
            expect(res[UPDATED_AT_KEY]).toBeUndefined();
            expect(res.created_at).toBeUndefined();
            expect(res.updated_at).toBeUndefined();
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});