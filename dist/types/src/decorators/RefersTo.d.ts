import { RELATION_TYPES } from "../orm/interfaces/orm.interfaces";
interface EntityRefersTo {
    collection: string;
    key: string;
    as?: string;
    isArray?: boolean;
    reverseRefering?: boolean;
    reverseReferingAs?: string;
    maxDepth?: number;
    type?: RELATION_TYPES;
    message?: string;
}
export declare function RefersTo(refersTo: EntityRefersTo): (target: any, propertyKey: string) => void;
export {};
