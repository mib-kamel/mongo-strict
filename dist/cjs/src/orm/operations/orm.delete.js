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
exports.deleteMany = exports.deleteOne = void 0;
const whereObjectHandle_1 = require("./whereObjectHandle");
function deleteOne(Repository, referenceEntities, where) {
    return __awaiter(this, void 0, void 0, function* () {
        where = (0, whereObjectHandle_1.getWhereObject)(where, referenceEntities);
        return Repository.deleteOne(where);
    });
}
exports.deleteOne = deleteOne;
function deleteMany(Repository, referenceEntities, where) {
    return __awaiter(this, void 0, void 0, function* () {
        where = (0, whereObjectHandle_1.getWhereObject)(where, referenceEntities);
        return Repository.deleteMany(where);
    });
}
exports.deleteMany = deleteMany;
