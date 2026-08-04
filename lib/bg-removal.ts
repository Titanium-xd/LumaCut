/**
 * lib/bg-removal.ts
 *
 * Thin wrapper around @imgly/background-removal.
 * Dynamically imported to guarantee it never runs on the server (SSR-safe).
 * Provides typed progress callbacks so the UI can show:
 *   – a model-download overlay (first use, ~40 MB)
 *   – a per-image inference phase indicator
 */

export type ModelProgressCallback = (downloaded: number, total: number) => void
export type PhaseCallback = (phase: string) => void

export interface RemovalResult {
  blob: Blob
  /** Base64 data-URL of the transparent PNG — safe to store in IndexedDB */
  dataUrl: string
}

/**
 * Process a single image file through the ONNX background-removal model.
 *
 * @param file              The source image file (any browser-supported format)
 * @param onModelProgress   Called while model assets are being downloaded
 * @param onPhase           Called with phase label during inference steps
 */
export async function processImage(
  file: File,
  onModelProgress?: ModelProgressCallback,
  onPhase?: PhaseCallback,
): Promise<RemovalResult> {
  // Dynamic import keeps onnxruntime-web out of the SSR bundle entirely
  const { removeBackground } = await import('@imgly/background-removal')

  // Aggregate individual fetch operations (WASM binary + ONNX model weights)
  // into a single progress value so the UI shows one coherent progress bar.
  const fetchMap: Record<string, { current: number; total: number }> = {}

  const blob = await removeBackground(file, {
    progress: (key: string, current: number, total: number) => {
      if (key.startsWith('fetch:') && total > 0) {
        fetchMap[key] = { current, total }
        const downloaded = Object.values(fetchMap).reduce((s, p) => s + p.current, 0)
        const totalBytes = Object.values(fetchMap).reduce((s, p) => s + p.total, 0)
        onModelProgress?.(downloaded, totalBytes)
      } else if (!key.startsWith('fetch:')) {
        onPhase?.(key)
      }
    },
    output: {
      format: 'image/png',
      quality: 1,
    },
  })

  // Convert blob → data-URL for IndexedDB persistence
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  return { blob, dataUrl }
}
