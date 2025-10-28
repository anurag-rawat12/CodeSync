"use server";
import dotenv from "dotenv";

dotenv.config();

export async function getAppwriteEnv() {
  const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT!;
  const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;
  const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;
  const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
  const PROJECT_COLLECTION_ID = process.env.PROJECT_COLLECTION_ID!;

  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    throw new Error("❌ Missing Appwrite environment variables");
  }

  return {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
    PROJECT_COLLECTION_ID,
  };
}