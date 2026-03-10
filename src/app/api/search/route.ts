import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, limit = 10 } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Generate embedding for query
    let embedding
    try {
      embedding = await generateEmbedding(query)
    } catch (error) {
      console.error('Embedding generation failed:', error)
      // Fallback to simple text search
      const { data: items, error: searchError } = await supabase
        .from('knowledge_items')
        .select('*, tags(*)')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(limit)

      if (searchError) throw searchError

      // Save search history
      await supabase.from('search_history').insert({
        user_id: user.id,
        query,
        results: items,
      })

      return NextResponse.json({ results: items, mode: 'text' })
    }

    // Vector similarity search
    const { data: results, error: searchError } = await supabase.rpc(
      'match_knowledge_items',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        user_id: user.id,
      }
    )

    if (searchError) {
      console.error('Vector search failed:', searchError)
      // Fallback to text search
      const { data: items, error: fallbackError } = await supabase
        .from('knowledge_items')
        .select('*, tags(*)')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(limit)

      if (fallbackError) throw fallbackError

      return NextResponse.json({ results: items, mode: 'text' })
    }

    // Get full items with tags
    const itemIds = results.map((r: { id: string }) => r.id)
    const { data: items } = await supabase
      .from('knowledge_items')
      .select('*, tags(*)')
      .in('id', itemIds)

    // Save search history
    await supabase.from('search_history').insert({
      user_id: user.id,
      query,
      results: items,
    })

    return NextResponse.json({ results: items, mode: 'semantic' })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
