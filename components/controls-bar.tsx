"use client"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Space } from "lucide-react"
import { useInterviewStore } from "@/lib/store"

export function ControlsBar() {
  const { isRecording, phase } = useInterviewStore()

  return (
    <div className="bg-background/95 backdrop-blur-sm border-t p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Recording Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <MicOff className="h-4 w-4 text-destructive" />
            ) : (
              <Mic className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {phase === "listening" && isRecording && "Recording your answer..."}
              {phase === "finalizing" && "Processing transcript..."}
              {phase === "reviewing" && "Review your answer"}
              {phase === "asking" && "Ready to start"}
            </span>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Space className="h-3 w-3" />
            Space
          </Badge>
          <span>Interrupt</span>
          <Badge variant="outline">R</Badge>
          <span>Record</span>
          <Badge variant="outline">Enter</Badge>
          <span>Approve</span>
        </div>
      </div>
    </div>
  )
}
