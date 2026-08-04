"use client"

import { useCallback, useRef, useState } from "react"
import { Download, Sparkles } from "lucide-react"

import { Dropzone } from "@/components/dropzone"
import { ResultCard, type ProcessedItem, type ItemStatus } from "@/components/result-card"
import { ModelLoaderOverlay } from "@/components/model-loader-overlay"
import { BatchProgressBar } from "@/components/batch-progress-bar"
import { processImage } from "@/lib/bg-removal"
import { saveSession } from "@/lib/session-store"

// ─── Types ──────────────────────────────────────────────────────────────────

type ModelState = "idle" | "downloading" | "ready"

interface ModelProgress {
  downloaded: number
  total: number
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * WorkspaceSlide — Slide 2
 *
 * Orchestrates the entire image processing pipeline:
 *  1. Accept files via Dropzone (drag-and-drop or click-to-browse)
 *  2. Enqueue and process them sequentially via @imgly/background-removal
 *  3. Show the ModelLoaderOverlay on first use (ONNX model download)
 *  4. Show BatchProgressBar for multi-file batches
 *  5. Display ResultCard grid with individual download buttons
 *  6. Offer a "Download All as ZIP" button once all items are done
 *  7. Persist each completed cut to IndexedDB via session-store
 */
export function WorkspaceSlide() {
  // ── State ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<ProcessedItem[]>([])
  const [modelState, setModelState] = useState<ModelState>("idle")
  const [modelProgress, setModelProgress] = useState<ModelProgress>({ downloaded: 0, total: 0 })

  // ── Refs ───────────────────────────────────────────────────────────────
  // Processing queue: items waiting to be handled (not React state, avoids
  // stale-closure issues when draining the queue asynchronously).
  const queueRef = useRef<ProcessedItem[]>([])
  const isProcessingRef = useRef(false)
  // Once the model has been downloaded once, we skip the overlay for all
  // subsequent images in the same session (it's cached by the browser).
  const modelReadyRef = useRef(false)

  // ── Helpers ────────────────────────────────────────────────────────────
  const patchItem = useCallback((id: string, patch: Partial<ProcessedItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }, [])

  // ── Core processor ─────────────────────────────────────────────────────
  const processOne = useCallback(
    async (item: ProcessedItem) => {
      patchItem(item.id, { status: "processing" })

      try {
        const result = await processImage(
          item.file,
          // Model download progress
          (downloaded, total) => {
            if (modelReadyRef.current) return
            setModelState("downloading")
            setModelProgress({ downloaded, total })
            // Mark ready once all assets are fully downloaded
            if (total > 0 && downloaded >= total) {
              modelReadyRef.current = true
              setModelState("ready")
            }
          },
          // Inference phase callback (no UI needed but available for future use)
          (_phase) => {},
        )

        // In case progress never reached 100% (model was already cached)
        if (!modelReadyRef.current) {
          modelReadyRef.current = true
          setModelState("ready")
        }

        // ── Persist to IndexedDB ──
        // We store the object-URL as a data-URL so history survives across
        // page reloads (object-URLs are ephemeral, data-URLs are persistent).
        const inputDataUrl = await fileToDataUrl(item.file)
        await saveSession({
          id: item.id,
          fileName: item.file.name,
          inputDataUrl,
          outputDataUrl: result.dataUrl,
          timestamp: Date.now(),
        }).catch((err) => console.warn("[LumaCut] IndexedDB save failed:", err))

        patchItem(item.id, {
          status: "done",
          outputDataUrl: result.dataUrl,
          outputBlob: result.blob,
        })
      } catch (err) {
        console.error("[LumaCut] processOne error:", err)
        patchItem(item.id, { status: "error", error: String(err) })
        // Still mark model as ready so subsequent images don't show overlay
        if (!modelReadyRef.current) {
          modelReadyRef.current = true
          setModelState("idle")
        }
      }
    },
    [patchItem],
  )

  // ── Queue drain ────────────────────────────────────────────────────────
  const drainQueue = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!
      await processOne(next)
    }
    isProcessingRef.current = false
  }, [processOne])

  // ── File ingestion ─────────────────────────────────────────────────────
  const handleFiles = useCallback(
    (files: File[]) => {
      const newItems: ProcessedItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        inputUrl: URL.createObjectURL(file),
        status: "queued" as ItemStatus,
      }))

      setItems((prev) => [...prev, ...newItems])
      queueRef.current.push(...newItems)
      drainQueue()
    },
    [drainQueue],
  )

  // ── ZIP download ───────────────────────────────────────────────────────
  const handleDownloadAll = async () => {
    const readyItems = items.filter((it) => it.status === "done" && it.outputBlob)
    if (readyItems.length === 0) return

    const { default: JSZip } = await import("jszip")
    const zip = new JSZip()

    readyItems.forEach((it) => {
      const safeName = `lumacut_${it.file.name.replace(/\.[^.]+$/, "")}.png`
      zip.file(safeName, it.outputBlob!)
    })

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lumacut_batch_${readyItems.length}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Derived state ──────────────────────────────────────────────────────
  const totalCount = items.length
  const doneCount = items.filter((it) => it.status === "done").length
  const hasAnyItems = totalCount > 0
  const isProcessing = items.some((it) => it.status === "processing")
  const allSettled = hasAnyItems && items.every((it) => it.status === "done" || it.status === "error")
  const currentIdx = items.findIndex((it) => it.status === "processing") + 1 // 1-based

  const showModelOverlay = modelState === "downloading"
  const showBatchBar = totalCount > 1 && isProcessing
  const showZipButton = allSettled && doneCount >= 2

  return (
    <section
      id="workspace"
      className="relative z-20 min-h-screen border-t border-white/10 bg-ink/80 px-6 py-20 backdrop-blur-2xl md:px-10 md:py-28 lg:px-16"
      aria-label="Image processing workspace"
    >
      {/* Model download overlay — fixed so it's visible even if user hasn't scrolled */}
      {showModelOverlay && (
        <ModelLoaderOverlay
          downloaded={modelProgress.downloaded}
          total={modelProgress.total}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-10">
        {/* ── Section header ── */}
        <header className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-light uppercase tracking-[0.25em] text-aqua-soft">
            <Sparkles className="size-3" aria-hidden="true" />
            Zero-latency · In-browser WASM
          </span>
          <h2 className="mt-4 font-serif text-3xl font-light leading-tight tracking-tight text-balance text-cloud sm:text-5xl">
            The Workspace.
            <br />
            <span className="italic text-aqua-soft">Your</span> browser.
          </h2>
          <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-cloud/60">
            Drop images below. The AI model runs entirely on-device — no uploads, no
            servers, no latency. Your files never leave your machine.
          </p>
        </header>

        {/* ── Batch progress bar ── */}
        {showBatchBar && (
          <BatchProgressBar current={currentIdx} total={totalCount} />
        )}

        {/* ── Dropzone ── */}
        <Dropzone
          onFiles={handleFiles}
          disabled={isProcessing}
          compact={hasAnyItems}
        />

        {/* ── Results grid ── */}
        {hasAnyItems && (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Processing results"
          >
            {items.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* ── Download all as ZIP ── */}
        {showZipButton && (
          <button
            type="button"
            id="download-all-zip"
            onClick={handleDownloadAll}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-light text-cloud/75 backdrop-blur-sm transition-all duration-200 hover:border-aqua/30 hover:bg-aqua/[0.06] hover:text-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua/50"
          >
            <Download
              className="size-4 text-aqua-soft transition-transform duration-200 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
            Download all{" "}
            <span className="font-medium text-cloud">({doneCount} images)</span>
            {" "}as ZIP
          </button>
        )}
      </div>
    </section>
  )
}

// ── Utility ────────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
