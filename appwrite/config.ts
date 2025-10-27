
import { Client, Databases } from "node-appwrite";
import { getAppwriteEnv } from "./env.server";

export async function getAppwriteClient() {
  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
    PROJECT_COLLECTION_ID,
  } = await getAppwriteEnv();

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);


  return { client, databases, APPWRITE_DATABASE_ID, PROJECT_COLLECTION_ID };
}
