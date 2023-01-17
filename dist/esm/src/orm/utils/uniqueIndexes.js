var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default function handleUniqueIndexes(repositoriesMap, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        repositoriesMap.forEach((value, collectionName) => __awaiter(this, void 0, void 0, function* () {
            const uniqueIndex = value.entityProperties.uniqueIndexes;
            if (!(uniqueIndex === null || uniqueIndex === void 0 ? void 0 : uniqueIndex.length))
                return;
            uniqueIndex.forEach((uniqueIndex) => __awaiter(this, void 0, void 0, function* () {
                if (uniqueIndex.isIgnoreCase) {
                    promises.push(db.collection(collectionName).createIndex({ [uniqueIndex.key]: 1 }, { unique: true, name: `${uniqueIndex.key}_unique_index_mongostrict`, collation: { locale: "en", strength: 1 } }));
                }
                else {
                    promises.push(db.collection(collectionName).createIndex({ [uniqueIndex.key]: 1 }, { unique: true, name: `${uniqueIndex.key}_unique_index_mongostrict`, collation: { locale: 'en', strength: 3 } }));
                }
            }));
        }));
        yield Promise.all(promises);
    });
}
