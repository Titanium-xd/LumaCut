"use client"

import { useEffect, useRef, useState } from "react"
import { HeroSlide } from "@/components/hero-slide"
import { WorkspaceSlide } from "@/components/workspace-slide"
import { LedgerSlide } from "@/components/features-slide"

export default function Page() {
  const heroWrapRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      // progress 0→1 across the first viewport of scrolling (drives hero blur/scale/fade)
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
      setProgress(p)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <main className="relative bg-ink">
      {/* ── Slide 1: Hero — sticky so Slide 2 glides up on top of it ── */}
      <div ref={heroWrapRef} className="sticky top-0 h-screen">
        <div
          style={{
            filter: `blur(${progress * 12}px)`,
            transform: `scale(${1 - progress * 0.06})`,
            opacity: 1 - progress * 0.45,
          }}
          className="h-full will-change-transform"
        >
          <HeroSlide />
        </div>
      </div>

      {/* ── Slide 2: Workspace — scrolls up over the sticky hero ── */}
      <div className="relative z-20">
        <WorkspaceSlide />
      </div>

      {/* ── Slide 3: Ledger — history + why Luma Cut ── */}
      <div className="relative z-20">
        <LedgerSlide />
      </div>
    </main>
  )
}
