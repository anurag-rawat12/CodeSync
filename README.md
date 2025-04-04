# Collaborative Code Editor

A real-time collaborative code editor built with **Next.js**, **WebSockets**, **Appwrite**, and **Clerk** for seamless multi-user editing and authentication.

## Features

- 🔄 **Real-time Collaboration** - Multiple users can edit code simultaneously.
- 💻 **Monaco Editor Integration** - The same editor used in VS Code.
- ⚡ **WebSockets for Sync** - Efficient real-time updates without conflicts.
- 🔐 **Clerk for Authentication** - Secure user authentication and management.
- 🌍 **Appwrite for Backend Services** - Database management and cloud functions.
- 🚀 **Fast & Scalable** - Optimized for smooth performance in the browser.

## Tech Stack

- **Next.js** - Server-side rendering & optimized performance.
- **Monaco Editor** - Powerful code editing capabilities.
- **WebSockets** - Real-time data synchronization.
- **Clerk** - Authentication and user management.
- **Appwrite** - Backend services for database operations.

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/collab-code-editor.git
   cd collab-code-editor
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Create a `.env` file and add the following environment variables:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
   CLERK_SECRET_KEY=your-secret-key
   APPWRITE_API_KEY=your-appwrite-api-key
   NEXT_PUBLIC_LIVEBLOCK_API_KEY=your-liveblock-api-key
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-appwrite-project-id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
   NEXT_PUBLIC_PROJECT_COLLECTION_ID=your-collection-id
   NODE_ENV=development
   PORT=8080
   ```
4. **Start the development server:**
   ```sh
   npm run dev
   ```
5. **Open in browser:**
   Navigate to `http://localhost:3000`

## How It Works

- Users connect to a shared session where they can edit code in real-time.
- WebSockets handle synchronization between users for smooth collaboration.
- Clerk provides secure authentication and user management.
- The Monaco Editor provides syntax highlighting, autocompletion, and rich code editing features.
- Appwrite manages database operations and cloud functions.
- Next.js ensures the app runs efficiently with server-side rendering where needed.

## Roadmap

- ✅ Basic collaborative editing
- ✅ User authentication with Clerk
- 🔜 File management system
- 🔜 Syntax error detection & linting
- 🔜 Multi-language support
