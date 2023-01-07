import { REPOSITORIES_DEFAULT_OPTIONS } from "./contsants/constants";
import { _EntityProperties, RepositoryOptions } from "./interfaces/orm.interfaces";
import { ORMRepo } from "./orm.repo";
import { setRefCheckCollection } from "./utils/refCheckCollection";
import refCollectionHandle from "./utils/refCollection";
import initRefsMap from "./utils/refsMap";
import handleUniqueIndexes from "./utils/uniqueIndexes";
import { getEntityProperties } from "./utils/utils";

const { MongoClient } = require("mongodb");

interface DBConnection {
    uri: string;
}

class MongoStrict {
    private connection;
    private repositoriesMap = new Map();
    private repositoriesOptions = {};

    createConnection = (connection: DBConnection, repositoriesOptions: RepositoryOptions = {}) => {
        // if (typeof connection.uri !== 'string') {
        //     throw 'uri string is required to start a connection';
        // }
        this.repositoriesOptions = { ...REPOSITORIES_DEFAULT_OPTIONS, ...repositoriesOptions };
        this.connection = new MongoClient(connection.uri);
        return this.connection;
    }

    addRepository = (EntityClass: any, repositoryOptions: RepositoryOptions = {}) => {
        repositoryOptions = { ...this.repositoriesOptions, ...repositoryOptions };
        const entity: any = new EntityClass();
        const collectionName = entity.ORM_ENTITY_OPTIONS.name;
        const mongoCollection = this.connection.db().collection(collectionName);

        const entityProperties: _EntityProperties = getEntityProperties(entity, repositoryOptions, EntityClass);

        const ORM = new ORMRepo(mongoCollection, entityProperties, repositoryOptions, collectionName);

        this.repositoriesMap.set(collectionName, {
            entityProperties,
            collection: mongoCollection,
            repositoryOptions
        });

        return ORM;
    }

    initDBMap = async () => {
        initRefsMap(this.repositoriesMap);
        await refCollectionHandle(this.connection.db());
        await handleUniqueIndexes(this.repositoriesMap, this.connection.db());
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
