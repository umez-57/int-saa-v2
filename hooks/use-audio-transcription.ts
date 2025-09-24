"use client"

import { useState, useRef, useCallback } from "react"

interface UseAudioTranscriptionOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

export function useAudioTranscription({
  onResult,
  onError
}: UseAudioTranscriptionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check if audio recording is supported
  const checkSupport = useCallback(() => {
    console.log("[Audio] Checking audio recording support...")
    
    if (typeof window === "undefined") {
      console.warn("[Audio] Window object not available")
      return false
    }
    
    const hasMediaRecorder = typeof MediaRecorder !== "undefined"
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext)
    
    console.log("[Audio] Support check:", {
      MediaRecorder: hasMediaRecorder,
      getUserMedia: hasGetUserMedia,
      AudioContext: hasAudioContext
    })
    
    const supported = hasMediaRecorder && hasGetUserMedia
    setIsSupported(supported)
    return supported
  }, [])

  // Start audio recording
  const startRecording = useCallback(async () => {
    console.log("[Audio] Starting audio recording...")
    
    if (!checkSupport()) {
      const errorMsg = "Audio recording not supported in this browser"
      console.error("[Audio]", errorMsg)
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      console.log("[Audio] Microphone access granted")

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("[Audio] Data chunk received:", event.data.size, "bytes")
        }
      }

      mediaRecorder.onstop = () => {
        console.log("[Audio] Recording stopped, processing audio...")
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
        console.log("[Audio] Audio blob created:", audioBlob.size, "bytes")
        
        // For now, we'll simulate transcription since we don't have a real speech-to-text service
        // In a real implementation, you would send this to a speech-to-text API
        setTimeout(() => {
          const mockTranscript = "This is a mock transcription. In a real implementation, this would be processed by a speech-to-text service."
          console.log("[Audio] Mock transcript generated:", mockTranscript)
          onResult?.(mockTranscript)
        }, 1000)
      }

      // Set up audio context for visual feedback
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)
        
        analyser.fftSize = 256
        microphone.connect(analyser)
        
        audioContextRef.current = audioContext
        analyserRef.current = analyser
        microphoneRef.current = microphone
        
        console.log("[Audio] Audio context set up for visual feedback")
      } catch (audioContextError) {
        console.warn("[Audio] Could not set up audio context:", audioContextError)
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setError(null)
      
      console.log("[Audio] Recording started successfully")
    } catch (err) {
      const errorMsg = `Failed to start audio recording: ${err}`
      console.error("[Audio] Start error:", err)
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [checkSupport, onResult, onError])

  // Stop audio recording
  const stopRecording = useCallback(() => {
    console.log("[Audio] Stopping audio recording...")
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
        console.log("[Audio] Recording stopped")
      } catch (err) {
        console.error("[Audio] Error stopping recording:", err)
      }
    }

    // Clean up audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
        audioContextRef.current = null
        analyserRef.current = null
        microphoneRef.current = null
        console.log("[Audio] Audio context cleaned up")
      } catch (err) {
        console.warn("[Audio] Error cleaning up audio context:", err)
      }
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log("[Audio] Track stopped:", track.kind)
      })
      streamRef.current = null
    }

    setIsRecording(false)
  }, [isRecording])

  // Get audio level for visual feedback
  const getAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    return average / 255 // Normalize to 0-1
  }, [])

  return {
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    getAudioLevel
  }
}

