import { UserRepository } from '../data/facny-cvs2/user.repository';
import { createConnection, getConnectionManager, getDB, initDBMap } from '../../src';
import { ObjectId } from 'mongodb';
import { CircularRepository } from '../_database/Repositories/circular.repository';

describe('AppController', () => {
    let userRepository;
    let circularRepository;

    beforeAll(async () => {
        createConnection({
            uri: `mongodb://localhost:27017/fancy-cvs`
        });

        userRepository = new UserRepository();
        circularRepository = new CircularRepository();

        // Should be called after initializing all the repositories
        await initDBMap();
    });

    it('Test Count Aggregate Array 1', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({});

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(1);
        expect(aggregateArray[0].$facet?.count).toBeDefined();
        expect(aggregateArray[0].$facet?.count[0]).toBeDefined();
        expect(aggregateArray[0].$facet?.count[0].$count).toEqual('total');
    });

    it('Test Count Aggregate Array 2', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({ select: ["id", "name"] });

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(1);
        expect(aggregateArray[0].$facet?.count).toBeDefined();
        expect(aggregateArray[0].$facet?.count[0]).toBeDefined();
        expect(aggregateArray[0].$facet?.count[0].$count).toEqual('total');
    });

    it('Test Count Aggregate Array 2.1', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({ select: ["id", "cvs2.aaa"] });

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(1);
        expect(aggregateArray[0].$facet?.count).toBeDefined();
        expect(aggregateArray[0].$facet?.count[0]).toBeDefined();
        expect(aggregateArray[0].$facet?.count[0].$count).toEqual('total');
    });

    it('Test Count Aggregate Array 2.2', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({ where: { "cvs2.aaa": 1 }, select: ["id", "cvs2.aaa"] });

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBeDefined();
        expect(aggregateArray.length).toBe(2);
        expect(aggregateArray[0].$match).toBeDefined();
        expect(aggregateArray[1].$facet?.count[0].$count).toEqual('total');
    });

    it('Test Count Aggregate Array 11', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({ sort: { 'cvs': -1 }, where: { 'cvs': "6309c6f839fc4980aeb34677" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

        const $match = aggregateArray[0]?.$match;
        const $count = aggregateArray[1].$facet?.count[0].$count;

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(2);
        expect($match).toBeDefined();
        expect($match['cvs']).toEqual(new ObjectId("6309c6f839fc4980aeb34677"));
        expect($count).toBeDefined();
    });

    it('Test Count Aggregate Array 12', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({ sort: { 'cvs': -1 }, where: { 'cvs.id': "6309c6f839fc4980aeb34677" }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'], populate: 'cvs' });

        const $lookup = aggregateArray[0].$lookup;
        const $match = aggregateArray[1]?.$match;
        const $count = aggregateArray[2].$facet?.count[0].$count;

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(3);
        expect($match).toBeDefined();
        expect($match['cvs._id']).toEqual(new ObjectId("6309c6f839fc4980aeb34677"));
        expect($match['cvs._id']).not.toEqual("6309c6f839fc4980aeb34677");
        expect($match['cvs.id']).toBeUndefined();
        expect($lookup).toBeDefined();
        expect($count).toBeDefined();
    });

    it('Test Count with 3 and 2 chars keys', async () => {
        const aggregateArray = userRepository._testOperations().getCountAggregateArray({ where: { 'key': "121212", 'ke': 123322 }, select: ['cvs.ide', 'cvs.eid', 'cvs.sections'] });

        const $match = aggregateArray[0]?.$match;
        const $count = aggregateArray[1].$facet?.count[0].$count;

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(2);
        expect($match).toBeDefined();
        expect($match.key).toBeDefined();
        expect($match.ke).toBeDefined();
        expect($count).toBeDefined();
    });

    it('Count circular repository', async () => {
        const aggregateArray = circularRepository._testOperations().getCountAggregateArray({ select: ['parent', 'parent.parent', 'parent.parent.parent', 'parent.parent.parent.parent'], populate: 'parent.parent.parent' });

        const $count = aggregateArray[0].$facet?.count[0].$count;

        expect(aggregateArray).toBeDefined();
        expect(aggregateArray.length).toBe(1);
        expect($count).toBeDefined();
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});
