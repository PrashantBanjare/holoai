import { useEffect, useRef, type CSSProperties } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { HandTracker } from '../../gestures/HandTracker'
import { GestureRecognizer } from '../../gestures/GestureRecognizer' // NEW
import { MotionTracker } from '../../gestures/MotionTracker'
import { useMotionStore } from '../../store/useMotionStore'
import { GestureMapper } from '../../gestures/GestureMapper'
import { PointerTracker } from '../../gestures/PointerTracker'
import { usePointerStore } from '../../store/usePointerStore'

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]
 
const panel: CSSProperties = {
  position: 'absolute',
  right: 16,
  bottom: 16,
  width: 280,
  padding: 8,
  background: 'rgba(2, 20, 32, 0.7)',
  border: '1px solid rgba(56, 232, 255, 0.4)',
  borderRadius: 8,
  backdropFilter: 'blur(6px)',
}

const stage: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '4 / 3',
  background: '#000',
  borderRadius: 4,
  overflow: 'hidden',
}

// Mirrored so it behaves like a mirror: moving your right hand moves it to the right on screen.
const layer: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  transform: 'scaleX(-1)',
  objectFit: 'cover',
}

const toggleBtn: CSSProperties = {
  width: '100%',
  marginTop: 8,
  padding: '8px 10px',
  background: 'transparent',
  color: '#cfeeff',
  border: '1px solid rgba(56, 232, 255, 0.6)',
  borderRadius: 4,
  cursor: 'pointer',
  letterSpacing: 1,
  textTransform: 'uppercase',
  fontSize: 12,
}

export default function GestureController() {
  const enabled = useAppStore((s) => s.handControlEnabled)
  const status = useAppStore((s) => s.trackerStatus)
  const handsDetected = useAppStore((s) => s.handsDetected)
  const setEnabled = useAppStore((s) => s.setHandControlEnabled)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!enabled) return

    const { setTrackerStatus, setHandsDetected, setHandControlEnabled, setGesture } =
      useAppStore.getState()
    const tracker = new HandTracker()
    const recognizer = new GestureRecognizer() // NEW
    const motionTracker = new MotionTracker()
    const mapper = new GestureMapper()
    const pointerTracker = new PointerTracker()
    let lastPublish = 0
    let stream: MediaStream | null = null
    let raf = 0
    let cancelled = false

    const start = async () => {
      try {
        setTrackerStatus('loading')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        await tracker.init()
        if (cancelled) return

        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        setTrackerStatus('ready')

        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!

        const loop = () => {
          raf = requestAnimationFrame(loop)
          const hands = tracker.detect(video, performance.now())
          if (hands === null) return // no new frame yet

          if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          for (const hand of hands) {
            ctx.strokeStyle = '#38e8ff'
            ctx.lineWidth = 2
            for (const [a, b] of CONNECTIONS) {
              const p = hand.landmarks[a]
              const q = hand.landmarks[b]
              ctx.beginPath()
              ctx.moveTo(p.x * canvas.width, p.y * canvas.height)
              ctx.lineTo(q.x * canvas.width, q.y * canvas.height)
              ctx.stroke()
            }
            ctx.fillStyle = '#ffffff'
            for (const p of hand.landmarks) {
              ctx.beginPath()
              ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2)
              ctx.fill()
            }
          }

          // NEW: recognize gestures and publish only when something visibly changed
          const frame = recognizer.update(hands)
          const now = performance.now()
          const motion = motionTracker.update(hands, frame, now)
          mapper.update(frame, motion, now)
          usePointerStore.getState().publish(pointerTracker.update(frame, now))
          if (motion.swipe) useMotionStore.getState().registerSwipe(motion.swipe)
          if (now - lastPublish > 100) {
            lastPublish = now
            const h = motion.hands[0]
            useMotionStore.getState().publish({
              dx: h?.dx ?? 0,
              dy: h?.dy ?? 0,
              droll: h?.droll ?? 0,
              twoHandDelta: motion.twoHandDelta,
            })
          }
          const conf = frame.hands.length
            ? Math.round((frame.hands.reduce((s, h) => s + h.confidence, 0) / frame.hands.length) * 20) / 20
            : 0
          const st = useAppStore.getState()
          if (st.gestureLabel !== frame.label || st.gestureConfidence !== conf) {
            setGesture(frame.label, conf)
          }

          if (st.handsDetected !== hands.length) {
            setHandsDetected(hands.length)
          }
        }
        loop()
      } catch (err) {
        console.error('Hand control failed:', err)
        setTrackerStatus('error')
        setHandControlEnabled(false)
      }
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
      tracker.close()
      if (videoRef.current) videoRef.current.srcObject = null
      setHandsDetected(0)
      setGesture('No hand', 0) // NEW
      useMotionStore.getState().clear()
      useAppStore.getState().setInteractionMode('Idle')
      usePointerStore.getState().clear()
      if (useAppStore.getState().trackerStatus !== 'error') setTrackerStatus('idle')
    }
  }, [enabled])

  const statusText =
    status === 'loading'
      ? 'Loading hand tracker...'
      : status === 'error'
        ? 'Camera or tracker failed (see console)'
        : enabled
          ? handsDetected > 0
            ? `Hand detected (${handsDetected})`
            : 'No hand detected'
          : 'Camera off'

  return (
    <div style={panel}>
      <div style={stage}>
        <video ref={videoRef} style={layer} playsInline muted />
        <canvas ref={canvasRef} style={layer} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#38e8ff' }}>{statusText}</div>
      <button style={toggleBtn} onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Disable Hand Control' : 'Enable Hand Control'}
      </button>
    </div>
  )
}