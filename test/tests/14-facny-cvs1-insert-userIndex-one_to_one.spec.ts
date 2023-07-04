import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { UserIndexRepository } from '../data/facny-cvs1/userIndex.repository';

describe('AppController', () => {
    let userRepository;
    let insertedUsers: any[] = [];
    let userIndexRepository;
    let insertedUserIndeces: any[] = [];

    const USERS_COUNT = 50;
    const CVS_COUNT = 70;
    const SECTIONS_COUNT = 300;

    beforeAll(async () => {
        await createConnection({
            uri: `mongodb://127.0.0.1:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        userIndexRepository = new UserIndexRepository();

        // Should be called after initializing all the repositories
        await initDBMap();
    });

    describe('root', () => {
        it('Should insert users', async () => {
            try {
                for (let i = 0; i < USERS_COUNT; i++) {
                    const insertedUser = await userRepository.insertOne({
                        email: `email${i}@co.co`,
                        name: `mongo user ${i}`,
                        country: `mongolia ${i}`
                    });

                    insertedUsers.push(insertedUser);
                }
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedUsers.length).toEqual(USERS_COUNT);
        });


        it('Insert userIndex', async () => {
            const user = insertedUsers[0];

            try {
                const res = await userIndexRepository.insertOne({
                    user: user.id
                });
                expect(res).toBeDefined();
                expect(typeof res.id).toBe('string');
                expect(res.createdAt).toBeDefined();
                expect(typeof res.user).toBe('string');

                insertedUserIndeces.push(res);
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });


        it('Get User Data', async () => {
            const userIndex = insertedUserIndeces[0];

            try {
                const res = await userIndexRepository.findOne({ where: userIndex.id });
                expect(res).toBeDefined();
                expect(typeof res.id).toBe('string');
                expect(typeof res.user.id).toBe('string');
                expect(typeof res.user.name).toBe('string');
                expect(res.user.id).toEqual(insertedUsers[0].id);
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Refuse duplicated user insert', async () => {
            const user = insertedUsers[0];

            try {
                const res = await userIndexRepository.insertOne({
                    user: user.id
                });
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.existingUniqueKeys).toContain('user');
            }
        });

        it('update same user index with same user', async () => {
            const userIndexId = insertedUserIndeces[0].id;
            const user = insertedUsers[0];

            try {
                const res = await userIndexRepository.update(userIndexId).replaceOne({
                    user: user.id
                });
                expect(res).toBeDefined();
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Insert userIndex 2', async () => {
            const user = insertedUsers[1];

            try {
                const res = await userIndexRepository.insertOne({
                    user: user.id
                });
                expect(res).toBeDefined();
                expect(typeof res.id).toBe('string');
                expect(res.createdAt).toBeDefined();
                expect(typeof res.user).toBe('string');

                insertedUserIndeces.push(res);
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Refuse duplicated user update', async () => {
            const userIndexId = insertedUserIndeces[1].id;
            const user = insertedUsers[0];

            try {
                const res = await userIndexRepository.update(userIndexId).replaceOne({
                    user: user.id
                });
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.existingUniqueKeys).toContain('user');
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