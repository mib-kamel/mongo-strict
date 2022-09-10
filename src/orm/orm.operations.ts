export class ORMOperations {
    find: Function;
    count: Function;
    findAndCount: Function;
    findOneById: Function;
    findOne: Function;
    insertOne: Function;
    validateInsertData: Function;
    update: Function;
    deleteOne: Function;
    deleteMany: Function;
    getCollection: Function;
    queryBuilder: Function;
    _testOperations: Function;

    constructor(ORM) {
        this.find = ORM.find;
        this.count = ORM.count;
        this.findAndCount = ORM.findAndCount;
        this.findOneById = ORM.findOneById;
        this.findOne = ORM.findOne;
        this.insertOne = ORM.insertOne;
        this.validateInsertData = ORM.validateInsertData;
        this.update = ORM.update;
        this.deleteOne = ORM.deleteOne;
        this.deleteMany = ORM.deleteMany;
        this.getCollection = ORM.getCollection;
        this.queryBuilder = ORM.queryBuilder;
        this._testOperations = ORM._test;
    }
}