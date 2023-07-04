import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { getRandomInt } from '../utils';

describe('AppController', () => {
    let userRepository;

    beforeAll(async () => {
        await createConnection({
            uri: `mongodb://127.0.0.1:27017/fancy-cvs`
        });

        userRepository = new UserRepository();

        // Should be called after initializing all the repositories
        await initDBMap();
    });

    describe('root', () => {
        it('Should insert users', async () => {
            try {
                const email = `email@co.co`;
                const name = `mongo user`;
                const country = `mongolia`;

                const p1 = userRepository.insertOne({ email, name, country });
                const p2 = userRepository.insertOne({ email, name, country });

                const [u1, u2] = await Promise.all([p1, p2]);

                expect(u1).toBeDefined();
                expect(u2).toBeDefined();
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });
    });

    it('Should Check the no created indexes', async () => {
        try {
            const u1Indexes = await userRepository.listIndexes();
            expect(u1Indexes?.length).toBe(1);
        }
        catch (e) {
            expect(e).toBeUndefined();
        }
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});