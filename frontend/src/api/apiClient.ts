const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type UploadResult = {
  image_id: string
  filename: string
  width: number
  height: number
  format: string
}

export type AnalysisResult = {
  width: number
  height: number
  format: string
  dominant_color: string
  detected_object: string | null
  note: string
}

export type GenerateResult = {
  model_id: string
  name: string
  url: string
  source: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, init)
  } catch {
    throw new Error('Cannot reach the backend. Is it running on port 8000?')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') message = body.detail
    } catch {
      // keep the default message
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const absoluteUrl = (path: string) => `${API}${path}`

export function uploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  return request<UploadResult>('/api/upload-image', { method: 'POST', body: form })
}

export function analyzeImage(imageId: string) {
  return request<AnalysisResult>('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId }),
  })
}

export function generateModel(body: { prompt?: string; image_id?: string }) {
  return request<GenerateResult>('/api/generate-model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}