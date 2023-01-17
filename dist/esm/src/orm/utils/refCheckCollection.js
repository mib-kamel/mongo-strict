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
const getRefCheckCollection = refCheckCollection.getCollection;
export { setRefCheckCollection, getRefCheckCollection };
