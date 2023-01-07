import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { CR1Repository, CR2Repository, CR3Repository } from '../_database/Repositories/createdAtRepositories';

describe('AppController', () => {
    let cr1epository;
    let cr2epository;
    let cr3epository;

    beforeAll(async () => {
        try {
            createConnection({
                uri: `mongodb://localhost:27017/cr`
            }, {
                debug: true
            });

            cr1epository = new CR1Repository();
            cr2epository = new CR2Repository();
            cr3epository = new CR3Repository();

            // Should be called after initializing all the repositories
            await initDBMap();

        } catch (e: any) {
            expect(e).toBeUndefined();
        }
    });

    describe('root', () => {
        it('Should debug', async () => {
            const log = console.log;
            console.log = jest.fn();
            await cr1epository.find();
            expect(console.log).toBeCalled();
            console.log = log;
        });

        it('Should debug 2', async () => {
            const log = console.log;
            console.log = jest.fn();
            await cr1epository.queryBuilder().debug(true).find();
            expect(console.log).toBeCalled();
            console.log = log;
        });

        it('Should debug 3', async () => {
            const log = console.log;
            console.log = jest.fn();
            await cr3epository.queryBuilder().debug(true).find();
            expect(console.log).toBeCalled();
            console.log = log;
        });

        it('Should debug 4', async () => {
            const log = console.log;
            console.log = jest.fn();
            await cr3epository.queryBuilder().debug().find();
            expect(console.log).toBeCalled();
            console.log = log;
        });

        it('Should not debug', async () => {
            const log = console.log;
            console.log = jest.fn();
            const res = await cr3epository.find();
            expect(console.log).not.toBeCalled();
            console.log = log;
        });

        it('Should not debug2', async () => {
            const log = console.log;
            console.log = jest.fn();
            await cr1epository.queryBuilder().debug(false).find();
            expect(console.log).not.toBeCalled();
            console.log = log;
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});