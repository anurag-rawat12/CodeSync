import { databases, DATABASE_ID, COLLECTION_ID } from "./config";
import { ID } from "appwrite";

const db: { [key: string]: any } = {
  projects: {
    create: (payload: object, permissions: string[], id: string = ID.unique()) =>
      databases.createDocument(DATABASE_ID, COLLECTION_ID, id, payload, permissions),
      
    update: (id: string, payload: object) =>
      databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, payload),

    delete: (id: string) => databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id),

    list: (queries = []) => databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries),

    get: (id: string) => databases.getDocument(DATABASE_ID, COLLECTION_ID, id),
  },
};

export default db;
