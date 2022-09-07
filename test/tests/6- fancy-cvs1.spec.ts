import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';

describe('AppController', () => {
    let userRepository;
    let cvRepository;
    let sectionRepository;
    let insertedUser;
    let insertedCV;
    let insertedSections: any[] = [];

    beforeAll(async () => {
        await createConnection({
            url: `mongodb://localhost:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        cvRepository = new CVRepository();
        sectionRepository = new SectionRepository();

        // Should be called after initializing all the repositories
        initDBMap();
    });

    describe('root', () => {
        it('Should insert user', async () => {
            try {
                insertedUser = await userRepository.insertOne({
                    email: 'email@co.co',
                    name: 'mongo user',
                    country: 'mongolia'
                });
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedUser).toBeDefined();
            expect(insertedUser.id).toBeDefined();
            expect(insertedUser.email).toBeDefined();
            expect(insertedUser.name).toBeDefined();
            expect(insertedUser.country).toBeDefined();
        });

        it('Should insert CV', async () => {
            try {
                insertedCV = await cvRepository.insertOne({
                    user: insertedUser.id,
                    cvName: 'User CV 1',
                    currentPosition: 'Developer !'
                });
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedCV).toBeDefined();
            expect(insertedCV.user).toBeDefined();
            expect(insertedCV.cvName).toBeDefined();
            expect(insertedCV.currentPosition).toBeDefined();
        });

        it('Should insert Sections', async () => {
            try {
                for (let i = 0; i < 6; i++) {
                    const insertedSection = await sectionRepository.insertOne({
                        cv: insertedCV.id,
                        sectionTitle: 'A new section'
                    });
                    insertedSections.push(insertedSection);
                }
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedSections?.length).toBeDefined();
            expect(insertedSections?.length).toBe(6);
        });

        it('Should get user inserted data', async () => {
            let userData;
            try {
                userData = await userRepository.findOne({
                    select: ["id", "name", "cv.cvName", "cv.currentPosition", "cv.sections.sectionTitle"]
                })
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(userData).toBeDefined();
            expect(userData?.id).toBeDefined();
            expect(userData?.name).toBeDefined();
            expect(userData?.cv).toBeDefined();
            expect(userData?.cv?.length).toEqual(1);
            expect(userData?.cv[0]).toBeDefined();
            expect(userData?.cv[0]?.cvName).toBeDefined();
            expect(userData?.cv[0]?.currentPosition).toBeDefined();
            expect(userData?.cv[0]?.sections?.length).toEqual(6);
            expect(userData?.cv[0]?.sections[0]?.sectionTitle).toBeDefined();
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});