import { Client, Databases } from "node-appwrite";
import "dotenv/config"; // ✅ Ensure environment variables are loaded

// ✅ Initialize Appwrite Client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!); // ✅ Use server-side API key

const databases = new Databases(client);

// ✅ Ensure Environment Variables Are Loaded
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_PROJECT_COLLECTION_ID!;

if (!DATABASE_ID || !COLLECTION_ID) {
  console.error("❌ Missing Appwrite Database or Collection ID");
  process.exit(1);
}

export { client, databases, DATABASE_ID, COLLECTION_ID };
