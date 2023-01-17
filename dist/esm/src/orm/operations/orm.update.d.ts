import { ReferenceEntity, RepositoryOptions } from "../interfaces/orm.interfaces";
export default function update(collection: any, uniqueKeys: string[], EntityDataValidator: any, referenceEntities: ReferenceEntity[], where: any, defaultValues: string[], requiredKeys: any[], repositoryOptions: RepositoryOptions): {
    setOne: (updateData: any) => Promise<any>;
    setMany: (updateData: any) => Promise<any>;
    replaceOne: (updateData: any) => Promise<any>;
};
