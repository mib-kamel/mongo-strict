"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepositoriesMap = exports.getDB = exports.getConnectionManager = exports.initDBMap = exports.addRepository = exports.createConnection = void 0;
const constants_1 = require("./contsants/constants");
const orm_repo_1 = require("./orm.repo");
const refCollection_1 = __importDefault(require("./utils/refCollection"));
const refsMap_1 = __importDefault(require("./utils/refsMap"));
const uniqueIndexes_1 = __importDefault(require("./utils/uniqueIndexes"));
const utils_1 = require("./utils/utils");
const { MongoClient } = require("mongodb");
class MongoStrict {
    constructor() {
        this.repositoriesMap = new Map();
        this.repositoriesOptions = {};
        this.createConnection = (connection, repositoriesOptions = {}) => {
            this.repositoriesOptions = Object.assign(Object.assign({}, constants_1.REPOSITORIES_DEFAULT_OPTIONS), repositoriesOptions);
            this.connection = new MongoClient(connection.uri);
            return this.connection;
        };
        this.addRepository = (EntityClass, repositoryOptions = {}) => {
            repositoryOptions = Object.assign(Object.assign({}, this.repositoriesOptions), repositoryOptions);
            const entity = new EntityClass();
            const collectionName = entity.ORM_ENTITY_OPTIONS.name;
            const mongoCollection = this.connection.db().collection(collectionName);
            const entityProperties = (0, utils_1.getEntityProperties)(entity, repositoryOptions, EntityClass);
            const ORM = new orm_repo_1.ORMRepo(mongoCollection, entityProperties, repositoryOptions, collectionName);
            this.repositoriesMap.set(collectionName, {
                entityProperties,
                collection: mongoCollection,
                repositoryOptions
            });
            return ORM;
        };
        this.initDBMap = () => __awaiter(this, void 0, void 0, function* () {
            (0, refsMap_1.default)(this.repositoriesMap);
            yield (0, refCollection_1.default)(this.connection.db());
            yield (0, uniqueIndexes_1.default)(this.repositoriesMap, this.connection.db());
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
exports.createConnection = createConnection;
const addRepository = ORM.addRepository;
exports.addRepository = addRepository;
const initDBMap = ORM.initDBMap;
exports.initDBMap = initDBMap;
const getConnectionManager = ORM.getConnectionManager;
exports.getConnectionManager = getConnectionManager;
const getDB = ORM.getDB;
exports.getDB = getDB;
const getRepositoriesMap = ORM.getRepositoriesMap;
exports.getRepositoriesMap = getRepositoriesMap;
