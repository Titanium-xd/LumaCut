"use client"

import { useEffect, useState } from "react"
import { Cpu, Layers, Download, ArrowRight } from "lucide-react"
import type { SessionEntry } from "@/lib/session-store"

// ─── Feature data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Cpu,
    title: "WASM Privacy",
    desc: "Inference runs locally in your browser. Your images never leave the device.",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    desc: "Drop an entire folder and cut every subject in a single, seamless pass.",
  },
  {
    icon: Download,
    title: "High-Res PNG Export",
    desc: "Download lossless transparent PNGs at full source resolution — no caps.",
  },
]

// ─── Section (Slide 3) ────────────────────────────────────────────────────────

/**
 * LedgerSlide — Slide 3
 *
 * The "Everything stays sharp, private, and fast." section.
 * Contains:
 *  – HistoryCard: dynamically populated from IndexedDB
 *  – FeaturesCard: static feature list (API button removed)
 */
export function LedgerSlide() {
  return (
    <section
      id="ledger"
      className="relative z-20 min-h-screen border-t border-white/10 bg-ink/80 px-6 py-20 backdrop-blur-2xl md:px-10 md:py-28 lg:px-16"
      aria-label="Features and history"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="text-xs font-light uppercase tracking-[0.25em] text-aqua-soft">
            Built for precision
          </span>
          <h2 className="mt-4 font-serif text-3xl font-light leading-tight tracking-tight text-balance text-cloud sm:text-5xl">
            Everything stays sharp,
            <br />
            <span className="italic text-aqua-soft">private</span>, and fast.
          </h2>
        </div>

        {/* Card grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HistoryCard />
          <FeaturesCard />
        </div>
      </div>
    </section>
  )
}

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard() {
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Load from IndexedDB on mount (dynamic import keeps localforage out of SSR)
  useEffect(() => {
    import("@/lib/session-store")
      .then(({ loadSessions }) => loadSessions())
      .then((data) => {
        setSessions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const isEmpty = !loading && sessions.length === 0

  return (
    <article
      id="history"
      className="animate-float rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
    >
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-light text-cloud">Session history</h3>
          <p className="mt-1 text-sm font-light text-cloud/60">Recent cuts, cached on-device</p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-light text-cloud/70">
          {loading ? "…" : `${sessions.length} item${sessions.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <ul className="mt-6 space-y-3" aria-busy="true" aria-label="Loading history">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-[60px] animate-pulse rounded-2xl bg-white/[0.03]"
              aria-hidden="true"
            />
          ))}
        </ul>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-sm font-light text-cloud/40">No sessions yet</p>
          <p className="mt-1 text-xs font-light text-cloud/28">
            Process an image above to see your history here
          </p>
        </div>
      )}

      {/* Session list — capped at 5, scrollable */}
      {!loading && sessions.length > 0 && (
        <ul className="mt-6 max-h-[360px] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:oklch(0.82_0.11_195/0.25)_transparent]">
          {sessions.slice(0, 5).map((session) => (
            <li
              key={session.id}
              className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
            >
              {/* Before / after thumbnail pair */}
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="relative block size-12 overflow-hidden rounded-lg ring-1 ring-white/10">
                  <img
                    src={session.inputDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-cloud/40" aria-hidden="true" />
                <span className="mesh-checker relative block size-12 overflow-hidden rounded-lg ring-1 ring-aqua/30">
                  <img
                    src={session.outputDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </span>
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cloud" title={session.fileName}>
                  {session.fileName}
                </p>
                <p className="text-xs font-light text-cloud/50">
                  {formatRelativeTime(session.timestamp)}
                </p>
              </div>

              {/* Done badge */}
              <span className="shrink-0 rounded-full bg-aqua/15 px-2.5 py-1 text-[11px] font-light text-aqua-soft">
                Done
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

// ─── Features card ────────────────────────────────────────────────────────────

function FeaturesCard() {
  return (
    <article
      id="why"
      className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
    >
      <h3 className="font-serif text-xl font-light text-cloud">Why Luma Cut</h3>
      <p className="mt-1 text-sm font-light text-cloud/60">A precise, private toolkit</p>

      <ul className="mt-6 space-y-2">
        {FEATURES.map((f) => (
          <li
            key={f.title}
            className="flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-aqua/25 bg-aqua/10 text-aqua-soft">
              <f.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-medium text-cloud">{f.title}</p>
              <p className="mt-1 text-sm font-light leading-relaxed text-cloud/65">{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* "Explore the API" button intentionally removed per design spec */}
    </article>
  )
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Returns a human-friendly relative time string ("2 min ago", "1 hr ago", etc.) */
function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
}
