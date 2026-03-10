"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useDemoStore } from "@/lib/demo-store"
import { motion } from "framer-motion"
import { Sparkles, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { loginDemo } = useDemoStore()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Demo mode: skip Supabase and use demo auth
    if (isDemoMode) {
      await loginDemo()
      router.push('/vault')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/vault`,
      },
    })

    if (error) {
      console.error("Error sending magic link:", error)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    loginDemo()
    router.push('/vault')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">EchoVault</span>
        </div>

        <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-zinc-400">
              {isDemoMode
                ? "Demo mode - explore without signing up"
                : "Sign in to access your knowledge base"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDemoMode ? (
              // Demo mode: show demo login button
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-sm text-indigo-300 text-center">
                    Demo mode is active. Click below to explore EchoVault with sample data.
                  </p>
                </div>
                <Button
                  onClick={handleDemoLogin}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Try Demo Mode
                    </>
                  )}
                </Button>
                <p className="text-center text-zinc-500 text-xs">
                  No account required in demo mode
                </p>
              </motion.div>
            ) : !sent ? (
              // Production mode: magic link form
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium">Check your email</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    We sent a magic link to <span className="text-white">{email}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSent(false)}
                >
                  Try different email
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-zinc-500 text-sm mt-6">
          {isDemoMode
            ? "Demo mode - all features work with sample data"
            : "By signing in, you agree to our Terms of Service and Privacy Policy"}
        </p>
      </motion.div>
    </div>
  )
}
