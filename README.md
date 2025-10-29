# 🚀 Collaborative Code Editor

A **real-time collaborative code editor** built with **Next.js**, **Socket.IO**, **Appwrite**, and **Clerk** — enabling seamless multi-user editing, live synchronization, and secure authentication.

---

## ✨ Features

* 🔄 **Real-time Collaboration** — Multiple users can edit the same code simultaneously.
* 💻 **Monaco Editor** — Integrated with the same code editor used in VS Code.
* ⚡ **Socket.IO Sync Engine** — Reliable, low-latency communication for real-time updates.
* 🔐 **Clerk Authentication** — Secure and modern user authentication with session handling.
* ☁️ **Appwrite Backend** — Cloud-based database for storing project data and user states.
* 🚀 **Optimized & Scalable** — Built to handle multiple users smoothly in real-time.

---

## 🧱 Tech Stack

| Layer               | Technology                                    |
| ------------------- | --------------------------------------------- |
| **Frontend**        | Next.js, TypeScript, Tailwind CSS             |
| **Editor**          | Monaco Editor                                 |
| **Realtime Engine** | Socket.IO (WebSockets wrapper)                |
| **Auth**            | Clerk                                         |
| **Database**        | Appwrite                                      |
| **Deployment**      | Vercel (Frontend) + Render (Socket.IO Server) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/anurag-rawat12/CodeSync.git
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Add Environment Variables

Create a `.env.local` file in the root directory and add:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Appwrite Config
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-appwrite-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-appwrite-database-id
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your-appwrite-collection-id
APPWRITE_API_KEY=your-appwrite-api-key

# Socket.IO Server
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-socket-server-url
PORT=9090
```

---
Start it with:

```bash
npx ts-node server.ts
```

(or use `npm run server` if added to scripts)

---

### 5️⃣ Run the Next.js App

```bash
npm run dev
```

Then open:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧠 How It Works

1. When a user opens a project, a **Socket.IO connection** is created between the client and server.
2. Each project acts as a “room” where connected users share code changes.
3. The **server broadcasts** any change made by one user to everyone else in the same room.
4. **Appwrite** stores the last saved state of the code for persistence.
5. **Clerk** handles login, signup, and secure session management.

---

## 🧩 Folder Structure

```
collab-code-editor/
├── app/                # Next.js routes & pages
├── components/         # Reusable React components
├── lib/                # Appwrite setup & utilities
├── server.ts           # Socket.IO server
├── .env                # Environment variables
└── package.json
```

---

## 📦 Deployment Notes

* **Frontend (Next.js)** → Deploy to **Vercel**
* **Socket.IO Backend** → Deploy to **Render**
* Ensure `NEXT_PUBLIC_SOCKET_SERVER_URL` points to your deployed Socket.IO backend.

---

## 📅 Roadmap

* ✅ Real-time collaborative editing with Socket.IO
* ✅ User authentication (Clerk)
* ✅ Database storage (Appwrite)
* 🔜 File management (create, rename, delete)
* 🔜 Syntax highlighting per language
* 🔜 Live cursor presence and user avatars
* 🔜 Version history & rollback

---

## 💡 Example Use Cases

* Pair programming sessions and remote interviews
* Educational platforms for coding tutorials
* Real-time debugging collaboration tools
* Hackathon and project collaboration environments

---
