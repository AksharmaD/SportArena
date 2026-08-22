import { Trophy, BarChart3, Link2, LayoutGrid } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const cards = [
  {
    icon: LayoutGrid,
    title: 'Every sport',
    text: 'One platform for cricket, football, badminton, running, swimming, chess, and more.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: BarChart3,
    title: 'Every level',
    text: "Whether you're just starting or competing seriously.",
    color: 'bg-accent-50 text-accent-600',
  },
  {
    icon: Link2,
    title: 'Real connections',
    text: 'Find people based on sport, skill, and location.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Trophy,
    title: 'One simple profile',
    text: 'Your sports, achievements, activities, and connections in one place.',
    color: 'bg-violet-50 text-violet-600',
  },
];

export function WhyPlatform() {
  return (
    <section id="why" className="section-py">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why SportArena"
          title="Built for every kind of athlete."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="reveal group rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              data-delay={`${i * 100}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
