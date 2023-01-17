interface IsRequiredOptions {
    message?: string;
}
export declare function IsRequired(isRequiredOptions?: IsRequiredOptions): (target: any, propertyKey: string) => void;
export {};
