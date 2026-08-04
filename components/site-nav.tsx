// "API" link removed per design spec.
// "Features" smooth-scrolls to the Workspace slide (#workspace).
// "History" smooth-scrolls to the Ledger slide (#ledger).
// Logo: Glesary brush font — no capsule/border, theme-coloured wordmark.
const links = [
  { label: "Features", href: "#workspace" },
  { label: "History",  href: "#ledger"    },
]

export function SiteNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
      {/* ── Logo — Glesary brush font, no capsule ── */}
      <a
        href="#top"
        className="pointer-events-auto select-none leading-none transition-opacity hover:opacity-80"
        aria-label="LumaCut home"
      >
        <span
          style={{ fontFamily: "'Glesary', cursive", transform: "rotate(-4deg)", display: "inline-block" }}
          className="text-[2.5rem] leading-none tracking-wide text-cloud drop-shadow-[0_1px_12px_rgba(120,220,230,0.55)]"
        >
          Luma<span className="text-aqua-soft">Cut</span>
        </span>
      </a>

      {/* ── Nav links ── */}
      <nav
        aria-label="Primary"
        className="pointer-events-auto hidden items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-md md:flex"
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded-full px-4 py-1.5 text-sm font-light text-cloud/90 transition-colors hover:bg-white/15 hover:text-cloud"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
