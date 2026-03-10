"use client"

import { motion } from "framer-motion"
import { Plus, Search, FileText, Image, Mic, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const quickActions = [
  { icon: FileText, label: "Note", color: "bg-blue-500" },
  { icon: Image, label: "Image", color: "bg-purple-500" },
  { icon: Mic, label: "Voice", color: "bg-emerald-500" },
  { icon: Link2, label: "Web Clip", color: "bg-amber-500" },
]

const recentItems = [
  { title: "Meeting Notes - Project Alpha", type: "note", time: "2 hours ago" },
  { title: "Research Paper Summary", type: "pdf", time: "5 hours ago" },
  { title: "Voice Memo - Ideas", type: "audio", time: "Yesterday" },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100"
        >
          Welcome back
        </motion.h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Your knowledge base is ready. What would you like to add today?
        </p>
      </div>

      {/* Quick Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search your knowledge base..."
              className="h-14 pl-12 text-lg bg-zinc-50 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Quick Add
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div
                    className={`${action.color} p-3 rounded-xl mb-3`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {action.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Items */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Recent Items
        </h2>
        <div className="space-y-3">
          {recentItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </p>
                      <p className="text-sm text-zinc-500">{item.type}</p>
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400">{item.time}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
