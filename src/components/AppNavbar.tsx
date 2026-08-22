import { useState, useEffect } from 'react';
import { Menu, X, Activity, LogOut, Compass, Calendar, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useRoute } from '@/hooks/useRoute';

const navItems = [
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Activities', href: '/activities', icon: Calendar },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Profile', href: '/profile', icon: User },
];

export function AppNavbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const route = useRoute();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) => {
    if (href === '/discover') return route.name === 'discover';
    if (href === '/activities') return route.name === 'activities';
    if (href === '/messages') return route.name === 'messages' || route.name === 'messages-with';
    if (href === '/profile') return route.name === 'profile';
    return false;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-100 bg-white/90 backdrop-blur-lg">
      <nav className="container-px flex h-16 items-center justify-between">
        <a href="#/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-950">
            Sport<span className="text-brand-600">Arena</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {(profile?.full_name || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-sm font-semibold text-ink-700">{profile?.full_name}</span>
          </div>
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-800 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-100 bg-white px-5 py-3 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => { navigate(item.href); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                isActive(item.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
