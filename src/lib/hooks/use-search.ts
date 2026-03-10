import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { useDemoStore } from "@/lib/demo-store"
import { SearchResult } from "@/types"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function useSearch() {
  const { knowledgeItems } = useDemoStore()

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      // Demo mode: filter mock data by keyword
      if (isDemoMode) {
        const lowerQuery = query.toLowerCase()
        const results: SearchResult[] = knowledgeItems
          .filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.content.toLowerCase().includes(lowerQuery)
          )
          .map(item => ({
            id: item.id,
            title: item.title,
            content: item.content.substring(0, 200),
            content_type: item.content_type,
            relevance: 0.9,
          }))
        return results
      }

      // Real mode: call API
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data.results as SearchResult[]
    },
  })

  return {
    search: searchMutation.mutateAsync,
    results: searchMutation.data,
    isSearching: searchMutation.isPending,
    error: searchMutation.error,
  }
}
