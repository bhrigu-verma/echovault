// Knowledge Item Types
export type ContentType = 'note' | 'pdf' | 'image' | 'audio' | 'webclip' | 'voice'
export type InsightType = 'daily_summary' | 'connection' | 'spark'

export interface KnowledgeItem {
  id: string
  user_id: string
  title: string
  content: string
  content_type: ContentType
  file_path?: string
  metadata: Record<string, unknown>
  embedding_id?: string
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
}

export interface Connection {
  id: string
  user_id: string
  source_item_id: string
  target_item_id: string
  connection_type: string
  strength: number
  created_at: string
  source_item?: KnowledgeItem
  target_item?: KnowledgeItem
}

export interface Insight {
  id: string
  user_id: string
  date?: string
  title: string
  summary?: string
  content?: string
  insight_type?: InsightType
  items?: Array<{
    type: string
    title: string
    relevance: number
  }>
  created_at: string
}

export interface SearchResult {
  id: string
  title: string
  content: string
  content_type: ContentType
  relevance?: number
  score?: number
  highlights?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: KnowledgeItem[]
  created_at: string
}

export interface UserProfile {
  id: string
  username: string
  avatar_url?: string
  preferences: Record<string, unknown>
  created_at: string
}

export interface GraphNode {
  id: string
  label: string
  type: ContentType
  x?: number
  y?: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: string
  strength?: number
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
