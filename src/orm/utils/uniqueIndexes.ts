export default async function handleUniqueIndexes(repositoriesMap: Map<string, any>, db: any) {
    const promises = [];
    repositoriesMap.forEach(async (value, collectionName) => {
        const uniqueIndex = value.entityProperties.uniqueIndexes;

        if (!uniqueIndex?.length) return;

        uniqueIndex.forEach(async (uniqueIndex) => {
            if (uniqueIndex.isIgnoreCase) {
                promises.push(db.collection(collectionName).createIndex({ [uniqueIndex.key]: 1 }, { unique: true, name: `${uniqueIndex.key}_unique_index_mongostrict`, collation: { locale: "en", strength: 1 } }))
            } else {
                promises.push(db.collection(collectionName).createIndex({ [uniqueIndex.key]: 1 }, { unique: true, name: `${uniqueIndex.key}_unique_index_mongostrict`, collation: { locale: 'en', strength: 3 } }));
            }
        });
    });

    await Promise.all(promises);
}