"use client"

import { useCallback, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  Image,
  Mic,
  Link2,
  X,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { extractTextFromPDF } from "@/lib/pdf"

type UploadType = "note" | "pdf" | "image" | "audio" | "webclip"

interface UploadFile {
  id: string
  file?: File
  type: UploadType
  preview?: string
  content?: string
  title: string
  status: "pending" | "uploading" | "processing" | "done" | "error"
  error?: string
}

const uploadTypes = [
  { type: "note" as UploadType, label: "Note", icon: FileText, color: "bg-blue-500" },
  { type: "pdf" as UploadType, label: "PDF", icon: FileText, color: "bg-red-500" },
  { type: "image" as UploadType, label: "Image", icon: Image, color: "bg-purple-500" },
  { type: "audio" as UploadType, label: "Audio", icon: Mic, color: "bg-emerald-500" },
  { type: "webclip" as UploadType, label: "Web Clip", icon: Link2, color: "bg-amber-500" },
]

export function UploadZone() {
  const router = useRouter()
  const supabase = createClient()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [showWebclipInput, setShowWebclipInput] = useState(false)
  const [webclipUrl, setWebclipUrl] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const processFile = useCallback(async (file: UploadFile) => {
    let content = ""
    let title = file.title

    if (file.type === "note") {
      content = file.content || ""
    } else if (file.type === "pdf" && file.file) {
      try {
        content = await extractTextFromPDF(file.file)
      } catch (err) {
        console.error("PDF extraction failed", err)
        content = `PDF file: ${file.file.name} (Text extraction failed)`
      }
    } else if (file.type === "image") {
      content = `Image file: ${file.file?.name}`
    } else if (file.type === "audio") {
      content = `Audio recording`
    } else if (file.type === "webclip") {
      content = file.content || ""
    }

    return { title, content }
  }, [])

  const uploadFile = async (file: UploadFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id ? { ...f, status: "uploading" as const } : f
      )
    )

    try {
      const { title, content } = await processFile(file)

      // In demo mode, we'll just simulate success
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "done" as const } : f
          )
        )
        return
      }

      // Upload to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("knowledge_items")
        .insert({
          user_id: user.id,
          title,
          content,
          content_type: file.type,
        })
        .select()
        .single()

      if (error) throw error

      // If there's a file, upload to storage
      if (file.file) {
        const fileExt = file.file.name.split(".").pop()
        const filePath = `${user.id}/${data.id}/${Math.random()}.${fileExt}`

        await supabase.storage.from("knowledge-files").upload(filePath, file.file)

        await supabase
          .from("knowledge_items")
          .update({ file_path: filePath })
          .eq("id", data.id)
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "done" as const } : f
        )
      )

      // Generate embedding in background
      if (content) {
        fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: data.id, content: `${title} ${content}` }),
        }).catch(console.error)
      }
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, status: "error" as const, error: "Upload failed" }
            : f
        )
      )
    }
  }

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("audio/")
          ? "audio"
          : file.type === "application/pdf"
          ? "pdf"
          : "note",
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "pending" as const,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "text/*": [".txt", ".md", ".markdown"],
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
    },
  })

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        })

        const newFile: UploadFile = {
          id: Math.random().toString(36).substring(7),
          file,
          type: "audio",
          title: `Voice Memo ${new Date().toLocaleTimeString()}`,
          status: "pending",
        }
        setFiles((prev) => [...prev, newFile])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const addNote = (content: string, title: string) => {
    const newFile: UploadFile = {
      id: Math.random().toString(36).substring(7),
      type: "note",
      content,
      title: title || "Untitled Note",
      status: "pending",
    }
    setFiles((prev) => [...prev, newFile])
    setShowNoteInput(false)
  }

  const addWebclip = async (url: string, title?: string) => {
    if (!url) return

    const newFile: UploadFile = {
      id: Math.random().toString(36).substring(7),
      type: "webclip",
      title: title || new URL(url).hostname,
      content: url,
      status: "pending",
    }
    setFiles((prev) => [...prev, newFile])
    setShowWebclipInput(false)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const uploadAll = () => {
    files.forEach((file) => {
      if (file.status === "pending") {
        uploadFile(file)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Quick Add Buttons */}
      <div className="grid grid-cols-5 gap-3">
        {uploadTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => {
              if (item.type === "note") {
                setShowNoteInput(true)
              } else if (item.type === "webclip") {
                setShowWebclipInput(true)
              }
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <div className={`${item.color} p-3 rounded-xl`}>
              <item.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Voice Recording */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Voice Memo</p>
              <p className="text-sm text-zinc-500">Record a voice note</p>
            </div>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <Mic className="h-4 w-4 mr-2" />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
        <p className="text-zinc-600 dark:text-zinc-400">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          Supports PDF, Images, Audio, Text files
        </p>
      </div>

      {/* Note Input Modal */}
      <AnimatePresence>
        {showNoteInput && (
          <NoteInputModal
            onClose={() => setShowNoteInput(false)}
            onSave={addNote}
          />
        )}
      </AnimatePresence>

      {/* Webclip Input Modal */}
      <AnimatePresence>
        {showWebclipInput && (
          <WebclipInputModal
            onClose={() => setShowWebclipInput(false)}
            onSave={addWebclip}
          />
        )}
      </AnimatePresence>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              Files ({files.filter((f) => f.status === "pending").length} pending)
            </h3>
            <Button onClick={uploadAll} size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Process All
            </Button>
          </div>

          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`${
                      file.type === "note" ? "bg-blue-500" :
                      file.type === "pdf" ? "bg-red-500" :
                      file.type === "image" ? "bg-purple-500" :
                      file.type === "audio" ? "bg-emerald-500" :
                      "bg-amber-500"
                    } p-2 rounded-lg`}>
                      {file.type === "note" && <FileText className="h-4 w-4 text-white" />}
                      {file.type === "pdf" && <FileText className="h-4 w-4 text-white" />}
                      {file.type === "image" && <Image className="h-4 w-4 text-white" />}
                      {file.type === "audio" && <Mic className="h-4 w-4 text-white" />}
                      {file.type === "webclip" && <Link2 className="h-4 w-4 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Input
                        value={file.title}
                        onChange={(e) => {
                          setFiles((prev) =>
                            prev.map((f) =>
                              f.id === file.id ? { ...f, title: e.target.value } : f
                            )
                          )
                        }}
                        className="h-8 border-none bg-transparent focus-visible:ring-0 px-0 font-medium"
                        placeholder="Title"
                      />
                      {file.type === "note" && (
                        <Textarea
                          value={file.content || ""}
                          onChange={(e) => {
                            setFiles((prev) =>
                              prev.map((f) =>
                                f.id === file.id ? { ...f, content: e.target.value } : f
                              )
                            )
                          }}
                          placeholder="Write your note..."
                          className="mt-2 h-20 text-sm"
                        />
                      )}
                      {file.type === "webclip" && (
                        <p className="text-xs text-zinc-500 truncate mt-1">{file.content}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {file.status === "pending" && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      {file.status === "uploading" && (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Uploading
                        </Badge>
                      )}
                      {file.status === "done" && (
                        <Badge variant="emerald">
                          <Check className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                      {file.status === "error" && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function NoteInputModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (content: string, title: string) => void
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Note</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Write your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-40"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => onSave(content, title)} disabled={!content}>
                  Save Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function WebclipInputModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (url: string, title?: string) => void
}) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Capture Web Clip</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  placeholder="Article Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => onSave(url, title)} disabled={!url}>
                  Capture
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

