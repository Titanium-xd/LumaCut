"use client"

interface Props {
  /** 1-based index of the image currently being processed */
  current: number
  /** Total number of images in this batch */
  total: number
}

/**
 * BatchProgressBar
 *
 * Shown when a batch of 2+ images is being processed sequentially.
 * Displays "Processing X of N" with an animated progress fill.
 */
export function BatchProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.round(((current - 1) / total) * 100) : 0

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Pulsing dot */}
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-aqua" />
          </span>
          <p className="text-sm font-light text-cloud/80">
            Processing{" "}
            <span className="font-medium text-cloud">{current}</span>
            {" "}of{" "}
            <span className="font-medium text-cloud">{total}</span>
          </p>
        </div>
        <span className="text-xs font-light tabular-nums text-cloud/45">{pct}%</span>
      </div>

      {/* Progress track */}
      <div className="mt-3 h-px w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-aqua/70 to-aqua-soft transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
