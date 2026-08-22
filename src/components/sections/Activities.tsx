import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { useNavigate } from '@/hooks/useRoute';
import { activities } from '@/data/activities';

export function Activities() {
  const navigate = useNavigate();
  return (
    <section id="activities" className="section-py">
      <div className="container-px">
        <SectionHeading
          eyebrow="Activities"
          title="Something to play? Find it nearby."
          description="Join games, practice sessions, and tournaments — or create your own."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((act, i) => {
            const isUnlimited = act.capacity === 0;
            const pct = isUnlimited ? 100 : Math.round((act.joined / act.capacity) * 100);
            return (
              <div
                key={act.title}
                className="reveal group overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                data-delay={`${i * 100}`}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800 backdrop-blur-sm">
                    {act.emoji} {act.type}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-ink-950">{act.title}</h3>

                  <div className="mt-3 space-y-1.5 text-sm text-ink-500">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-ink-400" />
                      {act.day}
                      <Clock className="ml-1 h-4 w-4 text-ink-400" />
                      {act.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-ink-400" />
                      {act.location}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-ink-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {act.joined}
                        {isUnlimited ? ' joined' : `/${act.capacity} joined`}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Button size="sm" className="mt-5 w-full">
                    Join Activity
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-10 text-center">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 transition-colors hover:text-brand-700"
          >
            Create your own activity
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
