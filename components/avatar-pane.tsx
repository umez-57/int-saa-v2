"use client"

import { useRef, useImperativeHandle, forwardRef, useEffect } from "react"
import { useInterviewStore } from "@/lib/store"
import { TavusAvatar } from "./tavus-avatar"

interface AvatarPaneProps {
  sessionId?: string
}

export const AvatarPane = forwardRef<{ say: (text: string) => void }, AvatarPaneProps>(
  ({ sessionId }, ref) => {
    const { sessionId: storeSessionId } = useInterviewStore()
    const tavusAvatarRef = useRef<any>(null)

    // Use sessionId from props or store
    const currentSessionId = sessionId || storeSessionId

    useImperativeHandle(ref, () => ({
      say: (text: string) => {
        // Call the Tavus avatar's say method
        if (tavusAvatarRef.current?.say) {
          tavusAvatarRef.current.say(text)
        } else {
          console.warn("[AvatarPane] Tavus avatar not ready")
        }
      },
    }))

    // Expose Tavus avatar methods to parent
    useEffect(() => {
      if (typeof window !== 'undefined' && tavusAvatarRef.current) {
        tavusAvatarRef.current = (window as any).tavusAvatar
      }
    }, [])

    if (!currentSessionId) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No session ID available</p>
            <p className="text-sm">Please start an interview session</p>
          </div>
        </div>
      )
    }

    return (
      <TavusAvatar
        sessionId={currentSessionId}
        onConversationReady={(conversation) => {
          console.log("[AvatarPane] Tavus conversation ready:", conversation.conversationId)
        }}
        onError={(error) => {
          console.error("[AvatarPane] Tavus error:", error)
        }}
      />
    )
  }
)

AvatarPane.displayName = "AvatarPane"
