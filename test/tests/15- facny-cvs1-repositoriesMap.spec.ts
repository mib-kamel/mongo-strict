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
    let repositoriesMap;

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

        repositoriesMap = userRepository._testOperations().getRepositoriesMap();
        expect(repositoriesMap).toBeDefined();
    });

    describe('root', () => {
        it('User references is as expected', async () => {
            const userRefs = repositoriesMap.get('user')?.entityProperties?.referenceEntities;
            expect(userRefs).toBeDefined();
            expect(userRefs.length).toEqual(1);

            const user_cvRefs = userRefs[0];
            expect(user_cvRefs._refererCollectionName).toBe('cv');
            expect(user_cvRefs.referenceEntities.length).toEqual(1);
            expect(user_cvRefs.referenceEntities[0]._refererCollectionName).toBe('section');
        });

        it('cv references is as expected', async () => {
            const cvRefs = repositoriesMap.get('cv')?.entityProperties?.referenceEntities;

            expect(cvRefs).toBeDefined();
            expect(cvRefs.length).toEqual(2);

            const cv_userRefs = cvRefs[0];
            expect(cv_userRefs.refersToCollectionName).toBe('user');

            const cv_sectionRefs = cvRefs[1];
            expect(cv_sectionRefs._refererCollectionName).toBe('section');
        });

        it('section references is as expected', async () => {
            const sectionRefs = repositoriesMap.get('section')?.entityProperties?.referenceEntities;

            expect(sectionRefs).toBeDefined();
            expect(sectionRefs.length).toEqual(1);

            const cv_sectionRefs = sectionRefs[0];
            expect(cv_sectionRefs.refersToCollectionName).toBe('cv');
            expect(cv_sectionRefs.referenceEntities.length).toBe(1);

            const user_cv_sectionRefs = cv_sectionRefs.referenceEntities[0];
            expect(user_cv_sectionRefs.refersToCollectionName).toBe('user');
            expect(user_cv_sectionRefs.referenceEntities).toBeUndefined();
        });
    });

    afterAll(async () => {
        const db = getDB();
        await db.dropDatabase();
        const connection = getConnectionManager();
        connection.close();
    })
});