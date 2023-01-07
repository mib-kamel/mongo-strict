import { setRefCheckCollection } from "./refCheckCollection";
const REF_CHECK_COLLECTION_NAME = "STRICT_ORM__REC_CHECK_COLLECTION++";
const REF_CHECK_COLLECTION_RECORD = { message: "If you are using MONGO_STRICT please leave this collection as it helps the ORM to make the reference checks fastly" };

export default async function refCollectionHandle(db: any) {
    let refCheckCollection = await db.collection(REF_CHECK_COLLECTION_NAME);
    if (!refCheckCollection) {
        await db.createCollection(REF_CHECK_COLLECTION_NAME);
        refCheckCollection = db.getCollection(REF_CHECK_COLLECTION_NAME);
        await refCheckCollection.insertOne(REF_CHECK_COLLECTION_RECORD);
    } else {
        const tmpDataCount = await refCheckCollection.count();
        if (!tmpDataCount) {
            await refCheckCollection.insertOne(REF_CHECK_COLLECTION_RECORD);
        }
    }
    setRefCheckCollection(refCheckCollection);
}