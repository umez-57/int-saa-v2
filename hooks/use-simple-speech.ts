"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseSimpleSpeechOptions {
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export function useSimpleSpeech({
  onResult,
  onError
}: UseSimpleSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 5

  // Check if speech recognition is supported
  const checkSupport = useCallback(() => {
    console.log("[Simple Speech] Checking browser support...")
    
    if (typeof window === "undefined") {
      console.warn("[Simple Speech] Window object not available")
      return false
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("[Simple Speech] Speech recognition not supported in this browser")
      return false
    }
    
    console.log("[Simple Speech] Speech recognition is supported")
    setIsSupported(true)
    return true
  }, [])

  // Create a new recognition instance
  const createRecognition = useCallback(() => {
    if (!checkSupport()) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Configure for better reliability
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1
    
    // Try different service endpoints
    if ('serviceURI' in recognition) {
      // Try different Google Speech API endpoints
      const endpoints = [
        'wss://www.google.com/speech-api/full-duplex/v1/up',
        'wss://speech.googleapis.com/v1/speech:recognize',
        'wss://www.google.com/speech-api/v2/recognize'
      ]
      
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
      ;(recognition as any).serviceURI = randomEndpoint
      console.log("[Simple Speech] Using endpoint:", randomEndpoint)
    }

    recognition.onstart = () => {
      console.log("[Simple Speech] Recognition started")
      setIsListening(true)
      setError(null)
      retryCountRef.current = 0
    }

    recognition.onresult = (event) => {
      console.log("[Simple Speech] Received result:", event.results.length, "results")
      
      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence

        console.log("[Simple Speech] Result:", { transcript, confidence, isFinal: result.isFinal })

        if (result.isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      if (interim) {
        console.log("[Simple Speech] Interim transcript:", interim)
        setInterimTranscript(interim)
        onResult?.(interim, false)
      }

      if (final) {
        console.log("[Simple Speech] Final transcript:", final)
        setTranscript(prev => prev + final + " ")
        setInterimTranscript("")
        onResult?.(final, true)
      }
    }

    recognition.onerror = (event) => {
      console.error("[Simple Speech] Recognition error:", event.error)
      
      const errorMessage = `Speech recognition error: ${event.error}`
      setError(errorMessage)
      setIsListening(false)
      
      // Handle specific error types with retry logic
      if (event.error === 'network' && retryCountRef.current < maxRetries) {
        console.log(`[Simple Speech] Network error, retrying in 2 seconds... (${retryCountRef.current + 1}/${maxRetries})`)
        retryCountRef.current++
        setTimeout(() => {
          startListening()
        }, 2000)
      } else if (event.error === 'not-allowed') {
        console.error("[Simple Speech] Microphone access denied")
        onError?.(`Microphone access denied. Please allow microphone access and try again.`)
      } else if (event.error === 'no-speech') {
        console.warn("[Simple Speech] No speech detected")
        onError?.(`No speech detected. Please try speaking again.`)
      } else {
        console.error("[Simple Speech] Unknown error:", event.error)
        onError?.(errorMessage)
      }
    }

    recognition.onend = () => {
      console.log("[Simple Speech] Recognition ended")
      setIsListening(false)
    }

    recognition.onnomatch = () => {
      console.warn("[Simple Speech] No speech was recognized")
    }

    recognition.onsoundstart = () => {
      console.log("[Simple Speech] Sound detected")
    }

    recognition.onsoundend = () => {
      console.log("[Simple Speech] Sound ended")
    }

    recognition.onspeechstart = () => {
      console.log("[Simple Speech] Speech started")
    }

    recognition.onspeechend = () => {
      console.log("[Simple Speech] Speech ended")
    }

    return recognition
  }, [checkSupport, onResult, onError])

  // Start listening
  const startListening = useCallback(() => {
    console.log("[Simple Speech] Starting listening...")
    
    if (!isSupported) {
      const errorMsg = "Speech recognition not supported in this browser"
      console.error("[Simple Speech]", errorMsg)
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (isListening) {
      console.log("[Simple Speech] Already listening")
      return
    }

    try {
      const recognition = createRecognition()
      if (recognition) {
        recognitionRef.current = recognition
        recognition.start()
        console.log("[Simple Speech] Started listening successfully")
      } else {
        throw new Error("Failed to create speech recognition")
      }
    } catch (err) {
      const errorMsg = `Failed to start speech recognition: ${err}`
      console.error("[Simple Speech] Start error:", err)
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [isSupported, isListening, createRecognition, onError])

  // Stop listening
  const stopListening = useCallback(() => {
    console.log("[Simple Speech] Stopping listening...")
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        console.log("[Simple Speech] Stopped listening successfully")
      } catch (err) {
        console.error("[Simple Speech] Error stopping recognition:", err)
      }
    } else {
      console.log("[Simple Speech] No active recognition to stop")
    }
  }, [isListening])

  // Reset transcript
  const resetTranscript = useCallback(() => {
    console.log("[Simple Speech] Resetting transcript")
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    retryCountRef.current = 0
  }, [])

  // Initialize support check on mount
  useEffect(() => {
    console.log("[Simple Speech] Hook mounted, checking support...")
    checkSupport()
  }, [checkSupport])

  return {
    transcript,
    interimTranscript,
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

