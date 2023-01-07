import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { getRandomInt } from '../utils';
import { User2Repository } from '../data/user-no-igenore-case.repository';

describe('AppController', () => {
    let userRepository, user2Repository;
    let insertedUsers: any[] = [];

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
        createConnection({
            uri: `mongodb://localhost:27017/fancy-cvs`
        }, {
            isAutoCreateUniqueIndex: true
        });

        userRepository = new UserRepository();
        user2Repository = new User2Repository();

        // Should be called after initializing all the repositories
        await initDBMap();
    });

    describe('root', () => {
        it('Should Check the created indexes', async () => {
            try {
                const u1Indexes = await userRepository.listIndexes();
                const u2Indexes = await user2Repository.listIndexes();

                expect(u1Indexes?.length).toBe(2);
                expect(u2Indexes?.length).toBe(2);

                expect(u1Indexes[1].collation.strength).toBe(1);
                expect(u2Indexes[1].collation.strength).toBe(3);
            }
            catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Should not insert the same user twice', async () => {
            try {
                const p1 = userRepository.insertOne(user1Data);
                const p2 = userRepository.insertOne(user1Data);

                const [u1, u2] = await Promise.all([p1, p2]);

                expect(u1).toBeDefined();
                expect(u2).toBeUndefined();
            } catch (e) {
                const count = await userRepository.count();
                expect(count).toBe(1);
                expect(e?.message).toBe("Existing unique keys");
            }
        });

        it('Should update the user with the same data', async () => {
            try {
                const user = await userRepository.findOne({});
                expect(user?.id).toBeDefined();
                const p2 = await userRepository.update(user.id).replaceOne(user);
            } catch (e) {
                console.log(e)
                expect(e).toBeUndefined();
            }
        });

        it('Should create another user', async () => {
            try {
                const p1 = await userRepository.insertOne(user2Data);
                expect(p1?.id).toBeDefined();
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Should not update user with repeated email', async () => {
            try {
                const [u1, u2] = await userRepository.find();
                expect(u1.id).toBeDefined();
                expect(u2.id).toBeDefined();

                await userRepository.update(u1.id).setOne({ email: u2.email });
            } catch (e) {
                expect(e?.message).toBe("Existing unique keys");
            }
        });

        it('Should not insert users with different case', async () => {
            try {
                const name = `mongo user`;
                const country = `mongolia`;

                const p1 = userRepository.insertOne({ email: `email1@co.co`, name, country });
                const p2 = userRepository.insertOne({ email: `Email1@co.co`, name, country });

                const [u1, _] = await Promise.all([p1, p2]);

                expect(u1).toBeUndefined();
            } catch (e) {
                expect(e?.message).toBe("Existing unique keys");
            }
        });

        it('Should insert users with different case', async () => {
            const name = `mongo user`;
            const country = `mongolia`;

            const p1 = user2Repository.insertOne({ email: `email2@co.co`, name, country });
            const p2 = user2Repository.insertOne({ email: `Email2@co.co`, name, country });

            const [u1, u2] = await Promise.all([p1, p2]);

            expect(u1).toBeDefined();
            expect(u2).toBeDefined();
        });

        it('Should not insert users Arabic', async () => {
            try {
                const email = `محمد@co.co`;
                const name = `mongo user`;
                const country = `mongolia`;

                const p1 = userRepository.insertOne({ email, name, country });
                const p2 = userRepository.insertOne({ email, name, country });

                const [u1, u2] = await Promise.all([p1, p2]);

                expect(u1).toBeDefined();
                expect(u2).toBeUndefined();
            } catch (e) {
                expect(e?.message).toBe("Existing unique keys");
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