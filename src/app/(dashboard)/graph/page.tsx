"use client"

import { useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw, FileText, Image, Mic, Link2 } from "lucide-react"
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  Node,
  Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useKnowledge } from "@/lib/hooks/use-knowledge"
import { KnowledgeItem, ContentType } from "@/types"

const typeColors: Record<ContentType, string> = {
  note: "#6366f1",
  image: "#8b5cf6",
  audio: "#10b981",
  webclip: "#f59e0b",
  pdf: "#ef4444",
  voice: "#06b6d4",
}

const typeIcons: Record<ContentType, React.ElementType> = {
  note: FileText,
  image: Image,
  audio: Mic,
  webclip: Link2,
  pdf: FileText,
  voice: Mic,
}

interface KnowledgeNodeData extends Record<string, unknown> {
  label: string
  item: KnowledgeItem
  type: ContentType
}

type KnowledgeNode = Node<KnowledgeNodeData>
type KnowledgeEdge = Edge

export default function GraphPage() {
  const { items, isLoading } = useKnowledge()

  // Convert knowledge items to nodes
  const initialNodes: KnowledgeNode[] = useMemo(() => {
    if (!items || items.length === 0) return []

    // Calculate positions in a circular layout
    const centerX = 400
    const centerY = 300
    const radius = Math.min(250, items.length * 50)

    return items.map((item, index) => {
      const angle = (2 * Math.PI * index) / items.length
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      return {
        id: item.id,
        position: { x, y },
        data: {
          label: item.title,
          item,
          type: item.content_type,
        },
        style: {
          background: typeColors[item.content_type] || "#6366f1",
          color: "white",
          borderRadius: "8px",
          padding: "10px 15px",
          border: "none",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          maxWidth: "200px",
        },
      }
    })
  }, [items])

  // Generate edges based on tag connections
  const initialEdges: KnowledgeEdge[] = useMemo(() => {
    if (!items || items.length === 0) return []

    const edges: KnowledgeEdge[] = []

    // Create edges between items that share tags
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i]
        const item2 = items[j]

        // Check for shared tags
        const tags1 = item1.tags?.map(t => t.id) || []
        const tags2 = item2.tags?.map(t => t.id) || []
        const sharedTags = tags1.filter(t => tags2.includes(t))

        if (sharedTags.length > 0) {
          edges.push({
            id: `e-${item1.id}-${item2.id}`,
            source: item1.id,
            target: item2.id,
            animated: true,
            style: {
              stroke: sharedTags.length > 1 ? "#6366f1" : "#94a3b8",
              strokeWidth: sharedTags.length > 1 ? 2 : 1,
            },
          })
        }
      }
    }

    return edges
  }, [items])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  const handleNodeClick = useCallback((event: React.MouseEvent, node: KnowledgeNode) => {
    console.log("Node clicked:", node.data.item)
    // Could open item detail dialog here
  }, [])

  const fitView = useCallback(() => {
    // This would trigger fitView on the ReactFlow instance
  }, [])

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-8 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3"
        >
          <Network className="h-8 w-8" />
          Knowledge Graph
        </motion.h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Visualize connections between your knowledge items
        </p>
      </div>

      {/* Graph Container */}
      <div className="h-[calc(100vh-220px)] mx-4 mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="space-y-4 w-full max-w-md p-8">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ) : items && items.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            fitView
            className="bg-zinc-50 dark:bg-zinc-900"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg" />

            {/* Custom Controls Panel */}
            <Panel position="top-right" className="flex gap-2">
              <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-800">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-800">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-800">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-800">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </Panel>
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Network className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                No items to visualize
              </h3>
              <p className="text-zinc-500">
                Add knowledge items to see them in the graph.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-8 pb-4">
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <span>Nodes: {nodes.length}</span>
          <span>Connections: {edges.length}</span>
          <div className="flex items-center gap-4 ml-auto">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-indigo-500" /> Notes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-500" /> Images
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Audio
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500" /> Web
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
