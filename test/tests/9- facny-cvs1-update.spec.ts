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
        createConnection({
            uri: `mongodb://localhost:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        cvRepository = new CVRepository();
        sectionRepository = new SectionRepository();

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


        it('Update CV set One by CV ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const newCVName = "Updated CV Name";
            const updatedCV = await cvRepository.update(cvId).setOne({ cvName: newCVName });

            expect(updatedCV).toBeDefined();
            expect(typeof updatedCV.id).toBe('string');
            expect(updatedCV.cvName).toEqual(newCVName);

            const findUpdatedCV = await cvRepository.findOneById(cvId);
            expect(findUpdatedCV).toBeDefined();
            expect(typeof findUpdatedCV.id).toBe('string');
            expect(findUpdatedCV.cvName).toEqual(newCVName);
        });

        it('Update CVs by IDs Array', async () => {
            const cvsCount = 10;

            const ids = insertedCVs.slice(0, 10).map((cv) => cv.id);
            expect(typeof ids).toBe('object');
            expect(ids.length).toEqual(cvsCount);

            const newCVName = "Updated CVs Names #20888";
            const res = await cvRepository.update(ids).setMany({ cvName: newCVName });
            expect(res.matchedCount).toEqual(cvsCount);
            expect(res.modifiedCount).toEqual(cvsCount);

            const updatedCVsCount = await cvRepository.count({ where: { cvName: newCVName } });
            expect(updatedCVsCount).toEqual(cvsCount);
        });

        it('Update sections by CV ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const newSectionTitle = 'New section title #123211232318898';
            const res = await sectionRepository.update({ cv: cvId }).setMany({ sectionTitle: newSectionTitle });
            expect(res.matchedCount).toEqual(cvSectionsCount);
            expect(res.modifiedCount).toEqual(cvSectionsCount);

            const updatedSectionsCount = await sectionRepository.count({ where: { sectionTitle: newSectionTitle } });
            expect(updatedSectionsCount).toEqual(cvSectionsCount);
        });

        it('Update sections by CV Object ID', async () => {
            const cvId = insertedCVs[0].id;
            expect(typeof cvId).toBe('string');

            const cvSectionsCount = insertedSections.filter((section) => section.cv === cvId).length;
            expect(typeof cvSectionsCount).toBe('number');

            const newSectionTitle = 'New section title #123211232318898';
            const res = await sectionRepository.update({ cv: new ObjectId(cvId) }).setMany({ sectionTitle: newSectionTitle });
            expect(res.matchedCount).toEqual(cvSectionsCount);
            expect(res.modifiedCount).toEqual(cvSectionsCount);

            const updatedSectionsCount = await sectionRepository.count({ where: { sectionTitle: newSectionTitle } });
            expect(updatedSectionsCount).toEqual(cvSectionsCount);
        });

        it('Refuse setMany with unique Key', async () => {
            const userCount = 10;

            const ids = insertedUsers.slice(0, 10).map((user) => user.id);
            expect(typeof ids).toBe('object');
            expect(ids.length).toEqual(userCount);

            try {
                const newEmail = "nonUniqueEmail@g.co";
                const res = await userRepository.update(ids).setMany({ email: newEmail });
                expect(res).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.existingUniqueKeys.length).toEqual(1)
            }
        });

        it('Move CV sections to another CV', async () => {
            const fromCVId = insertedCVs[0].id;
            const toCvId = insertedCVs[1].id;

            expect(typeof fromCVId).toBe('string');
            expect(typeof toCvId).toBe('string');

            const fromCVSectionsCount = insertedSections.filter((section) => section.cv === fromCVId).length;
            const toCVSectionsCount = insertedSections.filter((section) => section.cv === toCvId).length;
            expect(typeof fromCVSectionsCount).toBe('number');
            expect(typeof toCVSectionsCount).toBe('number');

            const res = await sectionRepository.update({ cv: fromCVId }).setMany({ cv: toCvId });
            expect(res.matchedCount).toEqual(fromCVSectionsCount);
            expect(res.modifiedCount).toEqual(fromCVSectionsCount);

            const newFromCVSectionsCount = await sectionRepository.count({ where: { cv: fromCVId } });
            expect(newFromCVSectionsCount).toEqual(0);

            const newToCVSectionsCount = await sectionRepository.count({ where: { cv: toCvId } });
            expect(newToCVSectionsCount).toEqual(fromCVSectionsCount + toCVSectionsCount);

            insertedSections = await sectionRepository.find({});
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});