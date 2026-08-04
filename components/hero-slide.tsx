"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, MousePointer2 } from "lucide-react"
import { SiteNav } from "@/components/site-nav"

// Half-width of the reveal strip in px, and its slant offset (top edge pushed right => forward slash)
const HALF_WIDTH = 95
const SLANT = 70

export function HeroSlide() {
  const sectionRef = useRef<HTMLElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  // target follows the cursor instantly; current lerps toward it for the spring "lag"
  const target = useRef(0.5)
  const current = useRef(0.5)
  const raf = useRef<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    const section = sectionRef.current
    if (!section) return

    const applyClip = () => {
      const el = revealRef.current
      if (!el) return
      const w = section.clientWidth || window.innerWidth
      const x = current.current * w
      const left = x - HALF_WIDTH
      const right = x + HALF_WIDTH
      // Forward-slash slanted strip: top edge shifted right, bottom edge shifted left
      el.style.clipPath = `polygon(${left + SLANT}px 0, ${right + SLANT}px 0, ${right - SLANT}px 100%, ${left - SLANT}px 100%)`
    }

    const tick = () => {
      // spring-ish easing: move a fraction of the remaining distance each frame
      current.current += (target.current - current.current) * 0.12
      applyClip()
      raf.current = requestAnimationFrame(tick)
    }

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      target.current = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    }

    applyClip()
    raf.current = requestAnimationFrame(tick)
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("resize", applyClip)

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("resize", applyClip)
    }
  }, [])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-ink"
      aria-label="Luma Cut hero"
    >
      {/* Bottom layer: original, untouched photo */}
      <div className="absolute inset-0">
        <img
          src="/girl_2.jpg"
          alt="Illustration of a girl holding a cyan paper parasol beneath cherry blossoms"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Reveal layer: transparency mesh + isolated subject, clipped into a slanted strip that tracks the cursor */}
      <div
        ref={revealRef}
        className="mesh-checker absolute inset-0"
        style={{ clipPath: "polygon(45% 0, 55% 0, 55% 100%, 45% 100%)" }}
        aria-hidden="true"
      >
        <img
          src="/girl_bgremoved.png"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* subtle glow on the strip edges for a premium "scanner" feel */}
        <div className="absolute inset-0 ring-1 ring-inset ring-aqua/40 shadow-[0_0_60px_rgba(120,220,230,0.35)]" />
      </div>

      {/* Legibility scrims */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/70" />

      <SiteNav />

      {/* Editorial copy */}
      <div className="relative z-20 flex h-full flex-col justify-center px-6 md:px-10 lg:px-16">
        <div className="max-w-2xl">

          <h1 className="mt-6 font-serif text-4xl font-light leading-[1.05] tracking-tight text-balance text-cloud sm:text-6xl lg:text-7xl">
            Unmistakable clarity.
            <br />
            <span className="italic text-aqua-soft">Instant</span> precision.
          </h1>

          <p className="mt-6 max-w-md text-pretty text-base font-light leading-relaxed text-cloud/80 sm:text-lg">
            Upload to isolate your subjects instantly. Studio-grade cutouts with
            hair-fine edges — rendered right in your browser.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            {/* ── Start your cut — fancy shimmer button ── */}
            <button
              type="button"
              id="hero-cta"
              onClick={() =>
                document
                  .getElementById("workspace")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className={[
                // Base shape & colour (keep the white theme)
                "group relative inline-flex items-center gap-2.5 overflow-hidden",
                "rounded-full px-7 py-3.5 text-sm font-semibold text-ink",
                "bg-cloud/95 shadow-[0_4px_24px_rgba(255,255,255,0.18),0_1px_4px_rgba(0,0,0,0.25)]",
                // Subtle gradient border ring
                "ring-1 ring-white/30 hover:ring-white/60",
                // Smooth transitions
                "transition-all duration-300 ease-out",
                "hover:bg-cloud hover:shadow-[0_6px_32px_rgba(255,255,255,0.28),0_2px_8px_rgba(0,0,0,0.3)]",
                "hover:scale-[1.03] active:scale-[0.98]",
                "backdrop-blur-md",
              ].join(" ")}
            >
              {/* Shimmer sweep overlay */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
              />
              <span className="relative">Start your cut</span>
              <ArrowUpRight
                className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-12"
              />
            </button>

            <span
              className={`inline-flex items-center gap-2 text-sm font-light text-cloud/70 transition-opacity duration-700 ${
                hydrated ? "opacity-100" : "opacity-0"
              }`}
            >
              <MousePointer2 className="size-4" />
              Move your cursor to reveal the cut
            </span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
        <span className="text-xs font-light uppercase tracking-[0.25em] text-cloud/50">
          Scroll
        </span>
      </div>
    </section>
  )
}
