import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

export type TrackedHand = {
  landmarks: NormalizedLandmark[]
  handedness: 'Left' | 'Right'
  score: number
}

const WASM_URL = '/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

export class HandTracker {
  private landmarker: HandLandmarker | null = null
  private lastVideoTime = -1

  async init() {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL)
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.6,
    })
  }

  /** Returns null if the frame has not changed since the last call. */
  detect(video: HTMLVideoElement, timestamp: number): TrackedHand[] | null {
    if (!this.landmarker || video.readyState < 2) return null
    if (video.currentTime === this.lastVideoTime) return null
    this.lastVideoTime = video.currentTime

    const result = this.landmarker.detectForVideo(video, timestamp)
    return result.landmarks.map((landmarks, i) => ({
      landmarks,
      handedness: (result.handedness[i]?.[0]?.categoryName ?? 'Right') as 'Left' | 'Right',
      score: result.handedness[i]?.[0]?.score ?? 0,
    }))
  }

  close() {
    this.landmarker?.close()
    this.landmarker = null
    this.lastVideoTime = -1
  }
}