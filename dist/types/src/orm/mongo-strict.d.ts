import { RepositoryOptions } from "./interfaces/orm.interfaces";
import { ORMRepo } from "./orm.repo";
interface DBConnection {
    uri: string;
}
declare const createConnection: (connection: DBConnection, repositoriesOptions?: RepositoryOptions) => any;
declare const addRepository: (EntityClass: any, repositoryOptions?: RepositoryOptions) => ORMRepo;
declare const initDBMap: () => Promise<void>;
declare const getConnectionManager: () => any;
declare const getDB: () => any;
declare const getRepositoriesMap: () => Map<any, any>;
export { createConnection, addRepository, initDBMap, getConnectionManager, getDB, getRepositoriesMap };
