<div align="center">

# MegaRAG

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
<img src="https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini" />

### Chat With Your Files Using AI

Upload any document, video, or image. Ask questions. Get answers with sources.

</div>

---

## Table of Contents

1. [What is This?](#-what-is-this)
2. [How Does It Work?](#-how-does-it-work)
3. [What You'll Need](#-what-youll-need)
4. [Complete Setup Guide](#-complete-setup-guide)
5. [Using the App](#-using-the-app)
6. [How the Code Works](#-how-the-code-works)
7. [Troubleshooting](#-troubleshooting)
8. [Deploying to Production](#-deploying-to-production)

---

## 🤔 What is This?

MegaRAG is a **RAG system**. RAG stands for **Retrieval-Augmented Generation**.

### The Problem RAG Solves

Imagine you have 100 PDF documents about your company. You want to ask questions like "What was our revenue in Q3?" or "Who is responsible for the marketing budget?"

**Without RAG:** You'd have to manually search through all 100 documents to find the answer.

**With RAG:** You just ask the question, and the AI finds the relevant information and answers you.

### How RAG Works (Simple Explanation)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   1. UPLOAD                    2. PROCESS                    3. STORE      │
│   ────────                     ───────────                   ─────────     │
│                                                                             │
│   You upload a PDF    →    AI reads it and breaks     →    We save the     │
│   or video or image        it into small pieces            pieces in a     │
│                            called "chunks"                  database       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   4. QUESTION                  5. SEARCH                     6. ANSWER     │
│   ───────────                  ──────────                    ──────────    │
│                                                                             │
│   You ask: "What      →    We find the chunks        →    AI reads those   │
│   was Q3 revenue?"         most relevant to               chunks and       │
│                            your question                   writes an       │
│                                                            answer          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What Makes MegaRAG Special?

Most RAG systems only work with text. MegaRAG works with **everything**:

| File Type | What MegaRAG Does With It |
|-----------|---------------------------|
| **PDF** | Extracts all text, tables, and images |
| **Word/PowerPoint/Excel** | Extracts content from Microsoft Office files |
| **Images** | AI describes what's in the image so you can search for it |
| **Videos** | AI watches the video and creates searchable descriptions |
| **Audio** | AI transcribes speech to searchable text |
| **Text files** | Reads and indexes the content |

---

## 🔧 How Does It Work?

### The Technology Stack (What Each Piece Does)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR BROWSER                                   │
│                                                                             │
│   You interact with a web app built with Next.js (React framework)         │
│   This is the "frontend" - what you see and click on                       │
│                                                                             │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS SERVER                                 │
│                                                                             │
│   The "backend" - handles your requests, processes files, talks to AI      │
│   Written in TypeScript (JavaScript with types)                            │
│                                                                             │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
                    ▼                                     ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│           SUPABASE                │   │           GOOGLE GEMINI           │
│                                   │   │                                   │
│   Database + File Storage         │   │   AI that understands content     │
│                                   │   │                                   │
│   • Stores your documents         │   │   • Reads PDFs and images         │
│   • Stores text chunks            │   │   • Watches videos                │
│   • Stores "embeddings" (below)   │   │   • Transcribes audio             │
│   • Enables vector search         │   │   • Generates answers             │
│                                   │   │   • Creates embeddings            │
└───────────────────────────────────┘   └───────────────────────────────────┘
```

### What Are "Embeddings"? (The Magic Behind Search)

This is the key concept that makes RAG work. Here's a simple explanation:

**The Problem:** Computers don't understand meaning. To a computer, "dog" and "puppy" are completely different words, even though they mean similar things.

**The Solution:** Embeddings convert text into numbers that capture meaning.

```
"I love dogs"     → [0.2, 0.8, 0.1, 0.5, ...]  (768 numbers)
"I adore puppies" → [0.2, 0.7, 0.1, 0.6, ...]  (768 numbers - similar!)
"I hate cats"     → [0.9, 0.1, 0.8, 0.2, ...]  (768 numbers - different!)
```

When you search, we convert your question to numbers, then find the stored text whose numbers are most similar. This is called **vector search** or **semantic search**.

**Why 768 numbers?** That's how many dimensions Google's embedding model uses. More dimensions = more nuanced understanding.

### What is "pgvector"?

PostgreSQL (the database) doesn't normally support searching by number similarity. **pgvector** is an extension that adds this capability. It lets us:

1. Store 768-dimensional vectors (embeddings)
2. Search for similar vectors efficiently
3. Use special indexes (HNSW) for fast search

---

## 📋 What You'll Need

Before starting, you need accounts with these services (all have free tiers):

### 1. Node.js (Required)

**What it is:** The runtime that executes JavaScript/TypeScript on your computer.

**Why we need it:** Our app is built with Next.js, which requires Node.js.

**How to get it:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Verify it worked by opening Terminal/Command Prompt and typing:
   ```bash
   node --version
   ```
   You should see something like `v18.17.0` or higher.

### 2. Supabase Account (Required)

**What it is:** A hosted PostgreSQL database with extra features.

**Why we need it:**
- Stores our documents and their chunks
- Has pgvector for semantic search
- Provides file storage for uploads
- Free tier is generous (500MB database, 1GB storage)

**How to get it:**
1. Go to [supabase.com](https://supabase.com/)
2. Click "Start your project"
3. Sign up with GitHub (easiest) or email
4. You'll create a project in the setup steps below

### 3. Google AI API Key (Required)

**What it is:** Access to Google's Gemini AI models.

**Why we need it:**
- Gemini reads and understands your documents
- Gemini creates embeddings for search
- Gemini generates answers to your questions
- Free tier: 15 requests/minute, 1 million tokens/day

**How to get it:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. **Save this somewhere safe** - you'll need it later

---

## 🚀 Complete Setup Guide

### Step 1: Get the Code

Open your Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
# Clone the repository (download the code)
git clone https://github.com/promptadvisers/megarag.git

# Navigate into the project folder
cd megarag

# Install dependencies (download all the libraries we need)
npm install
```

**What just happened?**
- `git clone` downloaded all the source code
- `cd megarag` moved you into the project folder
- `npm install` read `package.json` and downloaded ~200 packages we depend on

### Step 2: Create Your Supabase Project

1. **Go to [supabase.com](https://supabase.com/)** and sign in

2. **Click "New Project"** and fill in:
   - **Name:** `megarag` (or whatever you want)
   - **Database Password:** Generate a strong one and **save it**
   - **Region:** Pick the closest to you
   - **Plan:** Free tier is fine

3. **Wait 2 minutes** for the project to be created

4. **Get your credentials:**
   - Click **Settings** (gear icon) → **API**
   - Copy these three values:
     - **Project URL:** `https://xxxx.supabase.co`
     - **anon public key:** `eyJhbGci...` (the shorter one)
     - **service_role secret key:** `eyJhbGci...` (the longer one, keep this SECRET)

### Step 3: Set Up the Database

Now we need to create tables and enable vector search. Go to **SQL Editor** in Supabase (left sidebar).

**Why do we need to run SQL?**

Supabase gives us an empty database. We need to create:
- **Tables** to store our data
- **Indexes** to make searches fast
- **Functions** to search by similarity

**Run these SQL commands one at a time** (copy, paste, click "Run"):

---

#### 3.1: Enable Vector Search

```sql
-- This enables the pgvector extension
-- pgvector lets us store and search embeddings (those 768-number arrays)
CREATE EXTENSION IF NOT EXISTS vector;
```

**What this does:** Installs pgvector so PostgreSQL can handle vector operations.

---

#### 3.2: Create the Documents Table

```sql
-- This table stores information about each file you upload
CREATE TABLE documents (
    id VARCHAR(255) PRIMARY KEY,           -- Unique identifier for each document
    workspace VARCHAR(255) DEFAULT 'default', -- For multi-tenant support (ignore for now)
    file_name VARCHAR(1024) NOT NULL,      -- Original filename like "report.pdf"
    file_type VARCHAR(50) NOT NULL,        -- Extension like "pdf", "mp4", "png"
    file_size BIGINT,                      -- Size in bytes
    file_path TEXT,                        -- Where it's stored in Supabase Storage
    status VARCHAR(64) DEFAULT 'pending',  -- pending, processing, processed, failed
    chunks_count INTEGER DEFAULT 0,        -- How many chunks were created
    error_message TEXT,                    -- Error details if processing failed
    metadata JSONB DEFAULT '{}'::jsonb,    -- Extra data (flexible JSON field)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes make queries faster
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_file_type ON documents(file_type);
```

**What this does:** Creates a table to track every file you upload - its name, size, processing status, etc.

---

#### 3.3: Create the Chunks Table

```sql
-- This table stores the actual content broken into searchable pieces
CREATE TABLE chunks (
    id VARCHAR(255) PRIMARY KEY,           -- Unique identifier
    workspace VARCHAR(255) DEFAULT 'default',
    document_id VARCHAR(255) REFERENCES documents(id) ON DELETE CASCADE,
    -- ^ Links to the parent document. CASCADE means: if document is deleted, delete its chunks too
    chunk_order_index INTEGER,             -- Which chunk is this? (1st, 2nd, 3rd...)
    content TEXT NOT NULL,                 -- The actual text content
    content_vector VECTOR(768),            -- The embedding (768 numbers representing meaning)
    tokens INTEGER,                        -- How many tokens (roughly words) in this chunk
    chunk_type VARCHAR(50) DEFAULT 'text', -- text, image, table, video_segment, audio
    page_idx INTEGER,                      -- Which page (for PDFs)
    timestamp_start FLOAT,                 -- Start time (for video/audio)
    timestamp_end FLOAT,                   -- End time (for video/audio)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regular index for finding chunks by document
CREATE INDEX idx_chunks_document_id ON chunks(document_id);

-- HNSW index for fast vector similarity search
-- This is the magic that makes semantic search fast
CREATE INDEX idx_chunks_vector ON chunks
USING hnsw (content_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

**What this does:**
- Stores text chunks with their embeddings
- The HNSW index makes vector search fast (without it, we'd have to compare against every chunk)
- `vector_cosine_ops` means we measure similarity using cosine distance

---

#### 3.4: Create the Entities Table

```sql
-- This table stores extracted entities (people, places, companies, etc.)
-- This is part of the "knowledge graph" feature
CREATE TABLE entities (
    id VARCHAR(255) PRIMARY KEY,
    workspace VARCHAR(255) DEFAULT 'default',
    entity_name VARCHAR(512) NOT NULL,     -- e.g., "Apple Inc."
    entity_type VARCHAR(128),              -- e.g., "ORGANIZATION"
    description TEXT,                      -- Context about this entity
    content_vector VECTOR(768),            -- Embedding for searching entities
    source_chunk_ids JSONB DEFAULT '[]'::jsonb, -- Which chunks mention this entity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entities_name ON entities(entity_name);
CREATE INDEX idx_entities_vector ON entities
USING hnsw (content_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

**What this does:** Stores entities we extract from documents. For example, if your document mentions "Tim Cook" multiple times, we create one entity for him with a description.

---

#### 3.5: Create the Relations Table

```sql
-- This table stores relationships between entities
-- e.g., "Tim Cook" --[CEO_OF]--> "Apple Inc."
CREATE TABLE relations (
    id VARCHAR(255) PRIMARY KEY,
    workspace VARCHAR(255) DEFAULT 'default',
    source_entity_id VARCHAR(512),         -- e.g., "Tim Cook"
    target_entity_id VARCHAR(512),         -- e.g., "Apple Inc."
    relation_type VARCHAR(256),            -- e.g., "CEO_OF"
    description TEXT,                      -- More context about the relationship
    content_vector VECTOR(768),            -- Embedding for searching relationships
    source_chunk_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_relations_source ON relations(source_entity_id);
CREATE INDEX idx_relations_target ON relations(target_entity_id);
CREATE INDEX idx_relations_vector ON relations
USING hnsw (content_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

**What this does:** Stores how entities relate to each other. This enables questions like "Who works at Apple?" or "What companies has Tim Cook led?"

---

#### 3.6: Create Search Functions

```sql
-- Function to search chunks by semantic similarity
-- This is called when you ask a question
CREATE OR REPLACE FUNCTION search_chunks(
    query_embedding VECTOR(768),           -- Your question converted to numbers
    match_threshold FLOAT DEFAULT 0.3,     -- Minimum similarity (0-1, higher = stricter)
    match_count INT DEFAULT 10             -- How many results to return
) RETURNS TABLE (
    id VARCHAR,
    document_id VARCHAR,
    content TEXT,
    chunk_type VARCHAR,
    similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.document_id, c.content, c.chunk_type,
           1 - (c.content_vector <=> query_embedding) AS similarity
           -- ^ <=> is the cosine distance operator from pgvector
           -- We subtract from 1 to convert distance to similarity
    FROM chunks c
    WHERE c.content_vector IS NOT NULL
      AND 1 - (c.content_vector <=> query_embedding) > match_threshold
    ORDER BY c.content_vector <=> query_embedding  -- Most similar first
    LIMIT match_count;
END; $$;

-- Similar function for entities
CREATE OR REPLACE FUNCTION search_entities(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 20
) RETURNS TABLE (
    id VARCHAR,
    entity_name VARCHAR,
    entity_type VARCHAR,
    description TEXT,
    similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.entity_name, e.entity_type, e.description,
           1 - (e.content_vector <=> query_embedding) AS similarity
    FROM entities e
    WHERE e.content_vector IS NOT NULL
      AND 1 - (e.content_vector <=> query_embedding) > match_threshold
    ORDER BY e.content_vector <=> query_embedding
    LIMIT match_count;
END; $$;

-- Similar function for relations
CREATE OR REPLACE FUNCTION search_relations(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 20
) RETURNS TABLE (
    id VARCHAR,
    source_entity_id VARCHAR,
    target_entity_id VARCHAR,
    relation_type VARCHAR,
    description TEXT,
    similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.source_entity_id, r.target_entity_id, r.relation_type, r.description,
           1 - (r.content_vector <=> query_embedding) AS similarity
    FROM relations r
    WHERE r.content_vector IS NOT NULL
      AND 1 - (r.content_vector <=> query_embedding) > match_threshold
    ORDER BY r.content_vector <=> query_embedding
    LIMIT match_count;
END; $$;
```

**What this does:** Creates reusable functions that:
1. Take your question's embedding
2. Find the most similar chunks/entities/relations
3. Return them ranked by relevance

---

#### 3.7: Create Storage Bucket

This one isn't SQL - do it in the Supabase dashboard:

1. Click **Storage** in the left sidebar
2. Click **New bucket**
3. Name it exactly: `documents`
4. Keep **Public bucket** toggled **OFF** (private)
5. Set **File size limit** to `104857600` (100MB in bytes)
6. Click **Create bucket**

**What this does:** Creates a place to store the actual files (PDFs, videos, etc.). The database only stores metadata and text - the original files go here.

---

### Step 4: Configure Environment Variables

Back in your terminal, in the megarag folder:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Now open `.env.local` in any text editor and fill in your values:

```env
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# These connect your app to your Supabase database

# Your project URL (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon key - safe to expose in browser (from Settings → API)
# Looks like: eyJhbGc... (a long string)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard

# Service role key - KEEP THIS SECRET (from Settings → API)
# This key has full access to your database
# Looks like: eyJhbGc... (a long string, different from anon key)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard

# ===========================================
# GOOGLE AI CONFIGURATION
# ===========================================
# Your Gemini API key (from aistudio.google.com/apikey)
GOOGLE_AI_API_KEY=AIzaSyYourApiKeyHere
```

**Why two Supabase keys?**
- **Anon key:** Used in the browser. Has limited permissions based on Row Level Security rules.
- **Service role key:** Used on the server only. Bypasses all security - that's why we keep it secret.

---

### Step 5: Start the App

```bash
npm run dev
```

You should see:

```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
```

**Open [http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📱 Using the App

### The Dashboard (`/dashboard`)

This is your home base. Here you can:

1. **Upload files** - Drag and drop or click to select
2. **See your documents** - With processing status (Ready, Processing, Failed)
3. **Search documents** - Filter by status or search by name
4. **Delete documents** - With 5-second undo

### The Chat Interface (`/dashboard/chat`)

This is where you ask questions. Here's what the options mean:

**Query Modes:**

| Mode | What it Does | When to Use It |
|------|--------------|----------------|
| **Naive** | Searches chunks directly | Simple questions with obvious keywords |
| **Local** | Finds entities first, then their chunks | "Who is [person]?" "What is [thing]?" |
| **Global** | Follows relationships between entities | "How does X relate to Y?" |
| **Hybrid** | Combines Local + Global | Complex questions |
| **Mix** | All of the above combined | Default - works for everything |

### The Data Explorer (`/dashboard/explorer`)

This lets you see what's "under the hood":
- Browse all extracted chunks
- See entities and their types
- View relationships between entities
- Understand what the AI learned from your documents

---

## 🔍 How the Code Works

### Project Structure

```
megarag/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard (/dashboard)
│   │   │   ├── chat/page.tsx         # Chat (/dashboard/chat)
│   │   │   └── explorer/page.tsx     # Explorer (/dashboard/explorer)
│   │   └── api/                      # Backend API routes
│   │       ├── upload/route.ts       # POST /api/upload
│   │       ├── documents/route.ts    # GET, DELETE /api/documents
│   │       ├── query/route.ts        # POST /api/query
│   │       └── chat/                 # Chat session APIs
│   │
│   ├── components/                   # React components
│   │   ├── DocumentUploader.tsx      # File upload with drag-drop
│   │   ├── DocumentList.tsx          # Document list with filters
│   │   ├── ChatInterface.tsx         # Chat UI
│   │   └── ...
│   │
│   ├── lib/                          # Core logic
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser database client
│   │   │   └── server.ts             # Server database client
│   │   ├── gemini/
│   │   │   ├── client.ts             # Gemini AI client
│   │   │   └── embeddings.ts         # Create embeddings
│   │   ├── processing/
│   │   │   ├── router.ts             # Routes files to processors
│   │   │   ├── text-processor.ts     # Handles .txt, .md
│   │   │   ├── image-processor.ts    # Handles images
│   │   │   ├── video-processor.ts    # Handles videos
│   │   │   ├── audio-processor.ts    # Handles audio
│   │   │   └── entity-extractor.ts   # Extracts entities/relations
│   │   └── rag/
│   │       ├── retriever.ts          # Searches for relevant content
│   │       └── response-generator.ts # Generates AI answers
│   │
│   └── types/                        # TypeScript type definitions
│       └── index.ts
│
├── .env.local                        # Your environment variables (secret!)
├── .env.example                      # Template for env vars
├── package.json                      # Dependencies and scripts
└── README.md                         # This file!
```

### What Happens When You Upload a File

```
1. Browser: You drop a file
                    │
                    ▼
2. DocumentUploader.tsx: Creates FormData, sends to API
                    │
                    ▼
3. /api/upload/route.ts:
   - Saves file to Supabase Storage
   - Creates record in documents table with status='pending'
   - Triggers processing asynchronously
                    │
                    ▼
4. lib/processing/router.ts:
   - Looks at file extension
   - Routes to appropriate processor
                    │
                    ├── .txt/.md → text-processor.ts
                    ├── .pdf/.docx → document-processor.ts (uses Gemini)
                    ├── .png/.jpg → image-processor.ts (uses Gemini Vision)
                    ├── .mp4/.mov → video-processor.ts (uses Gemini File API)
                    └── .mp3/.wav → audio-processor.ts (uses Gemini File API)
                    │
                    ▼
5. Processor creates chunks:
   - Splits content into ~800 token pieces
   - Generates embedding for each chunk
   - Extracts entities and relationships
                    │
                    ▼
6. Saves to database:
   - Chunks → chunks table
   - Entities → entities table
   - Relations → relations table
   - Updates document status to 'processed'
```

### What Happens When You Ask a Question

```
1. Browser: You type "What was Q3 revenue?"
                    │
                    ▼
2. ChatInterface.tsx: Sends POST to /api/query
                    │
                    ▼
3. /api/query/route.ts:
   - Receives query and mode (e.g., "mix")
   - Calls retriever
                    │
                    ▼
4. lib/rag/retriever.ts:
   - Converts question to embedding (768 numbers)
   - Based on mode, searches:
     - Naive: Just chunks
     - Local: Entities → their chunks
     - Global: Relations → connected entities → chunks
     - Mix: All of the above
   - Returns relevant chunks with similarity scores
                    │
                    ▼
5. lib/rag/response-generator.ts:
   - Builds context from retrieved chunks
   - Creates prompt for Gemini:
     "Based on these sources: [chunks]
      Answer this question: [question]
      Cite your sources as [Source 1], [Source 2], etc."
   - Sends to Gemini, gets response
                    │
                    ▼
6. Returns to browser:
   {
     response: "Q3 revenue was $50M [Source 1]...",
     sources: [{id, content, document_name, similarity}],
     entities: [{name, type}]
   }
```

---

## 🚨 Troubleshooting

### "Cannot find module" errors

**Problem:** Dependencies aren't installed.

**Solution:**
```bash
npm install
```

### "Invalid API key" from Gemini

**Problem:** Your Google AI API key is wrong or not set.

**Solution:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create a new key or copy your existing one
3. Make sure `.env.local` has `GOOGLE_AI_API_KEY=AIza...` (no quotes needed)
4. Restart the dev server (`Ctrl+C` then `npm run dev`)

### "relation 'documents' does not exist"

**Problem:** Database tables weren't created.

**Solution:** Go back to Step 3 and run all the SQL commands in Supabase SQL Editor.

### Files stuck on "Processing"

**Problem:** Processing failed silently.

**Solutions:**
1. Check browser console (F12 → Console) for errors
2. Check Supabase logs (Logs in sidebar)
3. Make sure your Supabase service role key is correct
4. For videos/audio, files must be under 1GB

### "CORS" errors

**Problem:** Browser security blocking requests.

**Solution:** Make sure `NEXT_PUBLIC_SUPABASE_URL` exactly matches your project URL (including `https://`).

### Searches return nothing

**Problem:** Embeddings might not be generated.

**Solutions:**
1. Check if chunks have `content_vector` values in Supabase Table Editor
2. Make sure `GOOGLE_AI_API_KEY` is valid
3. Try re-uploading a document

---

## 🚀 Deploying to Production

### Option 1: Vercel (Easiest)

Vercel made Next.js, so deployment is seamless:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import your GitHub repo
4. Add environment variables (same as `.env.local`)
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/promptadvisers/megarag)

### Option 2: Any Node.js Host

```bash
# Build for production
npm run build

# Start production server
npm start
```

Works on: Railway, Render, Fly.io, AWS, DigitalOcean, etc.

### Environment Variables for Production

Same as development, but make sure:
- `SUPABASE_SERVICE_ROLE_KEY` is set as a secret (not visible in logs)
- `GOOGLE_AI_API_KEY` is set as a secret

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Deep dive into system architecture with diagrams
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[CONVERSATION_LOG.md](CONVERSATION_LOG.md)** - How this project was built

### Learning Resources

- [What is RAG?](https://www.pinecone.io/learn/retrieval-augmented-generation/) - Pinecone's explanation
- [Vector Embeddings Explained](https://www.youtube.com/watch?v=5MaWmXwxFNQ) - Visual explanation
- [pgvector Documentation](https://github.com/pgvector/pgvector) - The extension we use
- [Next.js Documentation](https://nextjs.org/docs) - Framework docs
- [Supabase Documentation](https://supabase.com/docs) - Database docs

---

## 🤝 Contributing

Found a bug? Want to add a feature? Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b my-feature`
3. Make your changes
4. Submit a Pull Request

---

## 📄 License

MIT License - do whatever you want with it!

---

<div align="center">

**Questions?** Open an issue on GitHub.

Made with ❤️ by [Prompt Advisers](https://github.com/promptadvisers)

</div>
