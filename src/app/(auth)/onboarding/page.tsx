"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Check, Database, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Database,
    title: "All Your Knowledge",
    description: "Store notes, PDFs, images, voice memos, and web clips in one place",
  },
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Local AI processes and connects your ideas automatically",
  },
  {
    icon: Shield,
    title: "Private by Default",
    description: "Your data stays on your device. No cloud processing required",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const handleGetStarted = () => {
    router.push("/vault")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">EchoVault</span>
        </div>

        <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
          <CardContent className="p-8">
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h1 className="text-2xl font-bold text-white mb-4">
                  Welcome to your personal knowledge OS
                </h1>
                <p className="text-zinc-400 mb-8">
                  EchoVault helps you capture, organize, and connect your ideas
                  using the power of local AI.
                </p>

                <div className="grid gap-4 mb-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/50"
                    >
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-white">{feature.title}</h3>
                        <p className="text-sm text-zinc-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button onClick={handleGetStarted} className="w-full" size="lg">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-zinc-500 text-sm mt-6">
          No account required. Your data stays local.
        </p>
      </motion.div>
    </div>
  )
}
