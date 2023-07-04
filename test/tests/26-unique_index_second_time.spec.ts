import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { getRandomInt } from '../utils';
import { User3Repository } from '../data/user-auto-create-unique-index.repository';

describe('AppController', () => {
    let user3Repository;
    let userRepository;
    let user1Data = {
        email: `email2020@co.co`,
        name: `mongo user`,
        country: `mongolia`
    }

    let user2Data = {
        email: `email2021@co.co`,
        name: `mongo user`,
        country: `mongolia`
    }

    beforeAll(async () => {
        await createConnection({
            uri: `mongodb://127.0.0.1:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        user3Repository = new User3Repository();
        await user3Repository.insertOne(user1Data);

        const count = await user3Repository.count();
        expect(count).toBe(1);

        // Should be called after initializing all the repositories

        await user3Repository.listIndexes();
        let uIndexes = await user3Repository.listIndexes();
        expect(uIndexes?.length).toBe(1);

        await user3Repository.getCollection().createIndex({ email: 1 }, { unique: true, name: 'email_unique_index_mongostrict', collation: { locale: 'en', strength: 3 } });
        uIndexes = await user3Repository.listIndexes();
        expect(uIndexes?.length).toBe(2);

        await initDBMap();

        uIndexes = await user3Repository.listIndexes();
        expect(uIndexes?.length).toBe(2);
    });

    it('Should not insert the same user twice', async () => {
        try {
            const u1 = await user3Repository.insertOne(user1Data);
            expect(u1).toBeUndefined();
        } catch (e) {
            expect(e?.message).toBe("Existing unique keys");
        }
    });

    it('Should insert the same user twice', async () => {
        try {
            const p1 = userRepository.insertOne(user1Data);
            const p2 = userRepository.insertOne(user1Data);

            const [u1, u2] = await Promise.all([p1, p2]);

            expect(u1).toBeDefined();
            expect(u2).toBeDefined();
        } catch (e) {
            expect(e).toBeUndefined();
        }
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