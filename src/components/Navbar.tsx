import { useEffect, useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScrolled } from '@/hooks/useReveal';
import { useNavigate } from '@/hooks/useRoute';

const links = [
  { label: 'Discover', target: 'discovery' },
  { label: 'Activities', target: 'activities' },
  { label: 'About', target: 'why' },
];

export function Navbar() {
  const scrolled = useScrolled(8);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink-100 bg-white/85 backdrop-blur-lg shadow-soft'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-px flex h-16 items-center justify-between sm:h-20">
        {/* Logo */}
        <a href="#/" className="flex items-center gap-2.5" aria-label="SportArena home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-950">
            Sport<span className="text-brand-600">Arena</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.target}
              onClick={() => document.getElementById(l.target)?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button size="sm" onClick={() => navigate('/signup')}>
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-800 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden">
          <div className="container-px pb-5 pt-2">
            <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-lift">
              {links.map((l) => (
                <button
                  key={l.target}
                  onClick={() => { document.getElementById(l.target)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); }}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-ink-700 hover:bg-ink-50"
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink-100 pt-3">
                <Button variant="secondary" size="md" onClick={() => { navigate('/login'); setOpen(false); }}>
                  Log in
                </Button>
                <Button size="md" onClick={() => { navigate('/signup'); setOpen(false); }}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
