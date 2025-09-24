import { create } from "zustand"
import type { Mode, Difficulty, Persona, InterviewPhase } from "./types"

interface InterviewState {
  // Interview setup
  selectedPersona: Persona | null
  difficulty: Difficulty
  mode: Mode

  // Interview session
  sessionId: string | null
  currentQuestion: string | null
  questionIdx: number
  phase: InterviewPhase
  isRecording: boolean
  partials: string // Live partial transcript
  finalTranscript: string // Final confirmed transcript
  transcript: string[] // Array of all transcript entries
  timeElapsed: number
  timeRemaining: number | null // null for unlimited mode
  isTimerActive: boolean
  audioBlob: Blob | null
  recordingDuration: number

  // Actions for state transitions
  nextPhase: () => void
  setPhase: (phase: InterviewPhase) => void

  // Setup actions
  setPersona: (persona: Persona) => void
  setDifficulty: (difficulty: Difficulty) => void
  setMode: (mode: Mode) => void

  // Session actions
  setSessionId: (id: string) => void
  setCurrentQuestion: (question: string) => void
  setQuestionIdx: (idx: number) => void
  setRecording: (recording: boolean) => void
  setPartials: (text: string) => void
  setFinalTranscript: (text: string) => void
  addTranscriptEntry: (text: string) => void
  setTimeElapsed: (time: number | ((prev: number) => number)) => void
  setTimeRemaining: (time: number | null | ((prev: number | null) => number | null)) => void
  setTimerActive: (active: boolean) => void
  setAudioBlob: (blob: Blob | null) => void
  setRecordingDuration: (duration: number) => void

  // Utility actions
  resetSession: () => void
  retryQuestion: () => void
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  // Initial state
  selectedPersona: null,
  difficulty: "Medium",
  mode: "10min",
  sessionId: null,
  currentQuestion: null,
  questionIdx: 0,
  phase: "asking",
  isRecording: false,
  partials: "",
  finalTranscript: "",
  transcript: [],
  timeElapsed: 0,
  timeRemaining: null,
  isTimerActive: false,
  audioBlob: null,
  recordingDuration: 0,

  nextPhase: () => {
    const { phase } = get()
    const transitions: Record<InterviewPhase, InterviewPhase> = {
      asking: "listening",
      listening: "finalizing",
      finalizing: "reviewing",
      reviewing: "asking", // Next question
    }
    set({ phase: transitions[phase] })
  },

  setPhase: (phase) => set({ phase }),

  // Setup actions
  setPersona: (persona) => set({ selectedPersona: persona }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setMode: (mode) => set({ mode }),

  // Session actions
  setSessionId: (id) => set({ sessionId: id }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setQuestionIdx: (idx) => set({ questionIdx: idx }),
  setRecording: (recording) => set({ isRecording: recording }),

  setPartials: (text) => set({ partials: text }),
  setFinalTranscript: (text) => set({ finalTranscript: text }),
  addTranscriptEntry: (text) => set((state) => ({ 
    transcript: [...state.transcript, text] 
  })),

  setTimeElapsed: (time) =>
    typeof time === "function"
      ? set((state) => ({ timeElapsed: (time as (prev: number) => number)(state.timeElapsed) }))
      : set({ timeElapsed: time }),
  setTimeRemaining: (time) =>
    typeof time === "function"
      ? set((state) => ({ timeRemaining: (time as (prev: number | null) => number | null)(state.timeRemaining) }))
      : set({ timeRemaining: time }),
  setTimerActive: (active) => set({ isTimerActive: active }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setRecordingDuration: (duration) => set({ recordingDuration: duration }),

  retryQuestion: () =>
    set({
      phase: "asking",
      isRecording: false,
      partials: "",
      finalTranscript: "",
      audioBlob: null,
      recordingDuration: 0,
    }),

  resetSession: () =>
    set({
      sessionId: null,
      currentQuestion: null,
      questionIdx: 0,
      phase: "asking",
      isRecording: false,
      partials: "",
      finalTranscript: "",
      transcript: [],
      timeElapsed: 0,
      timeRemaining: null,
      isTimerActive: false,
      audioBlob: null,
      recordingDuration: 0,
    }),
}))
