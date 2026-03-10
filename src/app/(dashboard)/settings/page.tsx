"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, User, Bell, Shield, Database, Sparkles, Download, Trash2, Check, Moon, Sun, Monitor, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/hooks/use-toast"
import { checkOllamaHealth, listModels, ollamaConfig } from "@/lib/ollama"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [ollamaConnected, setOllamaConnected] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check Ollama connection
    const checkConnection = async () => {
      const connected = await checkOllamaHealth()
      setOllamaConnected(connected)
      if (connected) {
        setLoadingModels(true)
        const models = await listModels()
        setOllamaModels(models)
        setLoadingModels(false)
      }
    }
    checkConnection()
  }, [])

  const handleSaveProfile = () => {
    toast({
      title: "Profile saved",
      description: "Your profile has been updated.",
      variant: "success",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export is being prepared.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion",
      description: "This feature is not yet implemented.",
      variant: "destructive",
    })
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "storage", label: "Storage", icon: Database },
    { id: "ai", label: "AI Settings", icon: Sparkles },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3 mb-8"
      >
        <Settings className="h-8 w-8" />
        Settings
      </motion.h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      U
                    </div>
                    <Button variant="outline">Change Avatar</Button>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input placeholder="Enter username" defaultValue="user" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="Enter email" defaultValue="user@example.com" type="email" />
                  </div>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>Download your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="gap-2" onClick={handleExportData}>
                    <Download className="h-4 w-4" />
                    Export All Data (JSON)
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="gap-2" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how EchoVault looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === "light" ? "border-indigo-500 bg-indigo-50" : "border-zinc-200"
                        }`}
                      >
                        <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                        <p className="text-sm font-medium">Light</p>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === "dark" ? "border-indigo-500 bg-indigo-50" : "border-zinc-200"
                        }`}
                      >
                        <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                        <p className="text-sm font-medium">Dark</p>
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === "system" ? "border-indigo-500 bg-indigo-50" : "border-zinc-200"
                        }`}
                      >
                        <Monitor className="h-6 w-6 mx-auto mb-2 text-zinc-500" />
                        <p className="text-sm font-medium">System</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Daily insights", desc: "Receive daily AI insights", defaultChecked: true },
                    { label: "New connections", desc: "When AI finds new connections", defaultChecked: true },
                    { label: "Processing complete", desc: "When items finish processing", defaultChecked: false },
                    { label: "Weekly digest", desc: "Weekly summary of your knowledge base", defaultChecked: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-zinc-500">{item.desc}</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="peer sr-only" defaultChecked={item.defaultChecked} />
                        <div className="w-12 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Ollama Configuration</CardTitle>
                  <CardDescription>Configure your local AI models</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                      {ollamaConnected ? (
                        <>
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span className="text-emerald-600 font-medium">Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <span className="text-red-600 font-medium">Not Connected</span>
                        </>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                      Reconnect
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Ollama Base URL</label>
                    <Input
                      defaultValue={ollamaConfig.baseUrl}
                      placeholder="http://localhost:11434"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Chat Model</label>
                    <Select defaultValue={ollamaConfig.model}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingModels ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : ollamaModels.length > 0 ? (
                          ollamaModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={ollamaConfig.model}>
                            {ollamaConfig.model} (default)
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Embedding Model</label>
                    <Select defaultValue={ollamaConfig.embeddingModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nomic-embed-text">nomic-embed-text</SelectItem>
                        <SelectItem value="mxbai-embed-large">mxbai-embed-large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RAG Settings</CardTitle>
                  <CardDescription>Configure retrieval settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Number of sources to retrieve</label>
                    <Input type="number" defaultValue="5" min="1" max="20" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Similarity threshold</label>
                    <Input type="number" defaultValue="0.7" min="0" max="1" step="0.1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "storage" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>Manage your storage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>2.4 GB / 5 GB</span>
                    </div>
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                      <p className="text-2xl font-bold">1.2 GB</p>
                      <p className="text-sm text-zinc-500">Files</p>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                      <p className="text-2xl font-bold">800 MB</p>
                      <p className="text-sm text-zinc-500">Embeddings</p>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                      <p className="text-2xl font-bold">400 MB</p>
                      <p className="text-sm text-zinc-500">Cache</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your data and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                    <div>
                      <p className="font-medium">Local-first mode</p>
                      <p className="text-sm text-zinc-500">Process everything locally when possible</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="w-12 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                    <div>
                      <p className="font-medium">Share usage data</p>
                      <p className="text-sm text-zinc-500">Help improve EchoVault</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="w-12 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
