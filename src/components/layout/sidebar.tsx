"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Inbox,
  Database,
  Sparkles,
  Network,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AddKnowledgeButton } from "@/components/knowledge/add-knowledge-button"
import { SemanticSearch } from "@/components/search/semantic-search"
import { createClient } from "@/lib/supabase"
import { useDemoStore } from "@/lib/demo-store"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const navItems = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/vault", label: "Vault", icon: Database },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/graph", label: "Graph", icon: Network },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const { user, logoutDemo } = useDemoStore()

  const handleSignOut = async () => {
    if (isDemoMode) {
      logoutDemo()
      window.location.href = "/login"
      return
    }
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          EchoVault
        </span>
        {isDemoMode && (
          <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded">
            Demo
          </span>
        )}
      </div>

      {/* Search */}
      <div className="p-4">
        <SemanticSearch />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <AddKnowledgeButton />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 h-6 w-1 rounded-r-full bg-indigo-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("h-4 w-4", isActive && "text-indigo-500")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {isDemoMode ? (user?.name || 'Demo User') : 'User'}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {isDemoMode ? 'Demo Mode' : 'Free plan'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
