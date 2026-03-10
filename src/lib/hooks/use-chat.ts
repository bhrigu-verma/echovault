import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useDemoStore } from "@/lib/demo-store"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  sources?: {
    id: string
    title: string
    content_type: string
  }[]
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { knowledgeItems } = useDemoStore()

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Demo mode: respond with mock data
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 800))

        const lowerContent = content.toLowerCase()
        const relevantItems = knowledgeItems.filter(item =>
          item.title.toLowerCase().includes(lowerContent) ||
          item.content.toLowerCase().includes(lowerContent)
        )

        let responseContent: string
        if (relevantItems.length > 0) {
          responseContent = `I found ${relevantItems.length} relevant note(s) in your knowledge base:\n\n`
          responseContent += relevantItems.map(item =>
            `**${item.title}**\n${item.content.substring(0, 150)}...`
          ).join('\n\n')
        } else {
          responseContent = `This is a demo response. You asked: "${content}"\n\nIn the full version, I would search your knowledge base and provide AI-generated insights based on your uploaded notes, PDFs, and other content.\n\nTry searching for terms like "AI", "habits", or "meeting" to see how search works in demo mode.`
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: responseContent,
          sources: relevantItems.map(item => ({
            id: item.id,
            title: item.title,
            content_type: item.content_type,
          })),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
        return
      }

      // Real mode: call API
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      })

      const data = await response.json()

      if (data.error) {
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Error: ${data.error}`,
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        sources: data.sources,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, knowledgeItems])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  }
}
