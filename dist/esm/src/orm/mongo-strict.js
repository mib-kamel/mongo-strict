var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { REPOSITORIES_DEFAULT_OPTIONS } from "./contsants/constants";
import { ORMRepo } from "./orm.repo";
import refCollectionHandle from "./utils/refCollection";
import initRefsMap from "./utils/refsMap";
import handleUniqueIndexes from "./utils/uniqueIndexes";
import { getEntityProperties } from "./utils/utils";
const { MongoClient } = require("mongodb");
class MongoStrict {
    constructor() {
        this.repositoriesMap = new Map();
        this.repositoriesOptions = {};
        this.createConnection = (connection, repositoriesOptions = {}) => {
            this.repositoriesOptions = Object.assign(Object.assign({}, REPOSITORIES_DEFAULT_OPTIONS), repositoriesOptions);
            this.connection = new MongoClient(connection.uri);
            return this.connection;
        };
        this.addRepository = (EntityClass, repositoryOptions = {}) => {
            repositoryOptions = Object.assign(Object.assign({}, this.repositoriesOptions), repositoryOptions);
            const entity = new EntityClass();
            const collectionName = entity.ORM_ENTITY_OPTIONS.name;
            const mongoCollection = this.connection.db().collection(collectionName);
            const entityProperties = getEntityProperties(entity, repositoryOptions, EntityClass);
            const ORM = new ORMRepo(mongoCollection, entityProperties, repositoryOptions, collectionName);
            this.repositoriesMap.set(collectionName, {
                entityProperties,
                collection: mongoCollection,
                repositoryOptions
            });
            return ORM;
        };
        this.initDBMap = () => __awaiter(this, void 0, void 0, function* () {
            initRefsMap(this.repositoriesMap);
            yield refCollectionHandle(this.connection.db());
            yield handleUniqueIndexes(this.repositoriesMap, this.connection.db());
        });
        this.getConnectionManager = () => {
            return this.connection;
        };
        this.getDB = () => {
            return this.connection.db();
        };
        this.getRepositoriesMap = () => {
            return this.repositoriesMap;
        };
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
