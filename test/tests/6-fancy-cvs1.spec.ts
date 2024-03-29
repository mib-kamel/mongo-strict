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
            uri: `mongodb://127.0.0.1:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        cvRepository = new CVRepository();
        sectionRepository = new SectionRepository();

        // Should be called after initializing all the repositories
        await initDBMap();
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
            expect(typeof insertedCV.id).toBe("string");
            expect(typeof insertedCV.user).toBe("string");
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
            expect(typeof insertedSections[0].cv).toBe("string");
            expect(typeof insertedSections[0].id).toBe("string");
            expect(insertedSections?.length).toBe(6);
        });

        it('Should not insert data because of invalid ref objectId', async () => {
            try {
                await sectionRepository.insertOne({
                    cv: '12222',
                    sectionTitle: 'A new section'
                });
            } catch (e) {
                expect(e).toBeDefined()
            }
        });

        it('Should get user inserted data', async () => {
            let userData;
            try {
                userData = await userRepository.findOne({
                    select: ["id", "name", "cvs.cvName", "cvs.currentPosition", "cvs.sections.sectionTitle"]
                })
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(userData).toBeDefined();
            expect(userData?.id).toBeDefined();
            expect(userData?.name).toBeDefined();
            expect(userData?.cvs).toBeDefined();
            expect(userData?.cvs?.length).toEqual(1);
            expect(userData?.cvs[0]).toBeDefined();
            expect(typeof userData?.cvs[0].id).toBe('string');
            expect(userData?.cvs[0]?.cvName).toBeDefined();
            expect(userData?.cvs[0]?.currentPosition).toBeDefined();
            expect(userData?.cvs[0]?.sections?.length).toEqual(6);
            expect(userData?.cvs[0]?.sections[0]?.sectionTitle).toBeDefined();
        });

        it('Should get cv user as a string', async () => {
            const cv = await cvRepository.findOne({ select: ['user'] });

            expect(cv).toBeDefined();
            expect(cv?.user).toBeDefined();
            expect(typeof cv?.user).toEqual("string");
        });

        it('Should get cv user as a string 2', async () => {
            const cv = await cvRepository.findOne({ select: ['user.id'] });

            expect(cv).toBeDefined();
            expect(cv?.user?.id).toBeDefined();
            expect(typeof cv?.user?.id).toEqual("string");
        });

        it('Should get cv user as a string', async () => {
            const section = await sectionRepository.findOne({ select: ['cv.user'] });
            expect(typeof section?.cv?.user).toEqual("string");
        });

        it('Should get cv user as a string 2', async () => {
            const section = await sectionRepository.findOne({ select: ['cv.user.id'] });
            expect(typeof section?.cv.user.id).toEqual("string");
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});