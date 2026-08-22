import { useState, useEffect, type ReactNode } from 'react';
import { Menu, X, Activity, LogOut, LayoutDashboard, Compass, Zap, Calendar, Users, MapPin, Trophy, Bell, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useRoute } from '@/hooks/useRoute';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Players', href: '/discover', icon: Compass },
  { label: 'Play Now', href: '/quick-match', icon: Zap },
  { label: 'Games', href: '/games', icon: Calendar },
  { label: 'Teams', href: '/teams', icon: Users },
  { label: 'Venues', href: '/venues', icon: MapPin },
  { label: 'Tournaments', href: '/tournaments', icon: Trophy },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const route = useRoute();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) => {
    const routeName = route.name;
    if (href === '/dashboard') return routeName === 'dashboard';
    if (href === '/discover') return routeName === 'discover';
    if (href === '/quick-match') return routeName === 'quick-match';
    if (href === '/games') return routeName === 'games';
    if (href === '/teams') return routeName === 'teams';
    if (href === '/venues') return routeName === 'venues';
    if (href === '/tournaments') return routeName === 'tournaments';
    if (href === '/notifications') return routeName === 'notifications';
    if (href === '/profile') return routeName === 'profile';
    return false;
  };

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Sidebar — desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-ink-100 bg-white lg:flex">
        <a href="#/" className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-950">
            Sport<span className="text-brand-600">Arena</span>
          </span>
        </a>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {(profile?.full_name || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-ink-900">{profile?.full_name}</p>
              <p className="truncate text-xs text-ink-400">{profile?.city || 'Set your city'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-5 backdrop-blur-lg lg:hidden">
        <a href="#/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-ink-950">
            Sport<span className="text-brand-600">Arena</span>
          </span>
        </a>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-800 hover:bg-ink-100"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-lift">
            <div className="flex h-16 items-center justify-between px-5">
              <span className="font-display text-base font-extrabold text-ink-950">Menu</span>
              <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-3 py-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => { navigate(item.href); setOpen(false); }}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold ${
                    isActive(item.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-ink-100 p-3">
              <button
                onClick={() => signOut().then(() => navigate('/'))}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
