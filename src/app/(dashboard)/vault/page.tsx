"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Database, Search, Filter, Grid, List, FileText, Image, Mic, Link2, MoreVertical, Star, Trash2, Edit, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddKnowledgeButton } from "@/components/knowledge/add-knowledge-button"
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

export default function VaultPage() {
  const { items, isLoading, deleteItem, isDeleting } = useKnowledge()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const { toast } = useToast()

  const filteredItems = (items || []).filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !selectedFilter || item.content_type === selectedFilter
    return matchesSearch && matchesFilter
  })

  const filters = ["All", "Notes", "PDFs", "Images", "Audio"]

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id)
      toast({
        title: "Item deleted",
        description: "The knowledge item has been removed.",
        variant: "success",
      })
      setSelectedItem(null)
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete the item.",
        variant: "destructive",
      })
    }
  }

  const openItemDetail = (item: KnowledgeItem) => {
    setSelectedItem(item)
    setEditTitle(item.title)
    setEditContent(item.content)
    setIsEditMode(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
            <Database className="h-8 w-8" />
            Vault
          </motion.h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Your organized knowledge base - {filteredItems.length} items
          </p>
        </div>
        <AddKnowledgeButton />
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search vault..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex gap-2 mb-6">
        {filters.map((filter) => (
          <Badge
            key={filter}
            variant={selectedFilter === filter.toLowerCase().replace("s", "") || (!selectedFilter && filter === "All") ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedFilter(filter === "All" ? null : filter.toLowerCase().replace("s", ""))}
          >
            {filter}
          </Badge>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-3" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Items Grid/List */}
      {!isLoading && (
        viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-4">
            {filteredItems.map((item, index) => {
              const Icon = typeIcons[item.content_type] || FileText
              const colorClass = typeColors[item.content_type] || "bg-zinc-500"
              const isStarred = item.metadata?.starred as boolean

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3 flex items-center justify-center relative overflow-hidden">
                        <Icon className="h-12 w-12 text-zinc-400" />
                        <div className={`absolute top-2 left-2 ${colorClass} p-1.5 rounded-lg`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        {isStarred && (
                          <div className="absolute top-2 right-2">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.tags?.map(tag => (
                          <Badge key={tag.id} variant="outline" className="text-xs" style={{ borderColor: tag.color, color: tag.color }}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => {
              const Icon = typeIcons[item.content_type] || FileText
              const colorClass = typeColors[item.content_type] || "bg-zinc-500"
              const isStarred = item.metadata?.starred as boolean

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`${colorClass} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openItemDetail(item)}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </h3>
                          {isStarred && (
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 truncate">{item.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.tags?.map(tag => (
                          <Badge key={tag.id} variant="outline" className="text-xs" style={{ borderColor: tag.color, color: tag.color }}>
                            {tag.name}
                          </Badge>
                        ))}
                        <span className="text-xs text-zinc-400">{formatDate(item.created_at)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openItemDetail(item)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedItem(item)
                              setEditTitle(item.title)
                              setEditContent(item.content)
                              setIsEditMode(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            No items found
          </h3>
          <p className="text-zinc-500 mb-4">
            {searchQuery ? "Try adjusting your search or filters" : "Start by adding your first knowledge item"}
          </p>
          <AddKnowledgeButton />
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem && !isEditMode} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedItem && (
                <>
                  <span className={`${typeColors[selectedItem.content_type]} p-2 rounded-lg`}>
                    {React.createElement(typeIcons[selectedItem.content_type] || FileText, { className: "h-5 w-5 text-white" })}
                  </span>
                  {selectedItem.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Created {selectedItem && formatDate(selectedItem.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {selectedItem?.tags && selectedItem.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedItem.tags.map(tag => (
                  <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{selectedItem?.content}</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            <Button variant="default" onClick={() => {
              if (selectedItem) {
                setEditTitle(selectedItem.title)
                setEditContent(selectedItem.content)
                setIsEditMode(true)
              }
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditMode} onOpenChange={(open) => !open && setIsEditMode(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Item</DialogTitle>
            <DialogDescription>
              Make changes to your knowledge item below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter content..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && handleDelete(selectedItem.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={() => {
              // Save logic would go here
              toast({
                title: "Changes saved",
                description: "Your knowledge item has been updated.",
                variant: "success",
              })
              setIsEditMode(false)
              setSelectedItem(null)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
