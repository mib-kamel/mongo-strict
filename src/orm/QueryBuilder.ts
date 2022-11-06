import { CacheOptions, FindOptions } from "./interfaces/orm.interfaces";

export class QueryBuilder {
    private limitOption: number;
    private skipOption: number;
    private selectOption: object;
    private whereOption: object;
    private sortOption: object;
    private debugOption: boolean;
    private cacheOption: any;
    private populateOptions: string | string[];

    private findFunction: Function;
    private findOneFunction: Function;
    private countFunction: Function;
    private findAndCountFunction: Function;

    constructor(find: Function, findOne: Function, count: Function, findAndCount: Function) {
        this.findFunction = find;
        this.findOneFunction = findOne;
        this.countFunction = count;
        this.findAndCountFunction = findAndCount;
    }

    debug = (isDebug = true) => {
        this.debugOption = isDebug;
        return this;
    }

    select = (selectOption: object) => {
        this.selectOption = selectOption;
        return this;
    }

    where = (whereOption: object) => {
        this.whereOption = whereOption;
        return this;
    }

    limit = (limitOption: number) => {
        this.limitOption = limitOption;
        return this;
    }

    skip = (skipOption: number) => {
        this.skipOption = skipOption;
        return this;
    }

    sort = (sortOption: object) => {
        this.sortOption = sortOption;
        return this;
    }

    cache = (cacheOption: CacheOptions | boolean) => {
        this.cacheOption = cacheOption;
        return this;
    }

    populate = (populateOptions: string | string[]) => {
        this.populateOptions = populateOptions;
        return this;
    }

    private getStoredFindOptions = () => {
        const options: FindOptions = {};

        this.skipOption && (options.skip = this.skipOption);
        this.limitOption && (options.limit = this.limitOption);
        this.whereOption && (options.where = this.whereOption);
        this.selectOption && (options.select = this.selectOption);
        this.sortOption && (options.sort = this.sortOption);
        this.cacheOption !== undefined && (options.cache = this.cacheOption);
        this.debugOption !== undefined && (options.debug = this.debugOption);
        this.populateOptions !== undefined && (options.populate = this.populateOptions);

        return options;
    }

    find = async () => {
        const options: FindOptions = this.getStoredFindOptions()
        return this.findFunction(options);
    }

    findOne = async () => {
        const options: FindOptions = this.getStoredFindOptions()
        return this.findOneFunction(options);
    }

    count = async () => {
        const options: FindOptions = this.getStoredFindOptions()
        return this.countFunction(options);
    }

    findAndCount = async () => {
        const options: FindOptions = this.getStoredFindOptions()
        return this.findAndCountFunction(options);
    }
}