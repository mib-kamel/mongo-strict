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

    let USERS_COUNT = 50;
    let CVS_COUNT = 70;
    let SECTIONS_COUNT = 300;

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


        it('Delete One CV by CV ID', async () => {
            const sectionId = insertedSections[0].id;
            expect(typeof sectionId).toBe('string');

            const res = await sectionRepository.deleteOne(sectionId);

            expect(res).toBeDefined();
            expect(res.deletedCount).toEqual(1);

            const allSectionsCount = await sectionRepository.count();
            expect(allSectionsCount).toEqual(SECTIONS_COUNT - 1);

            insertedSections.splice(0, 1);
            expect(insertedSections.length).toEqual(SECTIONS_COUNT - 1);

            SECTIONS_COUNT = SECTIONS_COUNT - 1;
        });

        it('Delete sections by IDs Array', async () => {
            const sectionsCount = 10;

            const ids = insertedSections.slice(0, 10).map((sec) => sec.id);
            expect(typeof ids).toBe('object');
            expect(ids.length).toEqual(sectionsCount);

            const res = await sectionRepository.deleteMany(ids);
            expect(res).toBeDefined();
            expect(res.deletedCount).toEqual(sectionsCount);

            insertedSections.splice(0, sectionsCount);
            expect(insertedSections.length).toEqual(SECTIONS_COUNT - sectionsCount);

            SECTIONS_COUNT = SECTIONS_COUNT - sectionsCount;
        });

        it('Delete sections by CV ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const res = await sectionRepository.deleteMany({ cv: cvId });
            expect(res).toBeDefined();
            expect(res.deletedCount).toEqual(cvSectionsCount);

            insertedSections.splice(0, cvSectionsCount);
            expect(insertedSections.length).toEqual(SECTIONS_COUNT - cvSectionsCount);

            SECTIONS_COUNT = SECTIONS_COUNT - cvSectionsCount;
        });

        it('Delete sections by CV Object ID', async () => {
            const cvId = insertedCVs[5].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const res = await sectionRepository.deleteMany({ cv: new ObjectId(cvId) });
            expect(res).toBeDefined();
            expect(res.deletedCount).toEqual(cvSectionsCount);

            insertedSections.splice(0, cvSectionsCount);
            expect(insertedSections.length).toEqual(SECTIONS_COUNT - cvSectionsCount);

            SECTIONS_COUNT = SECTIONS_COUNT - cvSectionsCount;
        });

        // it('Refuse setMany with unique Key', async () => {
        //     const userCount = 10;

        //     const ids = insertedUsers.slice(0, 10).map((user) => user.id);
        //     expect(typeof ids).toBe('object');
        //     expect(ids.length).toEqual(userCount);

        //     try {
        //         const newEmail = "nonUniqueEmail@g.co";
        //         const res = await userRepository.update(ids).setMany({ email: newEmail });
        //         expect(res).toBeUndefined();
        //     } catch (e) {
        //         expect(e).toBeDefined();
        //         expect(e.existingUniqueKeys.length).toEqual(1)
        //     }
        // });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});