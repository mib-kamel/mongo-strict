"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefCheckCollection = exports.setRefCheckCollection = void 0;
class RefCheckCollection {
    constructor() {
        this.setCollection = (collection) => {
            this.collection = collection;
        };
        this.getCollection = () => {
            return this.collection;
        };
    }
}
const refCheckCollection = new RefCheckCollection();
const setRefCheckCollection = refCheckCollection.setCollection;
exports.setRefCheckCollection = setRefCheckCollection;
const getRefCheckCollection = refCheckCollection.getCollection;
exports.getRefCheckCollection = getRefCheckCollection;
