import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { absoluteUrl, analyzeImage, generateModel, uploadImage } from '../../api/apiClient'
import { useModelStore } from '../../store/useModelStore'
import { useAppStore } from '../../store/useAppStore'
import { useExplodeStore } from '../../store/useExplodeStore'

const MAX_MB = 10
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

const panel: CSSProperties = {
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 340,
  padding: 12,
  background: 'rgba(2, 20, 32, 0.75)',
  border: '1px solid rgba(56, 232, 255, 0.4)',
  borderRadius: 8,
  backdropFilter: 'blur(6px)',
  fontSize: 12,
}

const title: CSSProperties = {
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#38e8ff',
  marginBottom: 8,
}

const input: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(0, 0, 0, 0.35)',
  color: '#ffffff',
  border: '1px solid rgba(56, 232, 255, 0.5)',
  borderRadius: 4,
  outline: 'none',
  fontSize: 13,
}

const dropzone: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginTop: 8,
  padding: 8,
  minHeight: 48,
  border: '1px dashed rgba(56, 232, 255, 0.6)',
  borderRadius: 4,
  cursor: 'pointer',
  color: '#7fb8c8',
}

const generateBtn = (disabled: boolean): CSSProperties => ({
  width: '100%',
  marginTop: 8,
  padding: '9px 10px',
  textTransform: 'uppercase',
  letterSpacing: 1,
  fontSize: 12,
  color: disabled ? '#4d7a88' : '#02060d',
  background: disabled ? 'transparent' : '#38e8ff',
  border: `1px solid ${disabled ? 'rgba(56,232,255,0.3)' : '#38e8ff'}`,
  borderRadius: 4,
  cursor: disabled ? 'default' : 'pointer',
})

export default function UploadPanel() {
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [note, setNote] = useState('')

  const status = useModelStore((s) => s.status)
  const message = useModelStore((s) => s.message)
  const modelName = useModelStore((s) => s.name)
  const source = useModelStore((s) => s.source)

  const inputRef = useRef<HTMLInputElement>(null)
  const busy = status === 'uploading' || status === 'analyzing' || status === 'generating'

  const pickFile = useCallback((f: File | null | undefined) => {
    if (!f) return
    const { setStatus } = useModelStore.getState()
    if (!TYPES.includes(f.type)) {
      setStatus('error', 'Only JPG, PNG or WEBP images are allowed.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setStatus('error', `The image is larger than ${MAX_MB} MB.`)
      return
    }
    setFile(f)
    setNote('')
    setStatus('idle', '')
  }, [])

  // Preview thumbnail
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Drag and drop anywhere on the page
  useEffect(() => {
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
    const over = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      setDragging(true)
    }
    const leave = (e: DragEvent) => {
      if (e.relatedTarget === null) setDragging(false)
    }
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      setDragging(false)
      pickFile(e.dataTransfer?.files?.[0])
    }
    window.addEventListener('dragover', over)
    window.addEventListener('dragleave', leave)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragover', over)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('drop', drop)
    }
  }, [pickFile])

  const generate = async () => {
    const text = prompt.trim()
    const { setStatus, setModel } = useModelStore.getState()
    if (!text && !file) {
      setStatus('error', 'Type an object name or add an image.')
      return
    }

    try {
      let imageId: string | undefined
      setNote('')

      if (file) {
        setStatus('uploading', 'Uploading image...')
        imageId = (await uploadImage(file)).image_id

        setStatus('analyzing', 'Analyzing image...')
        const a = await analyzeImage(imageId)
        setNote(`Image ${a.width}x${a.height}, dominant color ${a.dominant_color}. ${a.note}`)
      }

      setStatus('generating', 'Generating model...')
      const result = await generateModel({ prompt: text || undefined, image_id: imageId })

      setModel({ url: absoluteUrl(result.url), name: result.name, source: result.source })
      useAppStore.getState().reset()
      useExplodeStore.getState().returnToOriginal()
      setStatus('idle', `Loaded: ${result.name}`)
    } catch (e) {
      setStatus('error', e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  return (
    <>
      {dragging && (
        <div
          style={{
            position: 'absolute',
            inset: 12,
            zIndex: 10,
            pointerEvents: 'none',
            border: '2px dashed #38e8ff',
            borderRadius: 12,
            background: 'rgba(56, 232, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#38e8ff',
          }}
        >
          Drop image to upload
        </div>
      )}

      <div style={panel}>
        <div style={title}>Create hologram</div>

        <input
          style={input}
          value={prompt}
          maxLength={200}
          placeholder='Object name, e.g. "car engine"'
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && generate()}
        />

        <div style={dropzone} onClick={() => inputRef.current?.click()}>
          {preview ? (
            <>
              <img
                src={preview}
                alt="Upload preview"
                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }}
              />
              <span
                style={{
                  flex: 1,
                  color: '#cfeeff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file?.name}
              </span>
              <button
                style={{ background: 'transparent', border: 'none', color: '#cfeeff', cursor: 'pointer', fontSize: 16 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            </>
          ) : (
            <span>Click or drag an image here (JPG, PNG, WEBP)</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            pickFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <button style={generateBtn(busy)} disabled={busy} onClick={generate}>
          {busy ? 'Working...' : 'Generate'}
        </button>

        {message && (
          <div style={{ marginTop: 8, color: status === 'error' ? '#ff6b81' : '#38e8ff' }}>{message}</div>
        )}
        {note && <div style={{ marginTop: 4, color: '#7fb8c8' }}>{note}</div>}
        <div style={{ marginTop: 6, color: '#7fb8c8' }}>
          Model: <span style={{ color: '#ffffff' }}>{modelName}</span> ({source})
        </div>
      </div>
    </>
  )
}