import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { getRandomInt } from '../utils';

describe('AppController', () => {
    let userRepository;
    let cvRepository;
    let sectionRepository;
    let insertedUsers: any[] = [];
    let insertedCVs: any[] = [];
    let insertedSections: any[] = [];

    const USERS_COUNT = 50;
    const CVS_COUNT = 70;
    const SECTIONS_COUNT = 300;

    beforeAll(async () => {
        await createConnection({
            uri: `mongodb://localhost:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        cvRepository = new CVRepository();
        sectionRepository = new SectionRepository();

        // Should be called after initializing all the repositories
        initDBMap();
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

        it('Should insert CVs', async () => {
            try {
                for (let i = 0; i < CVS_COUNT; i++) {
                    const randomUserIndex = getRandomInt(0, USERS_COUNT - 1);
                    const insertedCV = await cvRepository.insertOne({
                        user: insertedUsers[randomUserIndex].id,
                        cvName: `User CV ${i}`,
                        currentPosition: `Developer ${i}`
                    });
                    insertedCVs.push(insertedCV);
                }
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedCVs.length).toEqual(CVS_COUNT);

        });

        it('Should insert Sections', async () => {
            try {
                for (let i = 0; i < SECTIONS_COUNT; i++) {
                    const randomCVIndex = getRandomInt(0, CVS_COUNT - 1);
                    const insertedSection = await sectionRepository.insertOne({
                        cv: insertedCVs[randomCVIndex].id,
                        sectionTitle: `A new section ${i}`
                    });
                    insertedSections.push(insertedSection);
                }
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedSections?.length).toBe(SECTIONS_COUNT);
        });


        it('Refuse invalid Data', async () => {
            const userId = insertedUsers[0].id;

            const newUserData = {
                email: 'InvalidEmail',
                name: 'Name'
            }

            try {
                const res = await userRepository.update(userId).replaceOne(newUserData);
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.invalidKeys).toContain('email');
            }
        });

        it('Refuse repeated Email', async () => {
            const userId = insertedUsers[0].id;
            const repeatedEmail = insertedUsers[1].email;

            const newUserData = {
                email: repeatedEmail,
                name: 'Name'
            }

            try {
                const res = await userRepository.update(userId).replaceOne(newUserData);
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.existingUniqueKeys).toContain('email');
            }
        });

        it('Replace without optional data', async () => {
            const userId = insertedUsers[0].id;

            const newUserData = {
                email: 'newEmail645646465@g9090.co',
                name: 'Name 212'
            }

            try {
                const res = await userRepository.update(userId).replaceOne(newUserData);
                expect(res).toBeDefined();
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Replace with optional data', async () => {
            const userId = insertedUsers[0].id;

            const newUserData = {
                email: 'newEmail64566336465@g77090.con',
                name: 'Name 21222',
                country: 'Mongo :)'
            }

            try {
                const res = await userRepository.update(userId).replaceOne(newUserData);
                expect(res).toBeDefined();
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Refuse refuse unfound reference', async () => {
            const cv = insertedCVs[0];
            const cvId = cv.id;

            const newCVData = {
                cvName: cv.cvName,
                currentPosition: cv.currentPosition,
                user: '6309c6f839fc4980aeb34677'
            }

            try {
                const res = await cvRepository.update(cvId).replaceOne(newCVData);
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.missedReferenceKeys).toContain('user');
            }
        });

        it('Refuse refuse addional data', async () => {
            const cv = insertedCVs[0];
            const cvId = cv.id;
            const invalidKey = 'invalid';

            const newCVData = {
                cvName: cv.cvName,
                currentPosition: cv.currentPosition,
                user: cv.user,
                [invalidKey]: true
            }

            try {
                const res = await cvRepository.update(cvId).replaceOne(newCVData);
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.invalidKeys).toContain(invalidKey);
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