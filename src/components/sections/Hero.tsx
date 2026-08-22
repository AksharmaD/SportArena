import { ArrowRight, Users, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from '@/hooks/useRoute';

const heroImage =
  'https://images.pexels.com/photos/8694442/pexels-photo-8694442.jpeg?auto=compress&cs=tinysrgb&w=1400';

const floatingStats = [
  { icon: Users, label: '12k+ athletes', sub: 'across 20+ sports' },
  { icon: Sparkles, label: '850+ activities', sub: 'this month' },
  { icon: Star, label: '4.9 rating', sub: 'from 2k reviews' },
];

export function Hero() {
  const navigate = useNavigate();
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #1f2330 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container-px">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              Free to join · For every sport
            </div>

            <h1
              className="reveal mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl"
              data-delay="80"
            >
              Connect. Play.
              <br />
              <span className="text-gradient">Grow.</span>
            </h1>

            <p
              className="reveal mt-6 max-w-xl text-lg leading-relaxed text-ink-500 sm:text-xl"
              data-delay="160"
            >
              One simple place to create your sports profile, find people to play with, discover
              activities, and share your achievements.
            </p>

            <div
              className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              data-delay="240"
            >
              <Button size="lg" onClick={() => navigate('/signup')}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Explore Athletes
              </Button>
            </div>

            <p
              className="reveal mt-6 text-sm font-medium text-ink-400"
              data-delay="320"
            >
              For every sport. For every level. For everyone.
            </p>
          </div>

          {/* Right: visual */}
          <div className="lg:col-span-6" data-delay="200">
            <div className="reveal relative">
              {/* Main image card */}
              <div className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-ink-100">
                <img
                  src={heroImage}
                  alt="Athletes from different sports standing together on an outdoor court"
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-transparent" />

                {/* Floating profile chip */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/90 p-3 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg">
                      🏏
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-950">Rahul Sharma</p>
                      <p className="text-xs text-ink-500">Cricket · Intermediate</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    Connect
                  </span>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -left-3 top-8 hidden rounded-2xl border border-ink-100 bg-white p-3 shadow-lift sm:block lg:-left-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-950">12k+ athletes</p>
                    <p className="text-xs text-ink-400">across 20+ sports</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 top-1/2 hidden rounded-2xl border border-ink-100 bg-white p-3 shadow-lift sm:block lg:-right-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-950">850+ activities</p>
                    <p className="text-xs text-ink-400">this month</p>
                  </div>
                </div>
              </div>

              {/* Mobile stats row */}
              <div className="mt-4 grid grid-cols-3 gap-3 sm:hidden">
                {floatingStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-ink-100 bg-white p-3 text-center shadow-soft"
                  >
                    <s.icon className="mx-auto h-4 w-4 text-brand-600" />
                    <p className="mt-1 text-xs font-bold text-ink-950">{s.label}</p>
                    <p className="text-[10px] text-ink-400">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
