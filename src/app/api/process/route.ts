import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { item_id, content } = body

    if (!item_id || !content) {
      return NextResponse.json({ error: 'item_id and content required' }, { status: 400 })
    }

    // Generate embedding
    const embedding = await generateEmbedding(content)

    // Store embedding
    await supabase.from('embeddings').insert({
      item_id,
      embedding,
      model: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    })

    // Mark item as processed
    await supabase
      .from('knowledge_items')
      .update({ is_processed: true })
      .eq('id', item_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
