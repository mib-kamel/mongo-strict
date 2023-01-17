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
const refCheckCollection_1 = require("./refCheckCollection");
const REF_CHECK_COLLECTION_NAME = "STRICT_ORM__REC_CHECK_COLLECTION++";
const REF_CHECK_COLLECTION_RECORD = { message: "If you are using MONGO_STRICT please leave this collection as it helps the ORM to make the reference checks fastly" };
function refCollectionHandle(db) {
    return __awaiter(this, void 0, void 0, function* () {
        let refCheckCollection = yield db.collection(REF_CHECK_COLLECTION_NAME);
        if (!refCheckCollection) {
            yield db.createCollection(REF_CHECK_COLLECTION_NAME);
            refCheckCollection = db.getCollection(REF_CHECK_COLLECTION_NAME);
            yield refCheckCollection.insertOne(REF_CHECK_COLLECTION_RECORD);
        }
        else {
            const tmpDataCount = yield refCheckCollection.count();
            if (!tmpDataCount) {
                yield refCheckCollection.insertOne(REF_CHECK_COLLECTION_RECORD);
            }
        }
        (0, refCheckCollection_1.setRefCheckCollection)(refCheckCollection);
    });
}
exports.default = refCollectionHandle;
