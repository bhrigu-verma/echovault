-- EchoVault Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Items table
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT CHECK (content_type IN ('note', 'pdf', 'image', 'audio', 'webclip')) DEFAULT 'note',
  file_path TEXT,
  metadata JSONB DEFAULT '{}',
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Knowledge Item Tags (many-to-many)
CREATE TABLE IF NOT EXISTS item_tags (
  item_id UUID REFERENCES knowledge_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (item_id, tag_id)
);

-- Connections (knowledge graph edges)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_item_id UUID REFERENCES knowledge_items(id) ON DELETE CASCADE,
  target_item_id UUID REFERENCES knowledge_items(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'semantic',
  strength FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, source_item_id, target_item_id)
);

-- Insights (AI-generated)
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  insight_type TEXT CHECK (insight_type IN ('daily_summary', 'connection', 'spark')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Embeddings table (using pgvector)
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES knowledge_items(id) ON DELETE CASCADE,
  embedding VECTOR(768),
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_items_user_id ON knowledge_items(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_created_at ON knowledge_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_item_id ON embeddings(item_id);

-- Vector similarity search index (IVF)
CREATE INDEX IF NOT EXISTS idx_embeddings_embedding ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for knowledge_items
CREATE POLICY "Users can view their own knowledge items" ON knowledge_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own knowledge items" ON knowledge_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own knowledge items" ON knowledge_items
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own knowledge items" ON knowledge_items
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tags" ON tags
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for connections
CREATE POLICY "Users can view their own connections" ON connections
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own connections" ON connections
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for insights
CREATE POLICY "Users can view their own insights" ON insights
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own insights" ON insights
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for embeddings
CREATE POLICY "Users can view their own embeddings" ON embeddings
  FOR SELECT USING (
    item_id IN (SELECT id FROM knowledge_items WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own embeddings" ON embeddings
  FOR ALL USING (
    item_id IN (SELECT id FROM knowledge_items WHERE user_id = auth.uid())
  );

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for knowledge_items
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
