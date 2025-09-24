/**
 * Tavus Avatar Integration
 *
 * This module provides integration with Tavus for AI avatar conversations.
 * Uses echo-mode for controlled interaction where we control all logic.
 */

export interface TavusConversation {
  conversationUrl: string
  conversationId: string
  token?: string
  mock?: boolean
}

export interface TavusEventHandler {
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onTranscript?: (text: string) => void
  onError?: (error: Error) => void
}

/**
 * Creates a new Tavus conversation for the given interview session
 * Calls our API endpoint which handles the Tavus API integration
 */
export async function createConversationServer(sessionId: string): Promise<TavusConversation> {
  console.log("[Tavus] Creating conversation for session:", sessionId)

  try {
    const response = await fetch('/api/tavus/create-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to create Tavus conversation: ${errorData.error}`)
    }

    const data = await response.json()
    
    return {
      conversationUrl: data.conversation_url,
      conversationId: data.conversation_id,
      token: data.token,
      mock: data.mock || false,
    }
  } catch (error) {
    console.error("[Tavus] Error creating conversation:", error)
    throw error
  }
}

/**
 * Tavus conversation instance for client-side operations
 */
let tavusConversation: any = null

/**
 * Initialize Tavus conversation with the provided conversation data
 */
export function initializeConversation(conversation: TavusConversation): void {
  console.log("[Tavus] Initializing conversation:", conversation.conversationId)
  
  // This will be replaced with actual Tavus CVI initialization
  // For now, we'll store the conversation data
  tavusConversation = conversation
}

/**
 * Echo text through the Tavus avatar (lip-sync + TTS)
 * 
 * In echo-mode, we send text to Tavus for the avatar to speak
 * The avatar will handle TTS and lip-sync automatically
 */
export function echoSay(text: string): Promise<void> {
  console.log("[Tavus] Echo say:", text)

  if (!tavusConversation) {
    console.warn("[Tavus] No conversation initialized")
    return Promise.resolve()
  }

  // Use the global tavusAvatar instance to echo text
  if (typeof window !== 'undefined' && (window as any).tavusAvatar) {
    (window as any).tavusAvatar.sendMessage(text)
    return Promise.resolve()
  }

  // Fallback: simulate the behavior
  return new Promise((resolve) => {
    // Simulate speaking duration based on text length
    const duration = Math.max(1000, text.length * 50)
    setTimeout(resolve, duration)
  })
}

/**
 * Interrupt current avatar speech
 * 
 * Stops the current TTS playback and resets avatar to idle state
 */
export function interrupt(): void {
  console.log("[Tavus] Interrupting speech")
  
  if (!tavusConversation) {
    console.warn("[Tavus] No conversation initialized")
    return
  }

  // Use the global CVI instance to interrupt
  if (typeof window !== 'undefined' && (window as any).tavusCVI) {
    (window as any).tavusCVI.interrupt()
    return
  }

  // Fallback: Call Tavus interrupt API
  try {
    fetch('/api/tavus/interrupt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        conversation_id: tavusConversation.conversationId 
      }),
    }).catch(error => {
      console.error("[Tavus] Failed to interrupt:", error)
    })
  } catch (error) {
    console.error("[Tavus] Interrupt error:", error)
  }
}

/**
 * Register event handlers for Tavus conversation events
 * 
 * Sets up listeners for speech events, transcript updates, and errors
 */
export function onEvents(handler: TavusEventHandler): () => void {
  console.log("[Tavus] Registering event handlers:", Object.keys(handler))

  // TODO: Replace with actual Tavus event listener registration
  // For now, return a cleanup function that does nothing
  return () => {
    console.log("[Tavus] Event handlers cleaned up")
  }
}

/**
 * Get the current conversation instance
 */
export function getConversation(): TavusConversation | null {
  return tavusConversation
}
