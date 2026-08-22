import { MapPin, UserPlus, SlidersHorizontal, Check } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from '@/hooks/useRoute';
import { discoveryAthletes } from '@/data/athletes';

const filters = ['Sport', 'Location', 'Skill Level'];

export function Discovery() {
  const navigate = useNavigate();
  return (
    <section id="discovery" className="section-py bg-ink-50/60">
      <div className="container-px">
        <SectionHeading
          eyebrow="Discovery"
          title="Find people who play your game."
          description="Filter by sport, location, and skill level to find the right people nearby."
        />

        {/* Mock filter bar */}
        <div className="reveal mx-auto mt-10 max-w-3xl">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
            <span className="flex items-center gap-1.5 px-2 text-sm font-semibold text-ink-400">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </span>
            {filters.map((f) => (
              <button
                key={f}
                className="rounded-full bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {f}
              </button>
            ))}
            <Button size="sm" className="ml-auto" onClick={() => navigate('/signup')}>
              Search
            </Button>
          </div>
        </div>

        {/* Athlete cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {discoveryAthletes.map((athlete, i) => (
            <div
              key={athlete.name}
              className="reveal group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              data-delay={`${i * 100}`}
            >
              {athlete.match && (
                <Badge className="absolute right-4 top-4 bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Good Match
                </Badge>
              )}

              <div className="flex items-center gap-3">
                <img
                  src={athlete.avatar}
                  alt={athlete.name}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-ink-100"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-ink-950">{athlete.name}</h3>
                  <p className="text-sm text-ink-500">
                    {athlete.emoji} {athlete.sport} · {athlete.level}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-400">
                <MapPin className="h-3.5 w-3.5" />
                {athlete.distance}
              </div>

              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full group-hover:bg-brand-600 group-hover:text-white"
                  onClick={() => navigate('/signup')}
                >
                  <UserPlus className="h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="reveal mt-8 text-center text-sm text-ink-400">
          No more searching through random people. Find relevant players based on sport, skill, and
          location.
        </p>
      </div>
    </section>
  );
}
