-- Add vector search function for pgvector
-- Run this in Supabase SQL Editor after the initial schema

-- Function to match knowledge items using vector similarity
CREATE OR REPLACE FUNCTION match_knowledge_items(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE (
  id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ki.id,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM knowledge_items ki
  JOIN embeddings e ON e.item_id = ki.id
  WHERE ki.user_id = match_knowledge_items.user_id
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-files', 'knowledge-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for knowledge files
CREATE POLICY "Users can upload knowledge files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'knowledge-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'knowledge-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
