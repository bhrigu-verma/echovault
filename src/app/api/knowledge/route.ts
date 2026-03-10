import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, content_type, metadata } = body

    // Create knowledge item
    const { data: item, error: itemError } = await supabase
      .from('knowledge_items')
      .insert({
        user_id: user.id,
        title,
        content,
        content_type: content_type || 'note',
        metadata: metadata || {},
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Generate embedding if content exists
    if (content) {
      try {
        const embedding = await generateEmbedding(`${title} ${content}`)

        await supabase
          .from('embeddings')
          .insert({
            item_id: item.id,
            embedding,
            model: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
          })
      } catch (embeddingError) {
        console.error('Embedding generation failed:', embeddingError)
        // Continue without embedding - item is still created
      }
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'
    const content_type = searchParams.get('content_type')

    let query = supabase
      .from('knowledge_items')
      .select('*, tags(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (content_type) {
      query = query.eq('content_type', content_type)
    }

    const { data: items, error } = await query

    if (error) throw error

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching knowledge items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
