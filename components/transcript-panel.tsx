// components/transcript-panel.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Mic, MicOff } from "lucide-react"
import { useInterviewStore } from "@/lib/store"

interface TranscriptPanelProps {
  speechSupported?: boolean
  phase?: string
}

export function TranscriptPanel({ speechSupported, phase }: TranscriptPanelProps) {
  const { transcript, partials: currentTranscript, isRecording } = useInterviewStore()

  const isSpeechSupported = speechSupported ?? ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Live Transcript
          {isSpeechSupported && (
            <Badge variant="outline" className="ml-auto">
              Live Transcription
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 max-h-96">
          <div className="space-y-2">
            {/* Current live transcript */}
            {currentTranscript && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Live</span>
                </div>
                <p className="text-sm text-blue-900">{currentTranscript}</p>
              </div>
            )}

            {/* Final transcript entries */}
            {transcript.map((entry, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MicOff className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Final</span>
                </div>
                <p className="text-sm text-gray-900">{entry}</p>
              </div>
            ))}

        {/* No transcript message */}
        {transcript.length === 0 && !currentTranscript && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transcript yet</p>
            <p className="text-sm">Start recording to see live transcription</p>
            <div className="mt-4 text-xs">
              <p>Debug Info:</p>
              <p>Speech Support: {isSpeechSupported ? "✅" : "❌"}</p>
              <p>Current Phase: {phase || "unknown"}</p>
            </div>
          </div>
        )}
          </div>
        </ScrollArea>

        {/* Recording status */}
        {isRecording && (
          <div className="mt-4 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording in progress...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}