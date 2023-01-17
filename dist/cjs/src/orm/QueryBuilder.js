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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor(find, findOne, count, findAndCount) {
        this.debug = (isDebug = true) => {
            this.debugOption = isDebug;
            return this;
        };
        this.select = (selectOption) => {
            this.selectOption = selectOption;
            return this;
        };
        this.where = (whereOption) => {
            this.whereOption = whereOption;
            return this;
        };
        this.limit = (limitOption) => {
            this.limitOption = limitOption;
            return this;
        };
        this.skip = (skipOption) => {
            this.skipOption = skipOption;
            return this;
        };
        this.sort = (sortOption) => {
            this.sortOption = sortOption;
            return this;
        };
        this.cache = (cacheOption) => {
            this.cacheOption = cacheOption;
            return this;
        };
        this.populate = (populateOptions) => {
            this.populateOptions = populateOptions;
            return this;
        };
        this.getStoredFindOptions = () => {
            const options = {};
            this.skipOption && (options.skip = this.skipOption);
            this.limitOption && (options.limit = this.limitOption);
            this.whereOption && (options.where = this.whereOption);
            this.selectOption && (options.select = this.selectOption);
            this.sortOption && (options.sort = this.sortOption);
            this.cacheOption !== undefined && (options.cache = this.cacheOption);
            this.debugOption !== undefined && (options.debug = this.debugOption);
            this.populateOptions !== undefined && (options.populate = this.populateOptions);
            return options;
        };
        this.find = () => __awaiter(this, void 0, void 0, function* () {
            const options = this.getStoredFindOptions();
            return this.findFunction(options);
        });
        this.findOne = () => __awaiter(this, void 0, void 0, function* () {
            const options = this.getStoredFindOptions();
            return this.findOneFunction(options);
        });
        this.count = () => __awaiter(this, void 0, void 0, function* () {
            const options = this.getStoredFindOptions();
            return this.countFunction(options);
        });
        this.findAndCount = () => __awaiter(this, void 0, void 0, function* () {
            const options = this.getStoredFindOptions();
            return this.findAndCountFunction(options);
        });
        this.findFunction = find;
        this.findOneFunction = findOne;
        this.countFunction = count;
        this.findAndCountFunction = findAndCount;
    }
}
exports.QueryBuilder = QueryBuilder;
