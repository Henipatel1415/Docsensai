# DocSens-AI – Intelligent Document Analysis System (RAG Based)

DocSens-AI is a **Context-Aware Document Intelligence Platform** that processes PDF documents and enables semantic search, AI-powered Q&A, and actionable insights.  
The system is built using a **Retrieval-Augmented Generation (RAG)** architecture powered by **Google Gemini AI** for embeddings and **Groq Cloud (LLaMA 3 / Mixtral)** for high-speed inference, with **MongoDB Atlas Vector Search** as the backbone.

This project is developed as a **company-oriented academic project**, demonstrating real-world application of **AI + Full-Stack Development**.

---

## 🎯 Project Objective
- Convert static PDF documents into a **searchable knowledge base**
- Provide **accurate, citation-based AI answers**
- Prevent hallucinations using **strict document grounding**
- Demonstrate a **production-grade RAG pipeline**

---

## 👥 Team Members & Roles

| Name | Role | Responsibilities |
|---|---|---|
| **Munish Rajan (Leader)** | **Lead Integrator & System Architect** | System Architecture, Master Admin Logic (`canInvite`), MongoDB Vector Search Aggregation Pipeline, Context Window Logic, SSE Streaming, Groq Integration |
| Suzzan Naaz | AI Logic Developer | Prompt Engineering, Gemini Embedding Integration, RAG Logic Optimization, Zero-Hallucination Enforcement |
| Heni Patel | Frontend & Auth Developer | JWT Authentication, Login / Signup / Reset Password UI, Frontend State Management |
| Gagan | Database & DevOps Specialist | MongoDB Atlas Vector Indexing, Schema Design, Git Branching Strategy, Knowledge Base Storage |

---

## 🧠 System Architecture Overview

DocSens-AI follows a **multi-layered RAG architecture**:

1. **Document Ingestion**
   - PDF upload
   - Text extraction
   - Page-aware chunking

2. **Vectorization**
   - Embeddings generated using **Gemini AI**
   - Stored in **MongoDB Atlas Vector Index**

3. **Retrieval**
   - MongoDB Aggregation Pipeline
   - Top relevant chunks retrieved via semantic similarity

4. **Generation**
   - Query + context merged
   - Answer generated using **Groq LLM**
   - Source citation attached

---

## 📁 Project Structure

```text
DOCSENS_LEADER/
├── frontend/                 # React.js (Vite)
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, UI components
│   │   ├── pages/            # Login, ResetPassword, UserChat
│   │   └── App.jsx           # Routing
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express AI Server
│   ├── src/
│   │   ├── controllers/      # Auth + AI logic
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes (Gemini & Groq)
│   │   └── utils/            # RAG, chunking, vector search
│   ├── server.js
│   └── package.json
│
├── .env                      # API Keys (Ignored by Git)
├── .env.example              # Setup reference for examiner
├── .gitignore
└── README.md

```
### 📂 Directory Details
* **src/**: Contains core backend and frontend logic including controllers, routes, models, and RAG utilities.
* **.env**: Stores sensitive configuration such as API keys, database credentials, JWT secrets, and admin controls (Security Critical).
* **.env.example**: Template file provided for the examiner or reviewer to configure environment variables safely.

---

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Frontend:** React.js (Vite) with SSE support
* **AI Engine:** Groq Cloud (LLaMA 3.3 – 70B) & Google Gemini AI
* **Database:** MongoDB Atlas (Vector Search Enabled)
* **Embeddings:** Google Gemini Embeddings
* **Authentication:** JWT & Google OAuth
* **Environment:** Dotenv

---

## 📈 Development Roadmap

### ✅ Completed: Core Engine
* **Vector Search Pipeline:** MongoDB Atlas aggregation pipeline implemented for semantic retrieval.
* **Context Window Logic:** Optimized merging of user queries with top 5–6 SOP chunks to prevent context loss.
* **Source Citation Engine:** AI responses include exact document and chunk-level citations.
* **RBAC:** Head Admin, Admin, and User role enforcement.

### 🚧 In-Progress: User Experience
* **Real-time Streaming:** Server-Sent Events (SSE) for typewriter-style AI responses.
* **Admin Knowledge Base:** Upload, delete, and re-index SOP documents.
* **Persistence:** Full user chat history storage.
### 🚧 In-Progress: User Experience
* **Real-time Streaming:** Implementing Server-Sent Events (SSE) in React for a smooth chat experience.
* **Admin Knowledge Base:** Interface for authorized users to manage SOP documents.
* **Persistence:** Full chat history storage and retrieval.

---


## 🔐 Environment Variables Table

| Variable | Description |
| :--- | :--- |
| **PORT** | Server port where the backend runs (default: 5002) |
| **GROQ_API_KEY** | Groq Cloud API key used for fast LLM inference |
| **MODEL_NAME** | Groq LLM model name (e.g. `llama-3.3-70b-versatile`) |
| **GEMINI_API_KEY** | Google Gemini API key used for generating embeddings |
| **MONGO_URI** | MongoDB connection string (local or Atlas) |
| **MONGO_DB** | MongoDB database name (`docsens`) |
| **MONGO_COLLECTION** | Collection name where document chunks are stored (`chunks`) |
| **HEAD_ADMIN_EMAIL** | Email ID that is automatically assigned Head Admin role |
| **EMAIL_USER** | Email account used to send admin invitation tokens |
| **EMAIL_PASS** | Email password / app password for sending mails |
| **JWT_SECRET** | Secret key used for signing and verifying JWT tokens |
| **FRONTEND_URL** | Frontend application URL (e.g. `http://localhost:5173`) |
| **GOOGLE_CLIENT_SECRET** | Google OAuth client secret |
| **VITE_GOOGLE_CLIENT_ID** | Google OAuth Client ID (required by Vite frontend) |

---

# Docsens-AI

A full-stack AI-powered RAG system for SOP management and grounded Q&A with role-based access control (RBAC).

---

## System overview

- **Frontend:** Vite + React (http://localhost:5173)
- **Backend:** Node.js + Express + MongoDB
- **Vector store:** MongoDB Atlas with embedding fields
- **Embedding/LLM:** Gemini (embeddings + answer generation)
- **RBAC roles:** Head Admin, Admin, User

---

## Quick start

### Backend setup

1. **Install dependencies**
   - `npm install`
2. **Environment variables** (create `.env` in backend root)
   - `HEAD_ADMIN_EMAIL=your_email_here`
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=super_secret_string`
   - `EMBEDDING_PROVIDER=gemini`
   - `EMBEDDING_API_KEY=xxxxx`
   - `ALLOWED_ORIGINS=http://localhost:5173`
3. **Run backend (dev)**
   - `npm run dev` → `http://localhost:3000`

### Frontend setup

1. **Install dependencies**
   - `npm install`
2. **Environment variables** (create `.env` in frontend root)
   - `VITE_API_BASE_URL=http://localhost:3000`
3. **Run frontend (dev)**
   - `npm run dev` → `http://localhost:5173`

---

## Step-by-step workflow

### Step 3: Create user account (frontend)

- Open `http://localhost:5173`
- Signup/Register a new account
- After successful login, you land on the User Chat page
- Normal users can:
  - Ask questions
  - View AI-generated answers
  - See source citations

### Step 4: Head Admin auto assignment

- Set `HEAD_ADMIN_EMAIL` in backend `.env`
- First registration using that email becomes Head Admin
- Head Admin can:
  - Full system access
  - Invite new admins
  - Revoke admin permissions
  - Upload/delete/re-index SOP documents
  - Control which admins can manage documents

### Step 5: Invite admins (Head Admin only)

- Login with Head Admin email
- Open Admin Panel → Invitation Section
- Generate an invite token
- Share the token with another user
- Invited user registers using the token and becomes Admin

### Step 6: Admin permissions control

- Head Admin can:
  - Grant full access to sub-admins
  - Restrict file upload/delete
  - Enable/disable SOP management per admin
- Admins can:
  - Upload SOP PDF files
  - Delete SOP documents
  - Trigger re-indexing (if permitted)

### Step 7: Upload SOP & knowledge base creation

- Role: Admin / Head Admin
- Upload SOP PDF via Admin Dashboard or Postman
- System automatically:
  - Extracts text
  - Splits into chunks
  - Generates embeddings (Gemini)
  - Stores in MongoDB (vector fields)

### Step 8: Ask questions (User Chat)

- Login as User / Admin / Head Admin
- Go to User Chat page
- Ask questions in natural language
- System retrieves relevant chunks and generates AI answers with citations
- If not found in SOP:
  - Responds: “I don’t know based on the provided documents.”

### Step 9: Role-based access control (RBAC)

- Head Admin: Full system control
- Admin: SOP management (permission-based)
- User: Chat & query only
- RBAC enforced in backend APIs and frontend UI

### Step 10: Verify system working

- Backend APIs running ✔
- Frontend UI accessible ✔
- Vector search functioning ✔
- AI answers with citations ✔
- Role permissions enforced ✔

---

## API reference (Postman)

### Auth

- Register: `POST /api/auth/register`
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword!",
      "name": "Rajan",
      "inviteToken": "optional-if-admin"
    }
    ```
- Login: `POST /api/auth/login`
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword!"
    }
    ```

### Admin invitations

- Create invite token (Head Admin): `POST /api/admin/invitations`
  - Auth: Bearer JWT
  - Body:
    ```json
    {
      "role": "admin",
      "expiresInHours": 24
    }
    ```

### SOP documents

- Upload PDF: `POST /api/sops/upload`
  - Auth: Admin/Head Admin with permission
  - Type: `multipart/form-data`, field: `file`
  - Optional: `?reindex=true`
- Delete: `DELETE /api/sops/:id`
- Re-index: `POST /api/sops/:id/reindex`
- List: `GET /api/sops`

### Ask questions

- Query: `POST /api/sops/ask`
  - Body:
    ```json
    {
      "question": "What is the deviation handling SOP?",
      "topK": 5
    }
    ```

---

## Data model (high level)

- Users: email, passwordHash, name, role, permissions, createdAt
- Invitations: token, role, issuerId, expiresAt, usedAt
- SOP Documents: title, filename, mimeType, uploadedBy, status
- SOP Chunks: docId, text, section, pageRange, embedding, metadata (vector index on `embedding`)

---

## Frontend routes

- `/` Login / Signup
- `/chat` User chat page (all roles)
- `/admin` Admin panel (Admin/Head Admin)
- `/admin/invitations` Invite tokens (Head Admin)
- `/admin/sops` Upload / delete / re-index (permission-based)

---

## RBAC enforcement

- Backend:
  - JWT auth middleware (role + permission checks per route)
  - Head Admin supersedes all checks
- Frontend:
  - Role-based UI gating and route guards
  - Clear feedback for denied operations

---

## Operational notes

- Chunking: 800–1200 tokens for recall vs latency
- Embeddings: Batch with retries
- Citations: Include doc title + section snippet
- Re-index: Overwrites existing vectors
- Observability: Log request IDs and retrieval scores

---

## Troubleshooting

- Login loops:
  - Ensure `ALLOWED_ORIGINS` includes `http://localhost:5173`
  - Check system time (JWT validity)
- Head Admin not assigned:
  - `HEAD_ADMIN_EMAIL` must match registration email exactly
  - Ensure first registration used that email
- Upload fails:
  - Verify `multipart/form-data` and file size limits
  - Check permissions and JWT freshness
- No citations:
  - Ensure embeddings exist (re-index after upload)
  - Create vector index and set `topK > 0`
- Empty answers:
  - Fallback triggers when scores below threshold
  - Increase `topK` or adjust chunking

---

## Production readiness

- Secrets: Secure `JWT_SECRET`, separate env per environment
- CORS: Restrict `ALLOWED_ORIGINS` to prod domains
- HTTPS: Enforce TLS on client/server
- Rate limits: Per-role throttling on `ask`
- Auditing: Persist admin actions (invites, deletes, re-index)
- Backups: Regular MongoDB backups for docs and embeddings
- Monitoring: Track latency for upload, index, and ask flows

---

## Summary

- Frontend & backend run independently
- Head Admin controls the system and admin lifecycle
- Admins manage SOP knowledge base with permissions
- Users interact via chat; answers are grounded with citations

## Challenges & Solutions (Leadership Insights)

During the integration phase, we faced and resolved the following technical challenges:

- **Security & Data Privacy:**  
  Initially, sensitive configuration files (`.env`) were tracked by Git. We implemented professional security practices using `.gitignore` and cleared the Git cache to ensure no private API keys were exposed.

- **Vector Search Accuracy:**  
  Fine-tuning the MongoDB Atlas Vector Search aggregation pipeline was challenging. We optimized retrieval logic to ensure only the most relevant document chunks are passed to the LLM.

- **Context Window Management:**  
  We optimized merging of user queries with 5–6 retrieved text chunks to stay within LLM token limits while maintaining high answer accuracy.

- **API Integration:**  
  Mapping the JSON response from Gemini AI to our MongoDB schema required precise logic to ensure data accuracy and schema consistency.

- **Large Commits:**  
  We handled large repository sync issues by restructuring the project and excluding heavy folders like `node_modules` from the remote repository.

## ⚠️ Limitations

While the core system is stable, we have identified the following limitations during testing:

- **Strict Document Context:** AI answers only from retrieved chunks; missing info in PDFs leads to declined responses.  
- **Single File Focus:** Current version optimized for one PDF at a time.  
- **Text-Only Extraction:** Cannot read text from images or handwritten notes inside PDFs (OCR required).  
- **API Rate Limits:** Performance depends on free tier limits of Gemini (embeddings) and Groq (inference).  
- **Cold Start:** Free cloud tiers (MongoDB Atlas) may cause slight delays on first query while connection wakes up.  

---

## 🏁 Conclusion

The **DocSens-AI** project successfully demonstrates the integration of **Generative AI (Gemini/Groq)** with **Vector Databases (MongoDB Atlas)** to create a functional RAG pipeline.  
Our team managed to build a system that can **extract, embed, and query PDF data with high accuracy**, ensuring a **seamless user experience** for document-based chat.

---
