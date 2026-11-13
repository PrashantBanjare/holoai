import { useEffect, useRef, type CSSProperties } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { HandTracker } from '../../gestures/HandTracker'
import { GestureRecognizer } from '../../gestures/GestureRecognizer'
import { MotionTracker } from '../../gestures/MotionTracker'
import { PointerTracker } from '../../gestures/PointerTracker'
import { GestureMapper } from '../../gestures/GestureMapper'
import { useMotionStore } from '../../store/useMotionStore'
import { usePointerStore } from '../../store/usePointerStore'
import Panel from '../../ui/Panel'
import { C, btn } from '../../ui/theme'

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]

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

export default function GestureController() {
  const enabled = useAppStore((s) => s.handControlEnabled)
  const status = useAppStore((s) => s.trackerStatus)
  const trackerMessage = useAppStore((s) => s.trackerMessage)
  const handsDetected = useAppStore((s) => s.handsDetected)
  const setEnabled = useAppStore((s) => s.setHandControlEnabled)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!enabled) return

    const { setTrackerStatus, setHandsDetected, setHandControlEnabled, setGesture } =
      useAppStore.getState()
    const tracker = new HandTracker()
    const recognizer = new GestureRecognizer()
    const motionTracker = new MotionTracker()
    const pointerTracker = new PointerTracker()
    const mapper = new GestureMapper()
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

          // Recognize gestures, turn them into motion, and apply them to the model
          const now = performance.now()
          const frame = recognizer.update(hands)
          const motion = motionTracker.update(hands, frame, now)
          const pointer = pointerTracker.update(frame, now)
          mapper.update(frame, motion, now)

          const m0 = motion.hands[0]
          useMotionStore.getState().publish({
            dx: m0?.dx ?? 0,
            dy: m0?.dy ?? 0,
            droll: m0?.droll ?? 0,
            twoHandDelta: motion.twoHandDelta,
          })
          if (motion.swipe) useMotionStore.getState().registerSwipe(motion.swipe)
          usePointerStore.getState().publish(pointer)

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
        const name = err instanceof DOMException ? err.name : ''
        const message =
          name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow the camera in the browser address bar and try again.'
            : name === 'NotFoundError'
              ? 'No camera found.'
              : name === 'NotReadableError'
                ? 'The camera is busy in another app.'
                : 'Could not start hand tracking (is hand_landmarker.task in public/models?).'
        setTrackerStatus('error', message)
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
      setGesture('No hand', 0)
      useMotionStore.getState().clear()
      usePointerStore.getState().clear()
      useAppStore.getState().setInteractionMode('Idle')
      if (useAppStore.getState().trackerStatus !== 'error') setTrackerStatus('idle')
    }
  }, [enabled])

  const statusText =
    status === 'loading'
      ? 'Loading hand tracker...'
      : status === 'error'
        ? trackerMessage || 'Camera or tracker failed (see console)'
        : enabled
          ? handsDetected > 0
            ? `Hand detected (${handsDetected})`
            : 'No hand detected'
          : 'Camera off'

  return (
    <Panel title="Camera">
      <div style={stage}>
        <video ref={videoRef} style={layer} playsInline muted />
        <canvas ref={canvasRef} style={layer} />
        {!enabled && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              fontSize: 12,
            }}
          >
            Camera off
          </div>
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: status === 'error' ? C.danger : C.accent }}>
        {statusText}
      </div>
      <button style={{ ...btn(enabled), width: '100%', marginTop: 8 }} onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Turn camera off' : 'Turn camera on'}
      </button>
    </Panel>
  )
}
