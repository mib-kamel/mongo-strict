export interface InternalReferenceEntity {
    key: string;
    refersToCollectionName?: string;
    refersToKey?: string;
    refererCollectionName?: string;
    refererKey?: string;
    referenceEntities?: InternalReferenceEntity[];
    isArray?: boolean;
    as?: string;
    maxDepth?: number;
}
