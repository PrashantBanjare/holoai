// Thin wrapper over the browser Web Speech API.
// Chrome and Edge support it. Brave and Firefox do not, so the UI falls back to typed commands.

type Rec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type RecCtor = new () => Rec

const getCtor = (): RecCtor | null => {
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const speechSupported = () => getCtor() !== null

export type SpeechHandle = { stop: () => void }

export function startSpeech(handlers: {
  onText: (text: string, isFinal: boolean) => void
  onError: (message: string) => void
  onEnd: () => void
}): SpeechHandle | null {
  const Ctor = getCtor()
  if (!Ctor) return null

  const rec = new Ctor()
  rec.lang = 'en-US'
  rec.continuous = true
  rec.interimResults = true

  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      handlers.onText(r[0].transcript, r.isFinal)
    }
  }
  rec.onerror = (e) => {
    const msg =
      e.error === 'not-allowed'
        ? 'Microphone permission was denied.'
        : e.error === 'network'
          ? 'Speech service unreachable (needs internet).'
          : e.error === 'no-speech'
            ? ''
            : `Speech error: ${e.error}`
    if (msg) handlers.onError(msg)
  }
  rec.onend = handlers.onEnd

  rec.start()
  return { stop: () => rec.stop() }
}
