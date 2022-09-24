import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { UserRepository } from '../data/facny-cvs1/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { UserIndexRepository } from '../data/facny-cvs1/userIndex.repository';

describe('AppController', () => {
    let userRepository;
    let cvRepository;
    let sectionRepository;
    let userIndexRepository;
    let insertedUser;
    let insertedCV;
    let insertedSections: any[] = [];

    beforeAll(async () => {
        await createConnection({
            uri: `mongodb://localhost:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        cvRepository = new CVRepository();
        sectionRepository = new SectionRepository();
        userIndexRepository = new UserIndexRepository();

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

        it('Should validate insert false 1', async () => {
            try {
                const isValid = await userRepository.validateInsertData({ email: 'email@mail.coms' });
                expect(isValid).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.notFoundRequiredKeys).toBeDefined();
                expect(e.notFoundRequiredKeys).toContain('name');
            }
        });

        it('Should validate insert false 2', async () => {
            try {
                const isValid = await userRepository.validateInsertData({ email: 'invalid email', name: "name" });
                expect(isValid).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.invalidKeys).toBeDefined();
                expect(e.invalidKeys).toContain('email');
            }
        });

        it('Should validate insert false 3', async () => {
            try {
                const isValid = await userRepository.validateInsertData({
                    email: 'email@co.co',
                    name: 'mongo user',
                    country: 'mongolia'
                });
                expect(isValid).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
                expect(e.existingUniqueKeys).toBeDefined();
                expect(e.existingUniqueKeys).toContain('email');
            }
        });

        it('Should validate insert false 4', async () => {
            try {
                const isValid = await cvRepository.validateInsertData({
                    user: '212121',
                    cvName: 'cvName',
                    currentPosition: 'currentPosition'
                });
                expect(isValid).toBeUndefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Should validate insert true 1', async () => {
            try {
                const data = {
                    user: insertedUser.id
                };
                const isValid = await userIndexRepository.validateInsertData(data);
                expect(isValid).toBe(true);

                const inserData = await userIndexRepository.insertOne(data);
                expect(inserData.id).toBeDefined();
            } catch (e) {
                expect(e).toBeUndefined();
            }
        });

        it('Should validate insert false 5', async () => {
            try {
                const isValid = await userIndexRepository.validateInsertData({
                    user: insertedUser.id
                });
                expect(isValid).toBeUndefined();
            } catch (e) {
                console.log(e)
                expect(e).toBeDefined();
                expect(e.existingUniqueKeys).toBeDefined();
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