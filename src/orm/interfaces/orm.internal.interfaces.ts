export interface InternalReferenceEntity {
    key: string,
    refersToCollectionName?: string,
    refersToKey?: string,
    _refererCollectionName?: string,
    _refererKey?: string,
    referenceEntities?: InternalReferenceEntity[];
    isArray?: boolean,
    as?: string;
    maxDepth?: number;
}