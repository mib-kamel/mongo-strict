import { CVRepository } from '../data/facny-cvs2/cv.repository';
import { SectionRepository } from '../data/facny-cvs2/section.repository';
import { UserRepository } from '../data/facny-cvs2/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';

describe('AppController', () => {
    let userRepository;
    let cvRepository;
    let sectionRepository;
    let insertedUser;
    let insertedCV;

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
                    country: 'mongolia',
                    cvs: []
                });
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedUser).toBeDefined();
            expect(insertedUser.id).toBeDefined();
            expect(insertedUser.email).toBeDefined();
            expect(insertedUser.name).toBeDefined();
            expect(insertedUser.country).toBeDefined();
            expect(insertedUser.cvs?.length).toBe(0);
        });

        it('Should insert CV', async () => {
            try {
                insertedCV = await cvRepository.insertOne({
                    cvName: 'User CV 1',
                    currentPosition: 'Developer !',
                    sections: []
                });
                insertedUser = await userRepository.update(insertedUser.id).setOne({ cvs: [insertedCV.id] });
            } catch (e) {
                expect(e).toBeUndefined();
            }


            expect(insertedCV).toBeDefined();
            expect(insertedCV?.id).toBeDefined();
            expect(insertedCV?.cvName).toBeDefined();
            expect(insertedCV?.currentPosition).toBeDefined();
            expect(insertedCV?.sections?.length).toBe(0);

            expect(insertedUser).toBeDefined();
            expect(insertedUser?.id).toBeDefined();
            expect(insertedUser?.email).toBeDefined();
            expect(insertedUser?.name).toBeDefined();
            expect(insertedUser?.country).toBeDefined();
            expect(insertedUser?.cvs?.length).toBe(1);
        });

        it('Should insert Sections', async () => {
            const insertedSections: any = [];
            try {
                for (let i = 0; i < 6; i++) {
                    try {
                        const insertedSection = await sectionRepository.insertOne({
                            sectionTitle: `Section ${i + 1}`
                        });
                        insertedSections.push(insertedSection);
                    } catch (e) { }
                }

                insertedCV = await cvRepository.update(insertedCV.id).setOne({ sections: insertedSections.map((section) => section.id) });
            } catch (e) {
                expect(e).toBeUndefined();
            }

            expect(insertedCV).toBeDefined();
            expect(insertedCV?.sections?.length).toBe(6);
            expect(insertedSections?.length).toBe(6);
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
            expect(userData?.cvs[0]?.cvName).toBeDefined();
            expect(userData?.cvs[0]?.currentPosition).toBeDefined();
            expect(userData?.cvs[0]?.sections?.length).toEqual(6);
            expect(userData?.cvs[0]?.sections[0]?.sectionTitle).toBeDefined();
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});