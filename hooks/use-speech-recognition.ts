// hooks/use-speech-recognition.ts
"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export function useSpeechRecognition({
  continuous = false,
  interimResults = false,
  onResult,
  onError
}: UseSpeechRecognitionOptions = {}) {
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const continuousRef = useRef(continuous)
  const maxRetries = 3

  // Check if speech recognition is supported
  const checkSupport = useCallback(() => {
    console.log("[Speech] Checking browser support...")
    
    if (typeof window === "undefined") {
      console.warn("[Speech] Window object not available")
      return false
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("[Speech] Speech recognition not supported in this browser")
      console.log("[Speech] Available APIs:", {
        SpeechRecognition: !!window.SpeechRecognition,
        webkitSpeechRecognition: !!window.webkitSpeechRecognition,
        navigator: !!navigator,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia
      })
      return false
    }
    
    console.log("[Speech] Speech recognition is supported")
    setIsSupported(true)
    return true
  }, [])

  // Initialize speech recognition with better error handling
  const initRecognition = useCallback(() => {
    console.log("[Speech] Initializing speech recognition...")
    
    if (!checkSupport()) {
      console.error("[Speech] Speech recognition not supported")
      return null
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      // Configure recognition settings
      recognition.continuous = continuousRef.current
      recognition.interimResults = interimResults
      recognition.lang = "en-US"
      recognition.maxAlternatives = 1
      
      // Add additional configuration for better reliability
      if ('serviceURI' in recognition) {
        (recognition as any).serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up'
      }

      recognition.onstart = () => {
        console.log("[Speech] Recognition started successfully")
        setIsListening(true)
        setError(null)
        setRetryCount(0)
      }

      recognition.onresult = (event) => {
        console.log("[Speech] Received result:", event.results.length, "results")
        
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          const confidence = result[0].confidence

          console.log("[Speech] Result:", { transcript, confidence, isFinal: result.isFinal })

          if (result.isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        if (interim) {
          console.log("[Speech] Interim transcript:", interim)
          setInterimTranscript(interim)
          onResult?.(interim, false)
        }

        if (final) {
          console.log("[Speech] Final transcript:", final)
          setFinalTranscript(prev => prev + final)
          setTranscript(prev => prev + final)
          onResult?.(final, true)
        }
      }

      recognition.onerror = (event) => {
        console.error("[Speech] Recognition error:", {
          error: event.error,
          type: event.type,
          timeStamp: event.timeStamp
        })
        
        const errorMessage = `Speech recognition error: ${event.error}`
        setError(errorMessage)
        setIsListening(false)
        
        // Handle specific error types
        if (event.error === 'network') {
          console.error("[Speech] Network error - speech recognition service unavailable")
          onError?.(`Network error: Speech recognition service is unavailable. Please check your internet connection.`)
        } else if (event.error === 'not-allowed') {
          console.error("[Speech] Microphone access denied")
          onError?.(`Microphone access denied. Please allow microphone access and try again.`)
        } else if (event.error === 'no-speech') {
          console.warn("[Speech] No speech detected")
          // Don't treat this as a critical error
          onError?.(`No speech detected. Please try speaking again.`)
        } else {
          console.error("[Speech] Unknown error:", event.error)
          onError?.(errorMessage)
        }
      }

      recognition.onend = () => {
        console.log("[Speech] Recognition ended")
        setIsListening(false)
      }

      recognition.onnomatch = () => {
        console.warn("[Speech] No speech was recognized")
      }

      recognition.onsoundstart = () => {
        console.log("[Speech] Sound detected")
      }

      recognition.onsoundend = () => {
        console.log("[Speech] Sound ended")
      }

      recognition.onspeechstart = () => {
        console.log("[Speech] Speech started")
      }

      recognition.onspeechend = () => {
        console.log("[Speech] Speech ended")
      }

      console.log("[Speech] Speech recognition initialized successfully")
      return recognition
    } catch (err) {
      console.error("[Speech] Failed to initialize speech recognition:", err)
      setError(`Failed to initialize speech recognition: ${err}`)
      onError?.(`Failed to initialize speech recognition: ${err}`)
      return null
    }
  }, [checkSupport, onResult, onError])

  const startListening = useCallback(() => {
    console.log("[Speech] Attempting to start listening...")
    
    if (!isSupported) {
      const errorMsg = "Speech recognition not supported in this browser"
      console.error("[Speech]", errorMsg)
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (isListening) {
      console.log("[Speech] Already listening, skipping")
      return
    }

    try {
      const recognition = initRecognition()
      if (recognition) {
        recognitionRef.current = recognition
        recognition.start()
        console.log("[Speech] Started listening successfully")
      } else {
        throw new Error("Failed to initialize speech recognition")
      }
    } catch (err) {
      const errorMsg = `Failed to start speech recognition: ${err}`
      console.error("[Speech] Start error:", err)
      setError(errorMsg)
      onError?.(errorMsg)
      
      // Retry logic for network errors
      if (retryCount < maxRetries) {
        console.log(`[Speech] Retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`)
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          startListening()
        }, 2000)
      }
    }
  }, [isSupported, isListening, initRecognition, onError, retryCount, maxRetries])

  const stopListening = useCallback(() => {
    console.log("[Speech] Stopping listening...")
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        console.log("[Speech] Stopped listening successfully")
      } catch (err) {
        console.error("[Speech] Error stopping recognition:", err)
      }
    } else {
      console.log("[Speech] No active recognition to stop")
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    console.log("[Speech] Resetting transcript")
    setTranscript("")
    setInterimTranscript("")
    setFinalTranscript("")
    setError(null)
    setRetryCount(0)
  }, [])

  // Initialize support check on mount
  useEffect(() => {
    console.log("[Speech] Hook mounted, checking support...")
    checkSupport()
  }, [checkSupport])

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}