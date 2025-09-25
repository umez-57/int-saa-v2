"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useInterviewStore } from "@/lib/store"
import { DailyVideo } from "@/components/daily-video"

interface TavusConversation {
  conversationId: string
  conversationUrl: string
  token: string
}

interface TavusAvatarProps {
  sessionId: string
  onConversationReady?: (conversation: TavusConversation) => void
  onError?: (error: Error) => void
  renderVideo?: boolean
}

export function TavusAvatar({ sessionId, onConversationReady, onError, renderVideo = true }: TavusAvatarProps) {
  const { selectedPersona, isRecording, phase } = useInterviewStore()
  const [conversation, setConversation] = useState<TavusConversation | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dailyVideoRef = useRef<any>(null)
  const hasInitRef = useRef(false)

  // Initialize Tavus conversation when component mounts
  useEffect(() => {
    if (!sessionId || conversation) return
    if (hasInitRef.current) return
    hasInitRef.current = true

    const initializeConversation = async () => {
      try {
        setIsInitializing(true)
        setError(null)
        
        console.log("[TavusAvatar] Loading Tavus config...")
        
        // Load config from backend
        const configResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/config`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
          }
        })
        if (!configResponse.ok) {
          throw new Error(`Failed to load config: ${configResponse.status}`)
        }
        
        const config = await configResponse.json()
        console.log("[TavusAvatar] Config loaded:", config)
        
        // Create Tavus conversation directly - following README pattern exactly
        const requestBody = {
          replica_id: config.tavus_replica_id,
          persona_id: config.tavus_persona_id,
          memory_stores: ["astm_p48fdf065d6b"],
          properties: {
            participant_left_timeout: 0,
            language: "english"
          }
        }
        
        console.log("[TavusAvatar] Creating Tavus conversation...")
        const response = await fetch(`${config.tavus_base_url}/v2/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.tavus_api_key
          },
          body: JSON.stringify(requestBody)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Tavus API error: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log("[TavusAvatar] Tavus conversation created:", data)
        
        const newConversation = {
          conversationId: data.conversation_id,
          conversationUrl: data.conversation_url,
          token: data.token
        }
        
        setConversation(newConversation)
        onConversationReady?.(newConversation)
        
      } catch (err) {
        console.error("[TavusAvatar] Error creating conversation:", err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation'
        setError(errorMessage)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
      } finally {
        setIsInitializing(false)
      }
    }

    initializeConversation()
  }, [sessionId, conversation, onConversationReady, onError])

  // Handle video ready
  const handleVideoReady = () => {
    console.log("[TavusAvatar] Video ready")
  }

  // Handle video error
  const handleVideoError = (error: Error) => {
    console.error("[TavusAvatar] Video error:", error)
    setError(error.message)
    onError?.(error)
  }

  // Handle Daily video ref
  const handleDailyVideoRef = useCallback((ref: any) => {
    console.log("[TavusAvatar] Daily video ref received:", ref)
    dailyVideoRef.current = ref
  }, [])

  // Expose methods for external use
  useEffect(() => {
    if (conversation && dailyVideoRef.current) {
      ;(window as any).tavusAvatar = {
        sendMessage: (text: string) => {
          if (dailyVideoRef.current?.sendMessageToPersona) {
            dailyVideoRef.current.sendMessageToPersona(text)
            setIsSpeaking(true)
            const duration = Math.max(2000, text.length * 50)
            setTimeout(() => setIsSpeaking(false), duration)
          }
        },
        interrupt: () => {
          setIsSpeaking(false)
        }
      }
    }
  }, [conversation])

  if (error) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center bg-red-900/20 text-red-400">
        <CardContent className="text-center">
          <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isInitializing) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <CardContent className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">Initializing AI Interviewer...</h3>
          <p className="text-sm text-gray-400">Setting up video connection</p>
        </CardContent>
      </Card>
    )
  }

  if (!conversation) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <CardContent className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Conversation</h3>
          <p className="text-sm text-gray-400">Failed to create conversation</p>
        </CardContent>
      </Card>
    )
  }

  if (!renderVideo) {
    return null
  }

  return (
    <div className="w-full h-full">
      <DailyVideo
        roomUrl={conversation.conversationUrl}
        conversationId={conversation.conversationId}
        onVideoReady={handleVideoReady}
        onError={handleVideoError}
        onRef={handleDailyVideoRef}
      />
      
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 z-10"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>AI Interviewer Speaking...</span>
        </motion.div>
      )}
    </div>
  )
}