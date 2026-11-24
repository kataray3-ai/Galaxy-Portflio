import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onBookClick: () => void;
}

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Constellation', href: '#constellation' },
  { label: 'Experience', href: '#experience' },
  { label: 'Programs', href: '#programs' },
  { label: 'Voices', href: '#voices' },
];

export function Navbar({ onBookClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04060E]/92">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B041]"
        >
          Digital Yamini
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#F5B041] after:transition-all after:duration-200 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B041]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (plus mobile menu toggle on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBookClick}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#F5B041] px-4 py-2 text-xs font-semibold text-[#04060E] hover:bg-[#F7C266] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B041]"
          >
            Book Consultation
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-white/15 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#070B18] px-6 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-slate-200 hover:text-[#F5B041]"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onBookClick();
            }}
            className="mt-2 w-full rounded-lg bg-[#F5B041] px-4 py-2.5 text-sm font-semibold text-[#04060E]"
          >
            Book Consultation
          </button>
        </div>
      )}
    </header>
  );
}
