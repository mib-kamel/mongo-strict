import { CacheOptions } from "./interfaces/orm.interfaces";
export declare class QueryBuilder {
    private limitOption;
    private skipOption;
    private selectOption;
    private whereOption;
    private sortOption;
    private debugOption;
    private cacheOption;
    private populateOptions;
    private findFunction;
    private findOneFunction;
    private countFunction;
    private findAndCountFunction;
    constructor(find: Function, findOne: Function, count: Function, findAndCount: Function);
    debug: (isDebug?: boolean) => this;
    select: (selectOption: object) => this;
    where: (whereOption: object) => this;
    limit: (limitOption: number) => this;
    skip: (skipOption: number) => this;
    sort: (sortOption: object) => this;
    cache: (cacheOption: CacheOptions | boolean) => this;
    populate: (populateOptions: string | string[]) => this;
    private getStoredFindOptions;
    find: () => Promise<any>;
    findOne: () => Promise<any>;
    count: () => Promise<any>;
    findAndCount: () => Promise<any>;
}
