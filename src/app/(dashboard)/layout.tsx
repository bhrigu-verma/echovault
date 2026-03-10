"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <ChatInterface />
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
