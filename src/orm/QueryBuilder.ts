import { FindOptions } from "./interfaces/orm.interfaces";

export class QueryBuilder {
    private limitOption: number;
    private skipOption: number;
    private selectOption: object;
    private whereOption: object;
    private sortOption: object;
    private isDebug: boolean;


    private findFunction: Function;
    private findOneFunction: Function;
    private countFunction: Function;


    constructor(find: Function, findOne: Function, count: Function) {
        this.findFunction = find;
        this.findOneFunction = findOne;
        this.countFunction = count;
    }


    debug = (isDebug: boolean) => {
        this.isDebug = isDebug;
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

    find = async () => {
        const options: FindOptions = {};
        this.skipOption && (options.skip = this.skipOption);
        this.limitOption && (options.limit = this.limitOption);
        this.whereOption && (options.where = this.whereOption);
        this.selectOption && (options.select = this.selectOption);
        this.sortOption && (options.sort = this.sortOption);

        return this.findFunction(options);
    }

    findOne = async () => {
        const options: FindOptions = {};
        this.skipOption && (options.skip = this.skipOption);
        this.limitOption && (options.limit = this.limitOption);
        this.whereOption && (options.where = this.whereOption);
        this.selectOption && (options.select = this.selectOption);
        this.sortOption && (options.sort = this.sortOption);

        return this.findOneFunction(options);
    }

    count = async () => {
        const options: FindOptions = {};
        this.skipOption && (options.skip = this.skipOption);
        this.limitOption && (options.limit = this.limitOption);
        this.whereOption && (options.where = this.whereOption);
        this.selectOption && (options.select = this.selectOption);
        this.sortOption && (options.sort = this.sortOption);

        return this.countFunction(options);
    }
}