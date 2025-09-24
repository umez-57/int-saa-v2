"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ErrorToastProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  isVisible: boolean
}

export function ErrorToast({ message, onRetry, onDismiss, isVisible }: ErrorToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="p-4 bg-destructive/10 border-destructive/20 max-w-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{message}</p>
                <div className="flex gap-2">
                  {onRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onRetry}
                      className="h-8 text-xs bg-transparent"
                      aria-label="Retry action"
                    >
                      Retry
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onDismiss}
                      className="h-8 w-8 p-0"
                      aria-label="Dismiss error"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
