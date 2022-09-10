import { CVRepository } from '../data/facny-cvs2/cv.repository';
import { SectionRepository } from '../data/facny-cvs2/section.repository';
import { UserRepository } from '../data/facny-cvs2/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { ObjectId } from 'mongodb';

describe('AppController', () => {
    let userRepository;
    let cvRepository;
    let sectionRepository;
    let insertedUser;
    let insertedCV;

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
        it('Test Aggregate Array 1', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({});

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBeDefined();
            expect(aggregateArray.length).toBe(1);
            expect(aggregateArray[0].$limit).toBeDefined();
        });

        it('Test Aggregate Array 2', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ select: ["id", "name"] });

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBeDefined();
            expect(aggregateArray.length).toBe(2);
            expect(aggregateArray[0].$limit).toBeDefined();
            expect(aggregateArray[1].$project).toBeDefined();
        });

        it('Test Aggregate Array 3', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ debug: false, select: ["id", "id3", "3id", "name", 'cvs.id', 'cvs.ide', 'cvs.eid'] });

            const $project = aggregateArray[2]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBeDefined();
            expect(aggregateArray.length).toBe(3);
            expect(aggregateArray[0].$limit).toBeDefined();
            expect(aggregateArray[1].$lookup).toBeDefined();
            expect($project).toBeDefined();
            expect($project['_id']).toBeDefined();
            expect($project['id3']).toBeDefined();
            expect($project['3id']).toBeDefined();
            expect($project['cvs._id']).toBeDefined();
            expect($project['cvs.ide']).toBeDefined();
            expect($project['cvs.eid']).toBeDefined();
        });

        it('Test Aggregate Array 4', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ select: ['cvs.ide', 'cvs.eid', 'cvs.sections.id'] });

            const $project = aggregateArray[2]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBeDefined();
            expect(aggregateArray.length).toBe(3);
            expect(aggregateArray[0].$limit).toBeDefined();
            expect(aggregateArray[1].$lookup).toBeDefined();
            expect(aggregateArray[1].$lookup).toBeDefined();
            expect($project).toBeDefined();
            expect($project['_id']).toEqual(1);
            expect($project['cvs._id']).toEqual(1);
            expect($project['cvs.ide']).toEqual(1);
            expect($project['cvs.eid']).toEqual(1);
            expect($project['cvs.sections._id']).toEqual(1);
        });

        it('Test Aggregate Array 5', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

            const $project = aggregateArray[2]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBeDefined();
            expect(aggregateArray.length).toBe(3);
            expect(aggregateArray[0].$limit).toBeDefined();
            expect(aggregateArray[1].$lookup).toBeDefined();
            expect($project).toBeDefined();
            expect($project['_id']).toEqual(1);
            expect($project['cvs._id']).toEqual(1);
            expect($project['cvs.ide']).toEqual(1);
            expect($project['cvs.eid']).toEqual(1);
            expect($project['cvs.sections']).toEqual(1);
            expect($project['cvs.sections._id']).toBeUndefined();
        });

        it('Test Aggregate Array 6', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ sort: { id: -1 }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

            const $sort = aggregateArray[0]?.$sort;
            const $project = aggregateArray[3]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBe(4);
            expect($sort).toBeDefined();
            expect($sort._id).toEqual(-1);
            expect(aggregateArray[1].$limit).toBeDefined();
            expect(aggregateArray[2].$lookup).toBeDefined();
            expect($project).toBeDefined();
            expect($project['_id']).toEqual(1);
            expect($project['cvs._id']).toEqual(1);
        });

        it('Test Aggregate Array 7', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ debug: false, sort: { 'cvs.id': -1 }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

            const $lookup = aggregateArray[0].$lookup;
            const $sort = aggregateArray[1]?.$sort;
            const $limit = aggregateArray[2]?.$limit;
            const $project = aggregateArray[3]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBe(4);
            expect($lookup).toBeDefined();
            expect($sort).toBeDefined();
            expect($limit).toBeDefined();
            expect($lookup).toBeDefined();
            expect($project).toBeDefined();
        });

        it('Test Aggregate Array 8', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ sort: { 'cvs.id': -1 }, where: { name: "Mo" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

            const $match = aggregateArray[0]?.$match;
            const $lookup = aggregateArray[1].$lookup;
            const $sort = aggregateArray[2]?.$sort;
            const $limit = aggregateArray[3]?.$limit;
            const $project = aggregateArray[4]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBe(5);
            expect($match).toBeDefined();
            expect($sort).toBeDefined();
            expect($limit).toBeDefined();
            expect($lookup).toBeDefined();
            expect($project).toBeDefined();
        });

        it('Test Aggregate Array 9', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ sort: { 'cvs.id': -1 }, where: { 'cvs.name': "Mo" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

            const $lookup = aggregateArray[0].$lookup;
            const $match = aggregateArray[1]?.$match;
            const $sort = aggregateArray[2]?.$sort;
            const $limit = aggregateArray[3]?.$limit;
            const $project = aggregateArray[4]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBe(5);
            expect($match).toBeDefined();
            expect($sort).toBeDefined();
            expect($limit).toBeDefined();
            expect($lookup).toBeDefined();
            expect($project).toBeDefined();
        });

        it('Test Aggregate Array 10', async () => {
            const aggregateArray = userRepository._testOperations().getFindAggregateArray({ debug: false, sort: { 'cvs': -1 }, where: { 'cvs.name': "Mo" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

            const $sort = aggregateArray[0]?.$sort;
            const $lookup = aggregateArray[1].$lookup;
            const $match = aggregateArray[2]?.$match;
            const $limit = aggregateArray[3]?.$limit;
            const $project = aggregateArray[4]?.$project;

            expect(aggregateArray).toBeDefined();
            expect(aggregateArray.length).toBe(5);
            expect($match).toBeDefined();
            expect($sort).toBeDefined();
            expect($limit).toBeDefined();
            expect($lookup).toBeDefined();
            expect($project).toBeDefined();
        });
    });

    it('Test Aggregate Array 11', async () => {
        const aggregateArray = userRepository._testOperations().getFindAggregateArray({ sort: { 'cvs': -1 }, where: { 'cvs': "6309c6f839fc4980aeb34677" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

        const $match = aggregateArray[0]?.$match;
        const $sort = aggregateArray[1]?.$sort;
        const $limit = aggregateArray[2]?.$limit;
        const $lookup = aggregateArray[3].$lookup;
        const $project = aggregateArray[4]?.$project;

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(5);
        expect($match).toBeDefined();
        expect($match.cvs).toEqual(new ObjectId("6309c6f839fc4980aeb34677"));
        expect($match.cvs).not.toEqual("6309c6f839fc4980aeb34677");
        expect($sort).toBeDefined();
        expect($limit).toBeDefined();
        expect($lookup).toBeDefined();
        expect($project).toBeDefined();
    });

    it('Test Aggregate Array 12', async () => {
        const aggregateArray = userRepository._testOperations().getFindAggregateArray({ sort: { 'cvs': -1 }, where: { 'cvs.id': "6309c6f839fc4980aeb34677" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

        const $sort = aggregateArray[0]?.$sort;
        const $lookup = aggregateArray[1].$lookup;
        const $match = aggregateArray[2]?.$match;
        const $limit = aggregateArray[3]?.$limit;
        const $project = aggregateArray[4]?.$project;

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(5);
        expect($match).toBeDefined();
        expect($match['cvs._id']).toEqual(new ObjectId("6309c6f839fc4980aeb34677"));
        expect($match['cvs._id']).not.toEqual("6309c6f839fc4980aeb34677");
        expect($match['cvs.id']).toBeUndefined();
        expect($sort).toBeDefined();
        expect($limit).toBeDefined();
        expect($lookup).toBeDefined();
        expect($project).toBeDefined();
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});
