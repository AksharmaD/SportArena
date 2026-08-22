import { Activity, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: ['Discover', 'Activities', 'Profiles'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms'],
  },
];

const socials = [
  { icon: Twitter, label: 'Twitter' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Linkedin, label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-px py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Activity className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-ink-950">
                Sport<span className="text-brand-600">Arena</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              A platform for athletes to connect, play, and grow.
            </p>

            <div className="mt-6 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-100 text-ink-500 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-ink-950">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-medium text-ink-500 transition-colors hover:text-brand-600"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-sm text-ink-400">
            © {new Date().getFullYear()} SportArena. All rights reserved.
          </p>
          <p className="text-sm font-medium text-ink-400">Connect. Play. Grow.</p>
        </div>
      </div>
    </footer>
  );
}
