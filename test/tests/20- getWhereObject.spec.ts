import { UserRepository } from '../data/facny-cvs2/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { CVRepository } from '../data/facny-cvs1/cv.repository';
import { SectionRepository } from '../data/facny-cvs1/section.repository';
import { isObjectID } from '../../src/orm/utils/utils';
import { ObjectId } from 'mongodb';

describe('AppController', () => {
    let userRepository;
    let cvRepository;
    let sectionRepository;
    const validObjectId = "5da8c5f02ca1a60e086ffc80";

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
        it('Get empty where object', async () => {
            const where = userRepository._testOperations().getWhereObject();
            expect(where).toBeDefined();
            expect(Object.keys(where).length).toBe(0);
        });

        it('Get empty where object 2', async () => {
            const where = userRepository._testOperations().getWhereObject({});
            expect(where).toBeDefined();
            expect(Object.keys(where).length).toBe(0);
        });

        it('Get error where object 1', async () => {
            try {
                const where = userRepository._testOperations().getWhereObject(12312321323);
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 2', async () => {
            try {

                const where = cvRepository._testOperations().getWhereObject({
                    $or: [{
                        id: 'asdasd'
                    }]
                });

                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 3', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject([1, 3, "adsadadsds"]);
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 4', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({
                    user: {
                        $in: [12213, "12121221", 123123123]
                    }
                });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 5', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ user: '2121122112' });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 6', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ user: { $eq: '2121122112' } });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 7', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ user: { $in: '2121122112' } });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 7', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ cvName: { $in: '2121122112' } });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 8', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ user: { $and: '2121122112' } });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 9', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ cvName: { $or: '2121122112' } });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 10', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject("12020026");
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get error where object 11', async () => {
            try {
                const where = cvRepository._testOperations().getWhereObject({ $not: "123123123231" });
                expect(where).not.toBeDefined();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        it('Get get a valid where 1', async () => {
            const where = cvRepository._testOperations().getWhereObject(validObjectId);
            expect(where).toBeDefined();
            expect(where._id).toBeDefined();
            expect(isObjectID(where._id)).toBe(true);
        });

        it('Get get a valid where 2', async () => {
            const where = cvRepository._testOperations().getWhereObject(new ObjectId(validObjectId));
            expect(where).toBeDefined();
            expect(where._id).toBeDefined();
            expect(isObjectID(where._id)).toBe(true);
        });

        it('Get get a valid where 3', async () => {
            const where = cvRepository._testOperations().getWhereObject({ id: validObjectId });
            expect(where).toBeDefined();
            expect(where._id).toBeDefined();
            expect(isObjectID(where._id)).toBe(true);
        });

        it('Get get a valid where 4', async () => {
            const where = cvRepository._testOperations().getWhereObject({ id: new ObjectId(validObjectId) });
            expect(where).toBeDefined();
            expect(where._id).toBeDefined();
            expect(isObjectID(where._id)).toBe(true);
        });

        it('Get get a valid where 5', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: validObjectId });
            expect(where).toBeDefined();
            expect(where.user).toBeDefined();
            expect(isObjectID(where.user)).toBe(true);
        });

        it('Get get a valid where 6', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: new ObjectId(validObjectId) });
            expect(where).toBeDefined();
            expect(where.user).toBeDefined();
            expect(isObjectID(where.user)).toBe(true);
        });

        it('Get get a valid where 7', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: { $eq: validObjectId } });
            expect(where?.user?.$eq).toBeDefined();
            expect(isObjectID(where?.user?.$eq)).toBe(true);
        });

        it('Get get a valid where 8', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: { $eq: new ObjectId(validObjectId) } });
            expect(where?.user?.$eq).toBeDefined();
            expect(isObjectID(where?.user?.$eq)).toBe(true);
        });

        it('Get get a valid where 9', async () => {
            const where = cvRepository._testOperations().getWhereObject({ cvName: validObjectId });
            expect(where?.cvName).toBeDefined();
            expect(isObjectID(where?.cvName)).toBe(false);
        });

        it('Get get a valid where 10', async () => {
            const where = cvRepository._testOperations().getWhereObject({ cvName: { $eq: validObjectId } });
            expect(where?.cvName?.$eq).toBeDefined();
            expect(isObjectID(where?.cvName?.$eq)).toBe(false);
        });

        it('Get get a valid where 11', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: { $in: [validObjectId, validObjectId, validObjectId] } });
            expect(where?.user?.$in[1]).toBeDefined();
            expect(isObjectID(where?.user?.$in[1])).toBe(true);
        });

        it('Get get a valid where 12', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: { $in: [new ObjectId(validObjectId), new ObjectId(validObjectId), new ObjectId(validObjectId)] } });
            expect(where?.user?.$in[1]).toBeDefined();
            expect(isObjectID(where?.user?.$in[1])).toBe(true);
        });

        it('Get get a valid where 13', async () => {
            const where = cvRepository._testOperations().getWhereObject({ cvName: { $in: [validObjectId, validObjectId, validObjectId] } });
            expect(where?.cvName?.$in[1]).toBeDefined();
            expect(isObjectID(where?.cvName?.$in[1])).toBe(false);
        });

        it('Get get a valid where 14', async () => {
            const where = cvRepository._testOperations().getWhereObject({ cvName: { $not: { $in: [validObjectId, validObjectId, validObjectId] } } });
            expect(where?.cvName?.$not.$in[1]).toBeDefined();
            expect(isObjectID(where?.cvName?.$not.$in[1])).toBe(false);
        });

        it('Get get a valid where 15', async () => {
            const where = cvRepository._testOperations().getWhereObject({ id: { $not: { $in: [validObjectId, validObjectId, validObjectId] } } });
            expect(where?._id?.$not.$in[1]).toBeDefined();
            expect(isObjectID(where?._id?.$not.$in[1])).toBe(true);
        });

        it('Get get a valid where 15', async () => {
            const where = cvRepository._testOperations().getWhereObject({ user: { $not: { $in: [validObjectId, validObjectId, validObjectId] } } });
            expect(where?.user?.$not.$in[1]).toBeDefined();
            expect(isObjectID(where?.user?.$not.$in[1])).toBe(true);
        });

        it('Get get a valid where 16', async () => {
            const where = cvRepository._testOperations().getWhereObject({
                $or: [{
                    cvName: 'Mo',
                    id: validObjectId,
                    user: validObjectId
                }, {
                    cvName: {
                        $in: [1, 2, 3, 4]
                    }
                }, {
                    user: {
                        $in: [validObjectId, validObjectId]
                    }
                }, {
                    cvName: { $eq: 'name' }
                }, {
                    id: { $eq: validObjectId }
                }, {
                    id: { $in: [validObjectId, validObjectId] }
                }, {
                    user: { $ne: validObjectId }
                }, {
                    _id: { $ne: validObjectId }
                }]
            });
            expect(where?.$or).toBeDefined();
            expect(where?.$or.length).toBe(8);
            expect(typeof where?.$or[0].cvName).toBe('string');
            expect(isObjectID(where?.$or[0]._id)).toBe(true);
            expect(isObjectID(where?.$or[0].user)).toBe(true);
            expect(Array.isArray(where?.$or[1].cvName.$in)).toBe(true);
            expect(Array.isArray(where?.$or[2].user.$in)).toBe(true);
            expect(isObjectID(where?.$or[2].user.$in[1])).toBe(true);
            expect(typeof where?.$or[3].cvName.$eq).toBe('string');
            expect(isObjectID(where?.$or[4]._id.$eq)).toBe(true);
            expect(isObjectID(where?.$or[5]._id.$in[1])).toBe(true);
            expect(isObjectID(where?.$or[6].user.$ne)).toBe(true);
            expect(isObjectID(where?.$or[7]._id.$ne)).toBe(true);
        });

    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});
