# EchoVault - Setup & Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Ollama (for local AI)

## Local Development Setup

### 1. Clone and Install

```bash
cd echovault
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Ollama (Local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/`:
   - `001_initial_schema.sql`
   - `002_vector_search.sql`
3. Get your API keys from Project Settings > API

### 4. Set up Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull required models
ollama pull nomic-embed-text
ollama pull llama3.2
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

### 1. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### 2. Configure Environment Variables

In Vercel dashboard, add these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OLLAMA_BASE_URL` (for server-side AI)
- `OLLAMA_MODEL`
- `OLLAMA_EMBEDDING_MODEL`

### 3. Edge Function Considerations

For production, consider:
- Using Supabase Edge Functions for AI processing
- Setting up a remote Ollama server
- Using Vercel Edge Runtime where possible

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      ECHOVAULT STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Frontend  │◄──►│  Supabase   │◄──►│   Ollama    │    │
│  │  Next.js 15 │    │  PostgreSQL │    │  (Local AI) │    │
│  │             │    │  + pgvector │    │             │    │
│  │  - React    │    │  - Auth     │    │  - Embed    │    │
│  │  - Tailwind │    │  - Storage  │    │  - Chat     │    │
│  │  - Framer   │    │  - Realtime │    │             │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **Semantic Search** - AI-powered search using vector embeddings
- **RAG Chat** - Chat with your knowledge base
- **Knowledge Graph** - Visual connections between items
- **AI Insights** - Automatic insights and connections
- **Local-First** - Your data stays on your machine

## Troubleshooting

### Ollama not running
```bash
ollama serve
```

### Database connection issues
- Verify Supabase credentials in `.env.local`
- Check RLS policies are set up correctly

### Build errors
```bash
rm -rf .next
npm run build
```
