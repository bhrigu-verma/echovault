import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { useDemoStore } from "@/lib/demo-store"
import { KnowledgeItem } from "@/types"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function useKnowledge() {
  const queryClient = useQueryClient()
  const { knowledgeItems, addKnowledgeItem, deleteKnowledgeItem } = useDemoStore()

  const itemsQuery = useQuery({
    queryKey: ["knowledge-items"],
    queryFn: async () => {
      if (isDemoMode) {
        return knowledgeItems
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("knowledge_items")
        .select("*, tags(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as KnowledgeItem[]
    },
    enabled: !isDemoMode || knowledgeItems.length > 0,
  })

  const items = isDemoMode ? knowledgeItems : itemsQuery.data

  const createMutation = useMutation({
    mutationFn: async (item: {
      title: string
      content: string
      content_type: 'note' | 'pdf' | 'image' | 'audio' | 'webclip' | 'voice'
      metadata?: Record<string, unknown>
    }) => {
      if (isDemoMode) {
        addKnowledgeItem({
          ...item,
          content_type: item.content_type as 'note' | 'pdf' | 'image' | 'audio' | 'webclip' | 'voice',
          tags: [],
          metadata: item.metadata || {},
        })
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("knowledge_items")
        .insert({
          user_id: user.id,
          ...item,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-items"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        deleteKnowledgeItem(id)
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from("knowledge_items")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-items"] })
    },
  })

  return {
    items,
    isLoading: isDemoMode ? false : itemsQuery.isLoading,
    error: isDemoMode ? null : itemsQuery.error,
    createItem: createMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
