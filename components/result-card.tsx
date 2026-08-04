"use client"

import { Download, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export type ItemStatus = "queued" | "processing" | "done" | "error"

export interface ProcessedItem {
  id: string
  file: File
  /** Object URL for the original file — created at drop time */
  inputUrl: string
  outputDataUrl?: string
  outputBlob?: Blob
  status: ItemStatus
  error?: string
}

interface Props {
  item: ProcessedItem
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; cls: string }> = {
  queued:     { label: "Queued",       cls: "bg-white/10 text-cloud/45" },
  processing: { label: "Processing…", cls: "bg-aqua/15 text-aqua-soft" },
  done:       { label: "Done",         cls: "bg-aqua/15 text-aqua-soft" },
  error:      { label: "Error",        cls: "bg-red-500/20 text-red-400" },
}

/**
 * ResultCard
 *
 * Displays a before/after thumbnail pair for a single processed image.
 * Download button appears only when status === "done".
 */
export function ResultCard({ item }: Props) {
  const { label, cls } = STATUS_CONFIG[item.status]

  const handleDownload = () => {
    if (!item.outputBlob) return
    const url = URL.createObjectURL(item.outputBlob)
    const a = document.createElement("a")
    a.href = url
    // Strip original extension, prepend "lumacut_"
    a.download = `lumacut_${item.file.name.replace(/\.[^.]+$/, "")}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:border-white/18 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/30">
      {/* Thumbnail strip — 2:1 aspect, split 50/50 before/after */}
      <div className="relative flex aspect-[2/1] overflow-hidden">
        {/* ── Before ── */}
        <div className="relative w-1/2 shrink-0 overflow-hidden border-r border-white/10">
          <img
            src={item.inputUrl}
            alt="Original"
            className="h-full w-full object-cover"
            draggable={false}
          />
          <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-light text-cloud/65 backdrop-blur-sm">
            Before
          </span>
        </div>

        {/* ── After ── */}
        <div className="relative w-1/2 shrink-0 overflow-hidden">
          {item.outputDataUrl ? (
            /* Transparency checker under the cut-out */
            <div className="mesh-checker h-full w-full">
              <img
                src={item.outputDataUrl}
                alt="Background removed"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ) : (
            /* Pending / error states */
            <div className="flex h-full w-full items-center justify-center bg-white/[0.025]">
              {item.status === "processing" && (
                <Loader2 className="size-6 animate-spin text-aqua-soft" aria-label="Processing" />
              )}
              {item.status === "queued" && (
                <span className="text-xs font-light text-cloud/30">In queue</span>
              )}
              {item.status === "error" && (
                <AlertCircle className="size-6 text-red-400" aria-label="Error" />
              )}
            </div>
          )}
          <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-light text-cloud/65 backdrop-blur-sm">
            After
          </span>
        </div>

        {/* Arrow divider badge */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
          <div className="flex size-6 items-center justify-center rounded-full border border-white/20 bg-ink/80 shadow-md backdrop-blur-sm">
            <ArrowRight className="size-3 text-cloud/55" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-2.5 px-3 py-3">
        {/* File name + size */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-cloud" title={item.file.name}>
            {item.file.name}
          </p>
          <p className="text-xs font-light text-cloud/40">
            {(item.file.size / 1024).toFixed(0)} KB
          </p>
        </div>

        {/* Status badge */}
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-light ${cls}`}>
          {label}
        </span>

        {/* Download button — only when done */}
        {item.status === "done" && (
          <button
            type="button"
            id={`download-${item.id}`}
            onClick={handleDownload}
            title="Download transparent PNG"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cloud/65 transition-all hover:border-aqua/35 hover:bg-aqua/10 hover:text-aqua-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua/50"
          >
            <Download className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Error detail */}
      {item.status === "error" && item.error && (
        <p className="border-t border-white/8 px-3 pb-3 pt-2 text-xs font-light text-red-400/80">
          {item.error}
        </p>
      )}
    </article>
  )
}
