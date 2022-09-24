import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { getRandomInt } from '../utils';
import { ObjectId } from 'mongodb';

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


        it('Find CV by where string ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cv = await cvRepository.find({ where: cvId });

            expect(cv).toBeDefined();
            expect(cv.length).toBe(1);
            expect(typeof cv[0].id).toBe('string');
        });

        it('Find CVs by IDs Array', async () => {
            const cvsCount = 10;

            const ids = insertedCVs.slice(0, 10).map((cv) => cv.id);
            expect(typeof ids).toBe('object');
            expect(ids.length).toEqual(cvsCount);

            const cvs = await cvRepository.find({ where: ids });
            expect(cvs.length).toEqual(cvsCount);
        });

        it('Find CVs by Object IDs Array', async () => {
            const cvsCount = 10;

            const ids = insertedCVs.slice(0, 10).map((cv) => new ObjectId(cv.id));
            expect(typeof ids).toBe('object');
            expect(ids.length).toEqual(cvsCount);

            const cvs = await cvRepository.find({ where: ids });
            expect(cvs.length).toEqual(cvsCount);
        });

        it('Find sections by CV ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { cv: cvId } });
            expect(sections.length).toEqual(cvSectionsCount);
        });

        it('Find sections by CV Object ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { cv: new ObjectId(cvId) } });
            expect(sections.length).toEqual(cvSectionsCount);
        });

        it('Find sections by CV lookuo ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { 'cv.id': cvId } });
            expect(sections.length).toEqual(cvSectionsCount);
        });

        it('Find sections by CV lookup Object ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { 'cv.id': new ObjectId(cvId) } });
            expect(sections.length).toEqual(cvSectionsCount);
        });

        it('Find section by user id', async () => {
            const userId = insertedUsers[0].id;
            expect(typeof userId).toBe('string');

            const userCVs = insertedCVs.filter(cv => cv.user === userId)
            const userSectionsCount = insertedSections.filter((section) => userCVs.includes(section.cv)).length;
            expect(typeof userSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { 'section.cv.user': userId } });
            expect(sections.length).toEqual(userSectionsCount);
        });

        it('Find section by user id lookup', async () => {
            const userId = insertedUsers[0].id;
            expect(typeof userId).toBe('string');

            const userCVs = insertedCVs.filter(cv => cv.user === userId)
            const userSectionsCount = insertedSections.filter((section) => userCVs.includes(section.cv)).length;
            expect(typeof userSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { 'section.cv.user.id': userId } });
            expect(sections.length).toEqual(userSectionsCount);
        });


        it('Find section by user Object id lookup', async () => {
            const userId = insertedUsers[0].id;
            expect(typeof userId).toBe('string');

            const userCVs = insertedCVs.filter(cv => cv.user === userId)
            const userSectionsCount = insertedSections.filter((section) => userCVs.includes(section.cv)).length;
            expect(typeof userSectionsCount).toBe('number');

            const sections = await sectionRepository.find({ where: { 'section.cv.user.id': new ObjectId(userId) } });
            expect(sections.length).toEqual(userSectionsCount);
        });


        it('Find user by section id', async () => {
            const section = insertedSections[0];
            const sectionId = section.id;
            expect(typeof section).toBe('object');

            const cv = insertedCVs.find(cv => cv.id === section.cv)
            expect(cv).toBeDefined();

            const targetUser = insertedUsers.find((user) => user.id === cv.user)
            expect(targetUser).toBeDefined();

            const user = await userRepository.findOne({ where: { 'cv.sections.id': sectionId }});
            expect(targetUser.id).toEqual(user.id);
        });

        it('FindOne undefined', async () => {
            const cv = await userRepository.findOne({ where: { 'email': 122121212121 }});
            expect(cv).toBeUndefined();
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});