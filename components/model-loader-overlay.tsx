"use client"

import { Cpu } from "lucide-react"

interface Props {
  /** Bytes downloaded so far across all model asset fetches */
  downloaded: number
  /** Total bytes expected (0 when not yet known) */
  total: number
}

function formatMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

/**
 * ModelLoaderOverlay
 *
 * Fixed, full-viewport frosted-glass overlay shown while the ONNX model is
 * being downloaded for the first time. Subsequent uses hit the browser Cache
 * API, so this overlay only appears once per device.
 */
export function ModelLoaderOverlay({ downloaded, total }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 0
  const knowsTotal = total > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-2xl">
      {/* Card */}
      <div className="relative mx-6 flex w-full max-w-sm flex-col items-center gap-7 overflow-hidden rounded-3xl border border-white/12 bg-white/[0.05] p-10 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {/* Ambient glow behind the card */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-aqua/5 blur-3xl" />

        {/* Icon */}
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-aqua/30 bg-aqua/10 shadow-[0_0_40px_rgba(120,220,230,0.15)]">
          <Cpu className="size-8 animate-pulse text-aqua-soft" aria-hidden="true" />
        </div>

        {/* Copy */}
        <div className="text-center">
          <h3 className="font-serif text-xl font-light text-cloud">
            Initializing AI Model
          </h3>
          <p className="mt-1.5 text-sm font-light leading-relaxed text-cloud/55">
            First-run setup · will be cached in your browser
          </p>
        </div>

        {/* Progress track */}
        <div className="w-full space-y-2.5">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            {/* Animated fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-aqua/80 to-aqua-soft transition-all duration-300 ease-out"
              style={{ width: `${knowsTotal ? pct : 0}%` }}
            />
            {/* Shimmer on top when total is unknown */}
            {!knowsTotal && (
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-aqua/30 to-transparent" />
            )}
          </div>

          {/* Byte counters */}
          <div className="flex items-center justify-between text-xs font-light text-cloud/45">
            <span>{knowsTotal ? formatMB(downloaded) : "Connecting…"}</span>
            <span>{knowsTotal ? formatMB(total) : ""}</span>
          </div>
        </div>

        {/* Percentage label */}
        <p className="text-xs font-light tracking-widest text-cloud/35 uppercase">
          {knowsTotal ? `${pct}% complete` : "Fetching model CDN…"}
        </p>
      </div>
    </div>
  )
}
