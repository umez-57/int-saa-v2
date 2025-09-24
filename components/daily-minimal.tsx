"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface MinimalDailyProps {
  roomUrl: string
  conversationId: string
  connectOnMount?: boolean
  onRef?: (ref: { connect: () => Promise<void>; sendMessageToPersona: (text: string) => void }) => void
  onLog?: (msg: string) => void
  onJoined?: () => void
  onReplicaReady?: () => void
}

export function DailyMinimal({ roomUrl, conversationId, connectOnMount = false, onRef, onLog, onJoined, onReplicaReady }: MinimalDailyProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const callRef = useRef<any>(null)
  const [joined, setJoined] = useState(false)
  const [needEnableSound, setNeedEnableSound] = useState(false)

  const log = useCallback((m: string) => {
    // eslint-disable-next-line no-console
    console.log("[DailyMinimal]", m)
    onLog?.(m)
  }, [onLog])

  const connect = useCallback(async () => {
    if (!roomUrl) { log("No roomUrl provided"); return }
    if (joined || callRef.current?.meetingState?.() === 'joined-meeting') { log('Already joined'); return }
    try {
      try {
        log("Requesting media permissions…")
        const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        s.getTracks().forEach(t => t.stop())
        log("Permissions granted")
      } catch (e) {
        log("Permissions prompt failed (may still play remote media)")
      }

      log("Loading Daily SDK…")
      const DailyIframe = (await import("@daily-co/daily-js")).default
      callRef.current = DailyIframe.createCallObject({ showLeaveButton: false, showFullscreenButton: false, showLocalVideo: false, showParticipantsBar: false })

      const attachStream = (participant: any) => {
        const v = participant?.tracks?.video
        const a = participant?.tracks?.audio
        if (v?.state === "playable" && videoRef.current) {
          const vTrack: MediaStreamTrack | null = (v as any)?.persistentTrack || (v as any)?.track || null
          const aTrack: MediaStreamTrack | null = (a as any)?.persistentTrack || (a as any)?.track || null
          const tracks: MediaStreamTrack[] = []
          if (vTrack) tracks.push(vTrack)
          if (aTrack) tracks.push(aTrack)
          const stream = new MediaStream(tracks)
          videoRef.current.srcObject = stream
          videoRef.current.muted = false
          videoRef.current.volume = 1
          videoRef.current.play().catch(async () => {
            // Autoplay blocked with audio – try muted and show prompt
            setNeedEnableSound(true)
            try { if (videoRef.current) { videoRef.current.muted = true; await videoRef.current.play() } } catch {}
          })
          log("Attached remote stream")
          try { onReplicaReady?.() } catch {}
        }
      }

      callRef.current
        .on("joined-meeting", () => {
          setJoined(true); log("joined-meeting");
          try { callRef.current?.setLocalAudio?.(false); callRef.current?.setLocalVideo?.(false); log("Local audio/video disabled for interview mode") } catch {}
          try { onJoined?.() } catch {}
          try {
            const parts = callRef.current?.participants?.() || {}
            Object.values(parts).forEach((p: any) => { if (p?.user_id?.includes("tavus-replica")) attachStream(p) })
          } catch {}
        })
        .on("participant-joined", (ev: any) => { if (ev.participant?.user_id?.includes("tavus-replica")) { log("replica joined"); attachStream(ev.participant) } })
        .on("participant-updated", (ev: any) => { if (ev.participant?.user_id?.includes("tavus-replica")) { log("replica updated"); attachStream(ev.participant) } })
        .on("track-started", (ev: any) => { if (ev.participant?.user_id?.includes("tavus-replica")) { log(`track-started ${ev.type}`); attachStream(ev.participant) } })

      await callRef.current.join({ url: roomUrl, userName: "PersonaTest" })
    } catch (e: any) {
      log(`init error: ${e?.message || String(e)}`)
    }
  }, [roomUrl, joined, log])

  const sendMessageToPersona = useCallback((text: string) => {
    if (!callRef.current || !conversationId) return
    try {
      callRef.current.sendAppMessage({
        message_type: "conversation",
        event_type: "conversation.echo",
        conversation_id: conversationId,
        properties: { modality: "text", text, done: true }
      }, "*")
      log(`sent: ${text}`)
    } catch (e) {
      log(`send error: ${String(e)}`)
    }
  }, [conversationId, log])

  const setLocalAudioEnabled = useCallback((enabled: boolean) => {
    try { callRef.current?.setLocalAudio?.(enabled); log(`local audio ${enabled ? 'enabled' : 'disabled'}`) } catch (e) { log(`setLocalAudio error: ${String(e)}`) }
  }, [log])

  useEffect(() => { onRef?.({ connect, sendMessageToPersona, setLocalAudioEnabled }) }, [onRef, connect, sendMessageToPersona, setLocalAudioEnabled])

  useEffect(() => { if (connectOnMount) { void connect() } }, [connectOnMount])

  useEffect(() => {
    const enable = async () => { try { const el = videoRef.current; if (!el) return; el.muted = false; await el.play().catch(() => undefined) } catch {} }
    window.addEventListener("click", enable, { once: true })
    window.addEventListener("keydown", enable, { once: true })
    return () => {
      window.removeEventListener("click", enable)
      window.removeEventListener("keydown", enable)
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      {needEnableSound && (
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs rounded px-2 py-1 cursor-pointer"
             onClick={async () => {
               try {
                 if (videoRef.current) {
                   videoRef.current.muted = false
                   videoRef.current.volume = 1
                   await videoRef.current.play()
                   setNeedEnableSound(false)
                 }
               } catch {}
             }}>
          Click to enable sound
        </div>
      )}
    </div>
  )
}


