"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadZone } from "@/components/knowledge/upload-zone"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AddKnowledgeButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full gap-2"
        variant="glow"
      >
        <Plus className="h-4 w-4" />
        Add Knowledge
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <UploadZone />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
