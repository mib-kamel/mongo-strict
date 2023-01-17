interface UniqueOptions {
    isIgnoreCase?: boolean;
    message?: string;
    isAutoCreateUniqueIndex?: boolean;
}
export declare function IsUnique(uniqueOptions?: UniqueOptions): (target: any, propertyKey: string) => void;
export {};
