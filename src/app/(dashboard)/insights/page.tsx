"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Lightbulb, Link2, ArrowRight, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useInsights } from "@/lib/hooks/use-insights"
import { Insight, InsightType } from "@/types"
import { useToast } from "@/lib/hooks/use-toast"

const typeConfig: Record<InsightType, { icon: React.ElementType; color: string; label: string }> = {
  daily_summary: { icon: Sparkles, color: "bg-indigo-500", label: "Daily Summary" },
  connection: { icon: Link2, color: "bg-emerald-500", label: "Connection" },
  spark: { icon: Lightbulb, color: "bg-amber-500", label: "Spark" },
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const config = typeConfig[insight.insight_type || 'daily_summary']
  const Icon = config.icon

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${config.color} p-2 rounded-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(insight.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View details
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 dark:text-zinc-300">{insight.summary || insight.content}</p>
          {insight.items && insight.items.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {insight.items.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {item.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function InsightsPage() {
  const { insights, isLoading, generateInsight, isGenerating } = useInsights()
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | InsightType>("all")

  const filteredInsights = (insights || []).filter(insight => {
    if (filter === "all") return true
    return insight.insight_type === filter
  })

  const stats = {
    total: insights?.length || 0,
    connections: insights?.filter(i => i.insight_type === 'connection').length || 0,
    sparks: insights?.filter(i => i.insight_type === 'spark').length || 0,
  }

  const handleGenerate = async (type: InsightType = 'spark') => {
    try {
      await generateInsight(type)
      toast({
        title: "Insight generated",
        description: "New insight has been added to your list.",
        variant: "success",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate insight. Please try again.",
        variant: "destructive",
      })
    }
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
            <Sparkles className="h-8 w-8" />
            Insights
          </motion.h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            AI-powered insights and connections from your knowledge base
          </p>
        </div>
        <Button variant="glow" onClick={() => handleGenerate('spark')} disabled={isGenerating}>
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? "Generating..." : "Generate New Insight"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</p>
            )}
            <p className="text-sm text-zinc-500">Total insights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">{stats.connections}</p>
            )}
            <p className="text-sm text-zinc-500">Connections found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-amber-600">{stats.sparks}</p>
            )}
            <p className="text-sm text-zinc-500">Spark ideas</p>
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
          variant={filter === "daily_summary" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("daily_summary")}
        >
          Summaries
        </Button>
        <Button
          variant={filter === "connection" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("connection")}
        >
          Connections
        </Button>
        <Button
          variant={filter === "spark" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("spark")}
        >
          Sparks
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insights List */}
      {!isLoading && filteredInsights.length > 0 && (
        <div className="space-y-4">
          {filteredInsights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            No insights yet
          </h3>
          <p className="text-zinc-500 mb-4">
            Generate your first AI-powered insight to get started.
          </p>
          <Button variant="glow" onClick={() => handleGenerate('spark')}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insight
          </Button>
        </div>
      )}

      {/* Spark Section */}
      {!isLoading && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Spark Your Creativity
          </h2>
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                Get AI-generated suggestions for new connections, ideas, or areas to explore based on your knowledge base.
              </p>
              <div className="flex gap-2">
                <Button variant="glow" onClick={() => handleGenerate('spark')} disabled={isGenerating}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Spark
                </Button>
                <Button variant="outline" onClick={() => handleGenerate('connection')} disabled={isGenerating}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Find Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
