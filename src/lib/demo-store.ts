import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KnowledgeItem } from '@/types'

// Demo user for localStorage-based auth
export interface DemoUser {
  id: string
  email: string
  name: string
}

// Mock knowledge items for demo mode
export const DEMO_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: '1',
    user_id: 'demo-user',
    title: 'Getting Started with EchoVault',
    content: 'EchoVault is your personal knowledge management system. Start by adding notes, uploading files, or recording voice memos. The AI will help you connect ideas and find relevant information.',
    content_type: 'note',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { tags: ['welcome', 'tutorial'] },
    tags: [
      { id: 't1', user_id: 'demo-user', name: 'welcome', color: '#6366f1' },
      { id: 't2', user_id: 'demo-user', name: 'tutorial', color: '#8b5cf6' }
    ]
  },
  {
    id: '2',
    user_id: 'demo-user',
    title: 'Project Ideas: AI Assistant',
    content: 'Build an AI-powered personal assistant that can: \n- Answer questions about your documents\n- Summarize meeting notes\n- Generate insights from your knowledge base\n- Help with writing and editing\n\nUse RAG (Retrieval Augmented Generation) to provide contextual responses.',
    content_type: 'note',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    metadata: { tags: ['projects', 'ai'] },
    tags: [
      { id: 't3', user_id: 'demo-user', name: 'projects', color: '#10b981' },
      { id: 't4', user_id: 'demo-user', name: 'ai', color: '#f59e0b' }
    ]
  },
  {
    id: '3',
    user_id: 'demo-user',
    title: 'Meeting Notes: Team Sync',
    content: '## Team Sync - Feb 12, 2026\n\n### Attendees\n- Alice, Bob, Charlie\n\n### Discussion Points\n1. Q1 roadmap review\n2. New feature proposals\n3. Resource allocation\n\n### Action Items\n- [ ] Alice to finalize design specs\n- [ ] Bob to update timeline\n- [ ] Charlie to prepare demo\n\n### Next Steps\nSchedule follow-up for next week.',
    content_type: 'note',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    metadata: { tags: ['meetings', 'work'] },
    tags: [
      { id: 't5', user_id: 'demo-user', name: 'meetings', color: '#3b82f6' },
      { id: 't6', user_id: 'demo-user', name: 'work', color: '#ef4444' }
    ]
  },
  {
    id: '4',
    user_id: 'demo-user',
    title: 'Book Notes: Atomic Habits',
    content: '# Atomic Habits by James Clear\n\n## Key Concepts\n\n### 1% Better Every Day\nSmall improvements compound over time. Focus on systems, not goals.\n\n### The Four Laws of Behavior Change\n1. Make it Obvious\n2. Make it Attractive\n3. Make it Easy\n4. Make it Satisfying\n\n### Habit Stacking\nLink new habits to existing ones: "After I [CURRENT HABIT], I will [NEW HABIT]"\n\n### Environment Design\nMake good habits default. Make bad habits difficult.',
    content_type: 'note',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    metadata: { tags: ['books', 'productivity'] },
    tags: [
      { id: 't7', user_id: 'demo-user', name: 'books', color: '#ec4899' },
      { id: 't8', user_id: 'demo-user', name: 'productivity', color: '#14b8a6' }
    ]
  },
  {
    id: '5',
    user_id: 'demo-user',
    title: 'Research: Next.js 16 Features',
    content: '## Next.js 16 New Features\n\n### Server Actions\nImproved type safety and mutations.\n\n### Partial Prerendering\nCombine static and dynamic content seamlessly.\n\n### Improved TurboPack\nFaster builds and HMR.\n\n### Metadata API\nEnhanced SEO capabilities.\n\n### Server Components\nDefault in App Router with better suspense integration.',
    content_type: 'note',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    metadata: { tags: ['research', 'tech'] },
    tags: [
      { id: 't9', user_id: 'demo-user', name: 'research', color: '#06b6d4' },
      { id: 't10', user_id: 'demo-user', name: 'tech', color: '#a855f7' }
    ]
  }
]

// Demo insights
export const DEMO_INSIGHTS = [
  {
    id: 'i1',
    title: 'Connection Detected',
    content: 'Your notes on "AI Assistant" and "Next.js 16 Features" share common themes around technology and development.',
    type: 'connection',
    created_at: new Date().toISOString()
  },
  {
    id: 'i2',
    title: 'Daily Insight',
    content: 'You have added 5 items this week. Your most active day was Tuesday with 2 knowledge items.',
    type: 'summary',
    created_at: new Date().toISOString()
  },
  {
    id: 'i3',
    title: 'Suggested Action',
    content: 'Consider adding more details to your "Meeting Notes" to capture action items more effectively.',
    type: 'suggestion',
    created_at: new Date().toISOString()
  }
]

interface DemoState {
  isDemoMode: boolean
  user: DemoUser | null
  knowledgeItems: KnowledgeItem[]
  isAuthenticated: boolean

  // Actions
  loginDemo: () => void
  logoutDemo: () => void
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  deleteKnowledgeItem: (id: string) => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      user: null,
      knowledgeItems: DEMO_KNOWLEDGE_ITEMS,
      isAuthenticated: false,

      loginDemo: () => {
        set({
          user: {
            id: 'demo-user',
            email: 'demo@echovault.app',
            name: 'Demo User'
          },
          isAuthenticated: true,
          knowledgeItems: DEMO_KNOWLEDGE_ITEMS
        })
      },

      logoutDemo: () => {
        set({
          user: null,
          isAuthenticated: false
        })
      },

      addKnowledgeItem: (item) => {
        const newItem: KnowledgeItem = {
          ...item,
          id: Date.now().toString(),
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({
          knowledgeItems: [newItem, ...state.knowledgeItems]
        }))
      },

      deleteKnowledgeItem: (id) => {
        set((state) => ({
          knowledgeItems: state.knowledgeItems.filter((item) => item.id !== id)
        }))
      }
    }),
    {
      name: 'echovault-demo-storage'
    }
  )
)
