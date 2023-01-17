export class ORMOperations {
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
        this.listIndexes = ORM.listIndexes;
        this._testOperations = ORM._test;
    }
}
