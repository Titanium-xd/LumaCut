import { Scissors } from "lucide-react"

// "API" link removed per design spec.
// "Features" now smooth-scrolls to the Workspace slide (#workspace).
// "History" smooth-scrolls to the Ledger slide (#ledger).
const links = [
  { label: "Features", href: "#workspace" },
  { label: "History", href: "#ledger" },
]

export function SiteNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
      {/* Logo */}
      <a
        href="#top"
        className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-cloud text-ink">
          <Scissors className="size-3.5" aria-hidden="true" />
        </span>
        <span className="font-serif text-lg leading-none tracking-tight text-cloud">
          Luma<span className="italic text-aqua-soft">Cut</span>
        </span>
      </a>

      {/* Nav */}
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
