import { useEffect, useRef, useState } from 'react'
import Panel from '../../ui/Panel'
import { C, btn, input } from '../../ui/theme'
import { useVoiceStore } from '../../store/useVoiceStore'
import { runCommand, COMMAND_HELP } from '../../voice/commands'
import { speechSupported, startSpeech, type SpeechHandle } from '../../voice/speech'

export default function VoiceControl() {
  const { supported, listening, transcript, feedback } = useVoiceStore()
  const [typed, setTyped] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const handle = useRef<SpeechHandle | null>(null)

  useEffect(() => {
    useVoiceStore.getState().setSupported(speechSupported())
    return () => handle.current?.stop()
  }, [])

  const run = (text: string) => {
    const result = runCommand(text)
    if (result) useVoiceStore.getState().setFeedback(result)
  }

  const toggle = () => {
    const v = useVoiceStore.getState()
    if (v.listening) {
      handle.current?.stop()
      return
    }
    const h = startSpeech({
      onText: (text, isFinal) => {
        useVoiceStore.getState().setTranscript(text.trim())
        if (isFinal) run(text)
      },
      onError: (m) => useVoiceStore.getState().setFeedback(m),
      onEnd: () => {
        handle.current = null
        useVoiceStore.getState().setListening(false)
      },
    })
    if (h) {
      handle.current = h
      v.setListening(true)
      v.setFeedback('Listening...')
    }
  }

  const submit = () => {
    if (!typed.trim()) return
    useVoiceStore.getState().setTranscript(typed.trim())
    run(typed)
    setTyped('')
  }

  return (
    <Panel title="Voice control" defaultOpen={false}>
      <button
        style={{ ...btn(listening, !supported), width: '100%', flex: 'none' }}
        disabled={!supported}
        onClick={toggle}
      >
        {listening ? '● Listening - click to stop' : '🎤 Start listening'}
      </button>

      {!supported && (
        <div style={{ marginTop: 6, color: C.warn, lineHeight: 1.5 }}>
          Speech recognition is not available in this browser (Brave blocks it). Use Chrome or Edge for the
          microphone, or type commands below.
        </div>
      )}

      <input
        style={{ ...input, marginTop: 8 }}
        value={typed}
        placeholder='Type a command, e.g. "explode"'
        onChange={(e) => setTyped(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />

      {transcript && <div style={{ marginTop: 8, color: C.muted }}>Heard: "{transcript}"</div>}
      {feedback && <div style={{ marginTop: 2, color: C.white }}>{feedback}</div>}

      <div
        style={{ marginTop: 8, color: C.accent, cursor: 'pointer' }}
        onClick={() => setShowHelp(!showHelp)}
      >
        {showHelp ? '▾' : '▸'} Commands
      </div>
      {showHelp && (
        <ul style={{ margin: '4px 0 0', paddingLeft: 16, color: C.muted, lineHeight: 1.6 }}>
          {COMMAND_HELP.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
