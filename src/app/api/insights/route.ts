import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type = 'daily_summary' } = body

    // Get recent knowledge items
    const { data: items, error: itemsError } = await supabase
      .from('knowledge_items')
      .select('id, title, content, content_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (itemsError) throw itemsError

    if (!items || items.length === 0) {
      return NextResponse.json({
        error: 'Not enough data to generate insights. Add more items to your knowledge base.'
      }, { status: 400 })
    }

    let prompt = ''
    let title = ''

    switch (type) {
      case 'daily_summary':
        prompt = `Analyze the user's knowledge base items from the past day and provide a summary of:
1. What topics they focused on
2. Key themes or patterns
3. Most productive areas
Format the response as a concise insight brief.`
        title = 'Daily Insight'
        break
      case 'connection':
        prompt = `Analyze these knowledge items and identify potential connections or relationships between them that the user might find interesting:
${items.map(i => `- ${i.title}: ${i.content?.slice(0, 200)}`).join('\n')}
Suggest 2-3 meaningful connections with brief explanations.`
        title = 'Connection Found'
        break
      case 'spark':
        prompt = `Based on the user's knowledge base, suggest creative ideas or new directions they might want to explore:
${items.map(i => `- ${i.title}: ${i.content?.slice(0, 200)}`).join('\n')}
Provide 2-3 spark ideas that connect themes from their existing knowledge.`
        title = 'Spark Idea'
        break
      default:
        prompt = 'Provide a helpful insight about the knowledge base.'
        title = 'Insight'
    }

    // Generate insight using Ollama with chat API
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an insightful AI that helps users discover patterns and connections in their personal knowledge base. Be concise and actionable.'
      },
      { role: 'user' as const, content: prompt }
    ]
    const content = await generateCompletion(messages, {
      temperature: 0.8,
    })

    // Save insight to database
    const { data: insight, error: insightError } = await supabase
      .from('insights')
      .insert({
        user_id: user.id,
        title,
        content,
        insight_type: type,
      })
      .select()
      .single()

    if (insightError) throw insightError

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('Insight generation error:', error)
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
    const limit = searchParams.get('limit') || '20'

    const { data: insights, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
