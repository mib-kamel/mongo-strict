import { REPOSITORIES_DEFAULT_OPTIONS } from "./contsants/constants";
import { _EntityProperties, RepositoryOptions } from "./interfaces/orm.interfaces";
import { ORMRepo } from "./orm.repo";
import { setRefCheckCollection } from "./utils/refCheckCollection";
import initRefsMap from "./utils/refsMap";
import { getEntityProperties } from "./utils/utils";

const { MongoClient } = require("mongodb");
const REF_CHECK_COLLECTION_NAME = "STRICT_ORM__REC_CHECK_COLLECTION++";
const REF_CHECK_COLLECTION_RECORD = { message: "If you are using MONGO_STRICT please leave this collection as it helps the ORM to make the reference checks fastly" };

interface DBConnection {
    uri: string;
}

class MongoStrict {
    private connection;
    private repositoriesMap = new Map();
    private repositoriesOptions = {};

    createConnection = async (connection: DBConnection, repositoriesOptions: RepositoryOptions = {}) => {
        if (!connection.uri) {
            throw 'uri is required to start a connection';
        }
        this.repositoriesOptions = { ...REPOSITORIES_DEFAULT_OPTIONS, ...repositoriesOptions };
        this.connection = await new MongoClient(connection.uri);
        let refCheckCollection = await this.connection.db().collection(REF_CHECK_COLLECTION_NAME);
        if (!refCheckCollection) {
            await this.connection.db().createCollection(REF_CHECK_COLLECTION_NAME);
            refCheckCollection = this.connection.db().getCollection(REF_CHECK_COLLECTION_NAME);
            await refCheckCollection.insertOne(REF_CHECK_COLLECTION_RECORD);
        } else {
            const tmpDataCount = await refCheckCollection.count();
            if (!tmpDataCount) {
                await refCheckCollection.insertOne(REF_CHECK_COLLECTION_RECORD);
            }
        }
        setRefCheckCollection(refCheckCollection);
        return this.connection;
    }

    addRepository = (EntityClass: any, repositoryOptions: RepositoryOptions = {}) => {
        const entity: any = new EntityClass();
        const collectionName = entity.ORM_ENTITY_OPTIONS.name;
        const mongoCollection = this.connection.db().collection(collectionName);
        const entityProperties: _EntityProperties = getEntityProperties(entity, repositoryOptions.defaultSelectFields, EntityClass);

        repositoryOptions = { ...this.repositoriesOptions, ...repositoryOptions };

        const ORM = new ORMRepo(mongoCollection, entityProperties, repositoryOptions, collectionName);

        this.repositoriesMap.set(collectionName, {
            entityProperties,
            collection: mongoCollection,
            repositoryOptions
        });

        return ORM
    }

    initDBMap = () => {
        initRefsMap(this.repositoriesMap);
    }

    getConnectionManager = () => {
        return this.connection;
    }

    getDB = () => {
        return this.connection.db();
    }

    getRepositoriesMap = () => {
        return this.repositoriesMap;
    }
}

const ORM = new MongoStrict();

const createConnection = ORM.createConnection;
const addRepository = ORM.addRepository;
const initDBMap = ORM.initDBMap;
const getConnectionManager = ORM.getConnectionManager;
const getDB = ORM.getDB;
const getRepositoriesMap = ORM.getRepositoriesMap;

export { createConnection, addRepository, initDBMap, getConnectionManager, getDB, getRepositoriesMap };
