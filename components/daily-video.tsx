"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

// Global instance management - Singleton pattern
let globalCallFrame: any = null
let isInitializing = false
let isDestroyed = false
let listenersAttached = false

// Global cleanup function
const globalCleanup = () => {
  console.log("[Daily] Global cleanup called")
  try {
    // Best-effort: drop all listeners to avoid leaks in dev/fast-refresh
    ;(globalCallFrame as any)?.removeAllListeners?.()
  } catch {}
  listenersAttached = false
  if (globalCallFrame && !isDestroyed) {
    try {
      globalCallFrame.destroy()
      isDestroyed = true
    } catch (e) {
      console.warn("[Daily] Error in global cleanup:", e)
    }
    globalCallFrame = null
  }
  isInitializing = false
}

// Add global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', globalCleanup)
  window.addEventListener('unload', globalCleanup)
}

interface DailyVideoProps {
  roomUrl: string
  conversationId: string
  onVideoReady?: () => void
  onError?: (error: Error) => void
  onRef?: (ref: { sendMessageToPersona: (text: string) => Promise<void> }) => void
}

export function DailyVideo({ roomUrl, conversationId, onVideoReady, onError, onRef }: DailyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMountedRef = useRef(true)
  const remoteVideoTrackRef = useRef<MediaStreamTrack | null>(null)
  const remoteAudioTrackRef = useRef<MediaStreamTrack | null>(null)
  const hasInitRef = useRef(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [tavusParticipant, setTavusParticipant] = useState<any>(null)
  const debugIntervalRef = useRef<number | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("[Daily] Component cleanup...")
    isMountedRef.current = false
    // Only clean up global instance if this is the last component
    // For now, let the global cleanup handle it
    if (isMountedRef.current) {
      setIsJoined(false)
      setIsConnected(false)
      setTavusParticipant(null)
    }
  }, [])

  useEffect(() => {
    if (!roomUrl) return

    if (hasInitRef.current) {
      // Prevent React StrictMode double-invoke and hot-refresh thrash
      console.log("[Daily] Skipping init (already initialized in this component)")
      return
    }
    hasInitRef.current = true

    // Prevent multiple components from initializing simultaneously
    if (isInitializing) {
      console.log("[Daily] Another component is initializing, skipping...")
      return
    }

    const initializeDaily = async () => {
      try {
        console.log("[Daily] Initializing with room URL:", roomUrl)
        
        // Check if already initializing
        if (isInitializing) {
          console.log("[Daily] Already initializing, waiting...")
          // Wait for initialization to complete
          let attempts = 0
          while (isInitializing && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
          }
          if (globalCallFrame) {
            console.log("[Daily] Reusing existing global instance")
            setupEventListeners()
            return
          }
        }
        
        // Check if global instance already exists and is not destroyed
        if (globalCallFrame && !isDestroyed) {
          console.log("[Daily] Global instance already exists, reusing...")
          setupEventListeners()
          return
        }
        
        // If destroyed, reset the flag
        if (isDestroyed) {
          isDestroyed = false
        }
        
        isInitializing = true
        
        // Request permissions first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: true 
          })
          console.log("[Daily] Permissions granted")
          // Stop the stream immediately as we don't need it
          stream.getTracks().forEach(track => track.stop())
        } catch (permissionError) {
          console.warn("[Daily] Permission denied:", permissionError)
        }
        
        // Dynamically import Daily SDK to avoid SSR/dedupe issues
        console.log("[Daily] Loading Daily SDK...")
        const DailyIframe = (await import('@daily-co/daily-js')).default
        console.log("[Daily] Daily SDK loaded")

        console.log("[Daily] Creating Daily call object...")

        // Create Daily call object - following README pattern exactly
        globalCallFrame = DailyIframe.createCallObject({
          showLeaveButton: false,
          showFullscreenButton: false
        })
        
        console.log("[Daily] Daily call object created successfully")
        
        // Set up event listeners
        setupEventListeners()

        // Join the room
        await globalCallFrame.join({
          url: roomUrl,
          userName: 'InterviewFrontendUser'
        })
        
        isInitializing = false
        
      } catch (err) {
        console.error("[Daily] Initialization error:", err)
        isInitializing = false
        setError(err instanceof Error ? err.message : 'Failed to initialize video')
        onError?.(err instanceof Error ? err : new Error('Failed to initialize video'))
      }
    }
    
    const setupEventListeners = () => {
      if (!globalCallFrame) return
      if (listenersAttached) {
        return
      }
      try {
        ;(globalCallFrame as any).setMaxListeners?.(50)
      } catch {}
      globalCallFrame
        .on('joined-meeting', handleJoinedMeeting)
        .on('participant-joined', handleParticipantJoined)
        .on('participant-updated', handleParticipantJoined)
        .on('participant-left', handleParticipantLeft)
        .on('track-started', handleTrackStarted)
        .on('track-stopped', handleTrackStopped)
        .on('error', handleError)
      listenersAttached = true
    }

    initializeDaily()

    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [roomUrl, onError, cleanup])

  const handleJoinedMeeting = () => {
    console.log("[Daily] Joined meeting")
    if (isMountedRef.current) {
      setIsJoined(true)
      setIsConnected(true)
      onVideoReady?.()

      // Start a short-lived debug logger to inspect participant/track states
      try {
        if (debugIntervalRef.current) {
          window.clearInterval(debugIntervalRef.current)
          debugIntervalRef.current = null
        }
        let ticks = 0
        debugIntervalRef.current = window.setInterval(() => {
          try {
            const participants: any = (globalCallFrame as any)?.participants?.()
            const list = participants ? Object.values(participants) : []
            console.log('[Daily][Debug] participants count:', list?.length ?? 0)
            list.forEach((pp: any) => {
              const vid = pp?.tracks?.video
              const aud = pp?.tracks?.audio
              console.log('[Daily][Debug] user_id:', pp?.user_id, 'video state:', vid?.state, 'audio state:', aud?.state, 'has persistent video:', !!vid?.persistentTrack, 'has event video:', !!vid?.track)
            })
            const hasSrc = !!(videoRef.current as HTMLVideoElement | null)?.srcObject
            console.log('[Daily][Debug] video.srcObject set:', hasSrc)
          } catch (e) {
            console.warn('[Daily][Debug] error inspecting participants:', e)
          }
          ticks += 1
          if (ticks > 20 && debugIntervalRef.current) { // stop after ~20s
            window.clearInterval(debugIntervalRef.current)
            debugIntervalRef.current = null
          }
        }, 1000)
      } catch {}
    }
  }

  const handleParticipantJoined = (participantOrEvent: any) => {
    console.log("[Daily] Participant joined:", participantOrEvent)
    if (!isMountedRef.current) return
    const p = participantOrEvent?.participant ?? participantOrEvent
    if (!p) return
    if (p.user_id?.includes('tavus-replica')) {
      console.log("[Daily] Tavus replica detected!")
      // Ensure we are subscribed to replica tracks (defensive)
      try {
        (globalCallFrame as any)?.setSubscribedTracks?.(p.session_id, {
          audio: true,
          video: true,
          screenVideo: false,
          screenAudio: false
        })
        console.log('[Daily] Requested subscription to replica tracks')
      } catch (e) {
        console.warn('[Daily] setSubscribedTracks not available or failed', e)
      }
      setTavusParticipant(p)
      attachStream(p)
    } else {
      console.log("[Daily] Local participant:", p.user_id)
    }
  }

  const handleParticipantLeft = (participantOrEvent: any) => {
    console.log("[Daily] Participant left:", participantOrEvent)
    if (!isMountedRef.current) return
    const p = participantOrEvent?.participant ?? participantOrEvent
    if (p?.user_id?.includes('tavus-replica')) {
      setTavusParticipant(null)
      remoteVideoTrackRef.current = null
      remoteAudioTrackRef.current = null
      if (videoRef.current) {
        try { (videoRef.current as HTMLVideoElement).pause() } catch {}
        videoRef.current.srcObject = null
      }
    }
  }

  const handleTrackStarted = (event: any) => {
    console.log("[Daily] Track started:", event)
    
    if (!isMountedRef.current) return
    
    if (event.participant && event.participant.user_id?.includes('tavus-replica')) {
      console.log("[Daily] Tavus track started, re-attaching stream...")
      try {
        (globalCallFrame as any)?.setSubscribedTracks?.(event.participant.session_id, {
          audio: true,
          video: true,
          screenVideo: false,
          screenAudio: false
        })
      } catch {}
      setTavusParticipant(event.participant)
      // Prefer persistent tracks from participants() for stability
      try {
        const participants = (globalCallFrame as any)?.participants?.()
        const p = participants ? Object.values(participants).find((pp: any) => (pp as any)?.user_id?.includes('tavus-replica')) as any : null
        const vid = p?.tracks?.video
        const aud = p?.tracks?.audio
        const pv: MediaStreamTrack | null = (vid as any)?.persistentTrack || (vid as any)?.track || null
        const pa: MediaStreamTrack | null = (aud as any)?.persistentTrack || (aud as any)?.track || null
        if (pv) remoteVideoTrackRef.current = pv
        if (pa) remoteAudioTrackRef.current = pa
      } catch (e) {
        console.warn('[Daily] Unable to read participants() tracks, falling back to event.track', e)
        if (event.type === 'video') remoteVideoTrackRef.current = event.track
        if (event.type === 'audio') remoteAudioTrackRef.current = event.track
      }
      attachCombinedStream()
    }
  }

  const handleTrackStopped = (event: any) => {
    console.log("[Daily] Track stopped:", event)
  }

  const handleError = (error: any) => {
    console.error("[Daily] Error:", error)
    if (isMountedRef.current) {
      setError(error.message || 'Video connection error')
      onError?.(new Error(error.message || 'Video connection error'))
    }
  }

  const attachStream = (participant: any) => {
    console.log("[Daily] Attempting to attach stream for participant:", participant)
    const videoTrack = participant?.tracks?.video
    const audioTrack = participant?.tracks?.audio
    
    console.log("[Daily] Video track state:", videoTrack?.state)
    console.log("[Daily] Audio track state:", audioTrack?.state)
    console.log("[Daily] Video ref available:", !!videoRef.current)
    
    if (videoTrack?.state === 'playable' && videoRef.current) {
      // Grab persistentTrack if available; otherwise fall back to .track
      const vTrack: MediaStreamTrack | null = (videoTrack as any)?.persistentTrack || (videoTrack as any)?.track || null
      const aTrack: MediaStreamTrack | null = (audioTrack as any)?.persistentTrack || (audioTrack as any)?.track || null
      if (vTrack) remoteVideoTrackRef.current = vTrack
      if (aTrack) remoteAudioTrackRef.current = aTrack
      const tracks: MediaStreamTrack[] = []
      if (remoteVideoTrackRef.current) tracks.push(remoteVideoTrackRef.current)
      if (remoteAudioTrackRef.current) tracks.push(remoteAudioTrackRef.current)
      
      const stream = new MediaStream(tracks)
      videoRef.current.srcObject = stream
      videoRef.current.muted = false
      videoRef.current.volume = 1.0
      setIsConnected(true)
      setIsVideoEnabled(true)
      // Actively start playback; if blocked, retry muted
      const tryPlay = async () => {
        if (!videoRef.current) return
        try {
          await (videoRef.current as HTMLVideoElement).play()
          console.log("[Daily] Video play() succeeded")
        } catch (e) {
          console.warn("[Daily] Autoplay blocked, retrying muted", e)
          try {
            ;(videoRef.current as HTMLVideoElement).muted = true
            await (videoRef.current as HTMLVideoElement).play()
            console.log("[Daily] Video play() succeeded after muting")
          } catch (e2) {
            console.error("[Daily] Video play() failed", e2)
          }
        }
      }
      tryPlay()
      
      console.log("[Daily] Video stream attached successfully")
      
      // Add event listeners to track video loading
      videoRef.current.onloadedmetadata = () => {
        console.log("[Daily] Video metadata loaded")
      }
      
      videoRef.current.oncanplay = () => {
        console.log("[Daily] Video can start playing")
      }
      
      videoRef.current.onplay = () => {
        console.log("[Daily] Video started playing")
      }
    } else {
      console.warn("[Daily] Cannot attach stream - video track not playable or video ref not available")
    }
  }

  const attachCombinedStream = () => {
    if (!videoRef.current) { console.warn('[Daily] attachCombinedStream: no video element'); return }
    if (!remoteVideoTrackRef.current) { console.warn('[Daily] attachCombinedStream: no remote video track yet'); return }
    const tracks: MediaStreamTrack[] = [remoteVideoTrackRef.current]
    if (remoteAudioTrackRef.current) tracks.push(remoteAudioTrackRef.current)
    const stream = new MediaStream(tracks)
    console.log('[Daily] Attaching combined MediaStream with', tracks.length, 'tracks')
    videoRef.current.srcObject = stream
    console.log('[Daily] video.srcObject set:', !!videoRef.current.srcObject)
    setIsConnected(true)
    setIsVideoEnabled(true)
    const tryPlay = async () => {
      if (!videoRef.current) return
      try { await (videoRef.current as HTMLVideoElement).play() } catch (e) {
        try { (videoRef.current as HTMLVideoElement).muted = true; await (videoRef.current as HTMLVideoElement).play() } catch {}
      }
    }
    tryPlay()
    console.log("[Daily] Combined stream attached")
  }

  const sendMessageToPersona = useCallback(async (text: string) => {
    if (!globalCallFrame || !conversationId) {
      console.warn("[Daily] No call frame or conversation ID")
      return
    }

    // Check actual Daily.co join status instead of local state
    const dailyState = globalCallFrame.meetingState()
    console.log("[Daily] Current meeting state:", dailyState)
    
    if (dailyState !== 'joined-meeting') {
      console.warn("[Daily] Not joined yet, current state:", dailyState)
      // Wait up to 10 seconds for join
      let attempts = 0
      while (globalCallFrame.meetingState() !== 'joined-meeting' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts++
      }
      if (globalCallFrame.meetingState() !== 'joined-meeting') {
        console.error("[Daily] Failed to join, current state:", globalCallFrame.meetingState())
        return
      }
    }

    try {
      console.log("[Daily] Sending message to persona:", text)
      
      // Send message via Daily data channel - following README pattern exactly
      globalCallFrame.sendAppMessage({
        message_type: "conversation",
        event_type: "conversation.echo",
        conversation_id: conversationId,
        properties: {
          modality: "text",
          text: text,
          done: true
        }
      }, '*') // Send to all participants

      setIsSpeaking(true)
      
      // Simulate speaking duration
      const duration = Math.max(2000, text.length * 50)
      setTimeout(() => { setIsSpeaking(false) }, duration)
    } catch (error) {
      console.error("[Daily] Error sending message:", error)
      setError(error instanceof Error ? error.message : 'Failed to send message to persona')
    }
  }, [conversationId])

  // Expose sendMessageToPersona function via ref
  useEffect(() => {
    if (onRef) {
      onRef({
        sendMessageToPersona
      })
    }
  }, [onRef, sendMessageToPersona])

  // Ensure audio can start after a user gesture if autoplay is blocked
  useEffect(() => {
    const enableAudio = async () => {
      const el = videoRef.current as HTMLVideoElement | null
      if (!el) return
      try {
        el.muted = false
        await el.play().catch(() => undefined)
      } catch {}
      window.removeEventListener('click', enableAudio)
      window.removeEventListener('keydown', enableAudio)
      window.removeEventListener('touchstart', enableAudio)
    }
    window.addEventListener('click', enableAudio, { once: true })
    window.addEventListener('keydown', enableAudio, { once: true })
    window.addEventListener('touchstart', enableAudio, { once: true })
    return () => {
      window.removeEventListener('click', enableAudio)
      window.removeEventListener('keydown', enableAudio)
      window.removeEventListener('touchstart', enableAudio)
    }
  }, [])

  return (
    <Card className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-2 rounded-md text-sm z-10">
          Error: {error}
        </div>
      )}
      <CardContent className="relative w-full h-full p-0 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
        {!isConnected && (
          <div className="absolute top-3 left-3 bg-black/70 text-white rounded px-3 py-1 text-xs flex items-center gap-2 pointer-events-none">
            <VideoOff className="w-4 h-4" />
            Connecting to AI Interviewer...
          </div>
        )}
        {isConnected && (
          <div className="absolute bottom-4 left-4 flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span>Video {isVideoEnabled ? "On" : "Off"}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>Audio {isAudioEnabled ? "On" : "Off"}</span>
            </Badge>
          </div>
        )}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>AI Interviewer Speaking...</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}