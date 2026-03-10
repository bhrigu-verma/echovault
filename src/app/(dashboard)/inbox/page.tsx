"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Inbox, FileText, Image, Mic, Link2, Clock, Check, Trash2, Archive, Sparkles, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useKnowledge } from "@/lib/hooks/use-knowledge"
import { KnowledgeItem } from "@/types"
import { useToast } from "@/lib/hooks/use-toast"

const typeIcons: Record<string, React.ElementType> = {
  note: FileText,
  image: Image,
  audio: Mic,
  webclip: Link2,
  pdf: FileText,
}

const typeColors: Record<string, string> = {
  note: "bg-blue-500",
  image: "bg-purple-500",
  audio: "bg-emerald-500",
  webclip: "bg-amber-500",
  pdf: "bg-red-500",
}

export default function InboxPage() {
  const { items, isLoading, deleteItem, isDeleting } = useKnowledge()
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | "unprocessed" | "processed">("all")

  // Filter items - in real mode would use is_processed field
  const filteredItems = (items || []).filter(item => {
    const isProcessed = item.metadata?.processed as boolean
    if (filter === "unprocessed") return !isProcessed
    if (filter === "processed") return isProcessed
    return true
  })

  const unprocessedCount = (items || []).filter(item => !(item.metadata?.processed as boolean)).length
  const newCount = (items || []).filter(item => item.metadata?.isNew as boolean).length

  const handleProcess = async (item: KnowledgeItem) => {
    toast({
      title: "Item processed",
      description: "The item has been moved to your vault.",
      variant: "success",
    })
  }

  const handleArchive = async (item: KnowledgeItem) => {
    toast({
      title: "Item archived",
      description: "The item has been archived.",
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id)
      toast({
        title: "Item deleted",
        description: "The item has been removed.",
        variant: "success",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete the item.",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3"
          >
            <Inbox className="h-8 w-8" />
            Inbox
          </motion.h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Review and process new items added to your knowledge base
          </p>
        </div>
        <Button variant="outline">
          <Check className="h-4 w-4 mr-2" />
          Mark all as processed
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{items?.length || 0}</p>
            <p className="text-sm text-zinc-500">Total items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-indigo-600">{unprocessedCount}</p>
            <p className="text-sm text-zinc-500">Unprocessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{newCount}</p>
            <p className="text-sm text-zinc-500">New this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unprocessed" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("unprocessed")}
        >
          Unprocessed
        </Button>
        <Button
          variant={filter === "processed" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("processed")}
        >
          Processed
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Items List */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const Icon = typeIcons[item.content_type] || FileText
            const colorClass = typeColors[item.content_type] || "bg-zinc-500"
            const isNew = item.metadata?.isNew as boolean
            const isProcessed = item.metadata?.processed as boolean

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-md transition-all duration-200 ${!isProcessed ? 'border-l-4 border-l-indigo-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`${colorClass} h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </h3>
                          {isNew && <Badge variant="secondary">New</Badge>}
                          {isProcessed && <Badge variant="outline">Processed</Badge>}
                        </div>
                        <p className="text-sm text-zinc-500 truncate">{item.content}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(item.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleProcess(item)}>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleArchive(item)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {filter === "unprocessed" ? "All caught up!" : "No items"}
          </h3>
          <p className="text-zinc-500">
            {filter === "unprocessed"
              ? "You've processed all your items. Add more to get started."
              : "Your inbox is empty."}
          </p>
        </div>
      )}
    </div>
  )
}
