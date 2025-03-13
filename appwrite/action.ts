import { databases } from "./config";
import { ID } from "appwrite";

const db: { [key: string]: any } = {};

const collections = [
    {
        dbId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        id: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
        name: "user",
    },
    {
        dbId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        id: process.env.NEXT_PUBLIC_PROJECT_COLLECTION_ID!,
        name: "projects",
    },
];

collections.forEach((col) => {
    
    db[col.name] = {
        create: (payload: object, permissions: string[], id: string = ID.unique()) =>
            databases.createDocument(
                col.dbId,
                col.id,
                id,
                payload,
                permissions
            ),
        update: (id: string, payload: object, permissions: string[]) =>
            databases.updateDocument(
                col.dbId,
                col.id,
                id,
                payload,
                permissions
            ),
        delete: (id: string) => databases.deleteDocument(col.dbId, col.id, id),

        list: (queries = []) =>
            databases.listDocuments(col.dbId, col.id, queries),

        get: (id: string) => databases.getDocument(col.dbId, col.id, id),
    };
});

export default db;