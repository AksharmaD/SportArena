import { ArrowRight } from 'lucide-react';
import { sports } from '@/data/sports';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useNavigate } from '@/hooks/useRoute';

export function Sports() {
  const navigate = useNavigate();
  return (
    <section id="sports" className="section-py">
      <div className="container-px">
        <SectionHeading
          eyebrow="Every sport welcome"
          title={
            <>
              Whatever your sport,
              <br className="hidden sm:block" /> you belong here.
            </>
          }
          description="From cricket and football to running, swimming, badminton, chess, and more."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sports.map((sport, i) => (
            <a
              key={sport.name}
              href="#/signup"
              className="reveal group relative overflow-hidden rounded-2xl shadow-soft ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200"
              data-delay={`${i * 60}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />

                {/* Emoji badge */}
                <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  {sport.emoji}
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg font-bold text-white">{sport.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-white/70">{sport.players}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-300 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Explore
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="reveal mt-10 text-center">
          <a
            href="#discovery"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 transition-colors hover:text-brand-700"
          >
            Explore all sports
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
