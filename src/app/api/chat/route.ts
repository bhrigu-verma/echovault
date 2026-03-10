import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding, generateCompletion } from '@/lib/ollama'
import { KnowledgeItem } from '@/types'

interface SearchResult {
  id: string
  title: string
  content: string
  content_type: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, history = [] } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Generate embedding for query
    let embedding
    try {
      embedding = await generateEmbedding(message)
    } catch (error) {
      console.error('Embedding generation failed:', error)
      return NextResponse.json({
        error: 'Failed to generate embedding. Please ensure Ollama is running.'
      }, { status: 500 })
    }

    // Search for relevant context
    const { data: results, error: searchError } = await supabase.rpc(
      'match_knowledge_items',
      {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 5,
        user_id: user.id,
      }
    )

    let sources: SearchResult[] = []
    let context = ''

    if (!searchError && results?.length > 0) {
      const itemIds = results.map((r: { id: string }) => r.id)
      const { data: items } = await supabase
        .from('knowledge_items')
        .select('id, title, content, content_type')
        .in('id', itemIds)

      sources = items || []
      context = items
        ?.map((item, idx) => `[${idx + 1}] ${item.title}\n${item.content}`)
        .join('\n\n') || ''
    }

    // Build system prompt
    const systemPrompt = `You are a helpful AI assistant that helps the user explore their personal knowledge base.
Use the provided context from the user's knowledge base to answer questions accurately.
If the context doesn't contain relevant information, say so clearly.
Always cite your sources by mentioning the relevant item titles.

Context from knowledge base:
${context || 'No relevant context found in knowledge base.'}

Guidelines:
- Be concise and helpful
- If citing sources, mention them by title
- If you don't know something, say so honestly`

    // Build messages array for chat API
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Generate response using chat API
    const response = await generateCompletion(messages, {
      temperature: 0.7,
    })

    return NextResponse.json({
      message: response,
      sources,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
