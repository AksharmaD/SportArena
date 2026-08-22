import { UserPlus, Search, CalendarPlus, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create your profile',
    text: 'Tell us what you play, your skill level, and where you play.',
  },
  {
    num: '02',
    icon: Search,
    title: 'Find your people',
    text: 'Discover players who share your sport and skill level nearby.',
  },
  {
    num: '03',
    icon: CalendarPlus,
    title: 'Join or create',
    text: 'Find a game, practice session, tournament, or create your own.',
  },
  {
    num: '04',
    icon: TrendingUp,
    title: 'Connect & grow',
    text: 'Meet people, share achievements, and build your sports network.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-py bg-ink-50/60">
      <div className="container-px">
        <SectionHeading
          eyebrow="How it works"
          title="Getting started is simple."
          description="Four steps from signing up to playing your next game."
        />

        <div className="relative mt-14">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="reveal relative"
                data-delay={`${i * 100}`}
              >
                <div className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  {/* Number badge */}
                  <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
                    <step.icon className="h-6 w-6" strokeWidth={2} />
                  </div>

                  <span className="absolute right-5 top-5 font-display text-3xl font-extrabold text-ink-100">
                    {step.num}
                  </span>

                  <h3 className="font-display text-lg font-bold text-ink-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
