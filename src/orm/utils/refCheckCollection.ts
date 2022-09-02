class RefCheckCollection {
    private collection;

    setCollection = (collection) => {
        this.collection = collection;
    }

    getCollection = () => {
        return this.collection;
    }
}

const refCheckCollection = new RefCheckCollection();

const setRefCheckCollection = refCheckCollection.setCollection;
const getRefCheckCollection = refCheckCollection.getCollection;

export { setRefCheckCollection, getRefCheckCollection };