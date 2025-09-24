// hooks/use-azure-speech.ts - Fixed version with continuous recognition
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as sdk from "microsoft-cognitiveservices-speech-sdk"

interface UseAzureSpeechOptions {
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStart?: () => void
  onStop?: () => void
}

export function useAzureSpeech({
  onResult,
  onError,
  onStart,
  onStop
}: UseAzureSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null)
  const accumulatedTranscriptRef = useRef("")
  const isListeningRef = useRef(false)

  const checkSupport = useCallback(() => {
    console.log("[Azure Speech] Checking support...")
    
    // Check if we're in browser
    if (typeof window === "undefined") {
      console.log("[Azure Speech] Not in browser environment")
      return false
    }

    // Check for required environment variables
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY
    const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION
    const speechEndpoint = process.env.NEXT_PUBLIC_AZURE_SPEECH_ENDPOINT

    console.log("[Azure Speech] Environment check:", {
      hasKey: !!speechKey,
      hasRegion: !!speechRegion,
      hasEndpoint: !!speechEndpoint,
      keyLength: speechKey?.length || 0,
      regionLength: speechRegion?.length || 0,
      endpointLength: speechEndpoint?.length || 0
    })

    if (!speechKey || !speechRegion) {
      console.warn("[Azure Speech] Missing required environment variables")
      setError("Azure Speech credentials not configured")
      return false
    }

    // Check if SDK is available
    if (!sdk) {
      console.warn("[Azure Speech] Microsoft Speech SDK not available")
      setError("Speech SDK not loaded")
      return false
    }

    console.log("[Azure Speech] All checks passed - Azure Speech is supported")
    setIsSupported(true)
    setError(null)
    return true
  }, [])

  useEffect(() => {
    const supported = checkSupport()
    if (!supported) {
      setIsSupported(false)
    }
  }, [checkSupport])

  const startListening = useCallback(async () => {
    if (!isSupported || isListeningRef.current) {
      console.log("[Azure Speech] Cannot start - not supported or already listening")
      return
    }

    try {
      console.log("[Azure Speech] Starting continuous recognition...")
      
      const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!
      const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
      const speechEndpoint = process.env.NEXT_PUBLIC_AZURE_SPEECH_ENDPOINT

      // Create speech config
      const speechConfig = speechEndpoint 
        ? sdk.SpeechConfig.fromEndpoint(new URL(speechEndpoint), speechKey)
        : sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)

      speechConfig.speechRecognitionLanguage = "en-US"
      
      // Configure for continuous recognition
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000")
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "5000")

      // Create audio config
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput()

      // Create recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
      recognizerRef.current = recognizer

      // Handle recognition results
      recognizer.recognizing = (s, e) => {
        console.log("[Azure Speech] Recognizing:", e.result.text)
        
        if (e.result.text) {
          // For interim results, show current accumulated + interim
          const currentAccumulated = accumulatedTranscriptRef.current
          const interimText = e.result.text.trim()
          const displayText = currentAccumulated + (currentAccumulated ? " " : "") + interimText
          
          setInterimTranscript(interimText)
          onResult?.(displayText, false)
        }
      }

      recognizer.recognized = (s, e) => {
        console.log("[Azure Speech] Recognized:", e.result.text)
        
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
          const newText = e.result.text.trim()
          if (newText) {
            // Accumulate the final text properly
            const currentAccumulated = accumulatedTranscriptRef.current
            const updatedText = currentAccumulated + (currentAccumulated ? " " : "") + newText
            
            console.log("[Azure Speech] Accumulated text:", {
              previous: currentAccumulated,
              new: newText,
              updated: updatedText
            })
            
            accumulatedTranscriptRef.current = updatedText
            setTranscript(updatedText)
            setInterimTranscript("")
            onResult?.(updatedText, true)
          }
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          console.log("[Azure Speech] No speech could be recognized")
        }
      }

      // Handle session events
      recognizer.sessionStarted = (s, e) => {
        console.log("[Azure Speech] Session started")
      }

      recognizer.sessionStopped = (s, e) => {
        console.log("[Azure Speech] Session stopped")
        setIsListening(false)
        isListeningRef.current = false
        onStop?.()
      }

      recognizer.canceled = (s, e) => {
        console.error("[Azure Speech] Recognition canceled:", e.reason)
        if (e.reason === sdk.CancellationReason.Error) {
          const errorMsg = `Recognition error: ${e.errorDetails}`
          setError(errorMsg)
          onError?.(errorMsg)
        }
        setIsListening(false)
        isListeningRef.current = false
        onStop?.()
      }

      // Start continuous recognition
      await recognizer.startContinuousRecognitionAsync()

      setIsListening(true)
      isListeningRef.current = true
      onStart?.()
      
      console.log("[Azure Speech] Continuous recognition started successfully")
    } catch (error) {
      console.error("[Azure Speech] Failed to start recognition:", error)
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [isSupported, onResult, onError, onStart, onStop])

  const stopListening = useCallback(async () => {
    if (recognizerRef.current && isListeningRef.current) {
      console.log("[Azure Speech] Stopping continuous recognition...")
      try {
        await recognizerRef.current.stopContinuousRecognitionAsync()
      } catch (error) {
        console.error("[Azure Speech] Error stopping recognition:", error)
      }
      recognizerRef.current = null
    }
    
    setIsListening(false)
    isListeningRef.current = false
    onStop?.()
  }, [onStop])

  const resetTranscript = useCallback(() => {
    console.log("[Azure Speech] Resetting transcript")
    accumulatedTranscriptRef.current = ""
    setTranscript("")
    setInterimTranscript("")
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync()
      }
    }
  }, [])

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