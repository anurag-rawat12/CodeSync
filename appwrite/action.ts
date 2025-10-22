
import { ID } from "appwrite";
import { getAppwriteClient } from "./config";

export async function dbAction(action: "create" | "update" | "delete" | "list" | "get", payload?: any, id?: string) {

  const { databases, APPWRITE_DATABASE_ID: DATABASE_ID, PROJECT_COLLECTION_ID: COLLECTION_ID } = await getAppwriteClient();


  switch (action) {
    case "create":
      return databases.createDocument(DATABASE_ID, COLLECTION_ID, id || ID.unique(), payload);
    case "update":
      if (!id) throw new Error("ID is required for update");
      return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, payload);
    case "delete":
      if (!id) throw new Error("ID is required for delete");
      return databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    case "list":
      return databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    case "get":
      if (!id) throw new Error("ID is required for get");
      return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
    default:
      throw new Error("Invalid action");
  }
}