# EchoVault Deployment Guide

## Prerequisites

1. **Node.js 18+** - Install from nodejs.org
2. **Supabase Account** - Sign up at supabase.com
3. **Ollama** - Install from ollama.ai (for local AI)

---

## Step 1: Set Up Supabase

### 1.1 Create a New Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name: `echovault`
4. Generate a strong password and note it
5. Choose a region close to you
6. Click "Create new project"

### 1.2 Run Database Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_vector_search.sql`
3. Click **Run** to execute

### 1.3 Get API Credentials
1. Go to **Settings → API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## Step 2: Set Up Ollama (Local AI)

### 2.1 Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.2 Pull Required Models
```bash
# Embedding model for semantic search
ollama pull nomic-embed-text

# Chat model for AI responses
ollama pull llama3.2
```

### 2.3 Verify Ollama is Running
```bash
ollama list
# Should show: nomic-embed-text and llama3.2
```

---

## Step 3: Configure Environment

### 3.1 Update .env.local
Edit `.env.local` with your actual credentials:

```env
# Supabase (from Step 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Ollama (from Step 2)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Run Locally

### 4.1 Install Dependencies
```bash
cd echovault
npm install
```

### 4.2 Start Development Server
```bash
npm run dev
```

### 4.3 Access the App
Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Deploy to Vercel

### 5.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 5.2 Deploy
```bash
vercel login
vercel
```

### 5.3 Add Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OLLAMA_BASE_URL`
   - `OLLAMA_MODEL`
   - `OLLAMA_EMBEDDING_MODEL`
   - `NEXT_PUBLIC_APP_URL`

### 5.4 Important: Remote Ollama Required
For Vercel deployment, you need a **remote Ollama instance** because:
- Vercel serverless functions can't access localhost
- Options:
  1. Use [Ollama Cloud](https://ollama.com/cloud) (recommended)
  2. Set up Ollama on a cloud VM (AWS, GCP, etc.)
  3. Use a different LLM API (OpenAI, Anthropic, etc.)

Update `OLLAMA_BASE_URL` to your remote Ollama endpoint.

---

## Troubleshooting

### "Ollama not connected"
- Make sure Ollama is running: `ollama serve`
- Check the port: `OLLAMA_BASE_URL` should be `http://localhost:11434`

### "Vector search not working"
- Ensure pgvector extension is enabled in Supabase
- Check that the `match_knowledge_items` function was created

### "Auth errors"
- Verify Supabase URL and anon key are correct
- Check that `NEXT_PUBLIC_` prefix is used for public variables

### Build errors
- Delete `.next` folder: `rm -rf .next`
- Clear npm cache: `npm cache clean --force`
- Rebuild: `npm run build`

---

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────►│   Vercel    │────►│  Supabase   │
│  (Next.js)  │     │  (Server)   │     │ (Database)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Ollama    │
                    │  (Local AI) │
                    └─────────────┘
```

---

## Next Steps

After deployment:
1. Add sample knowledge items
2. Try semantic search
3. Test the AI chat
4. Generate insights
5. Explore the knowledge graph

Enjoy your personal knowledge OS!
