import { MapPin, Trophy, MessageCircle, UserPlus, Target, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from '@/hooks/useRoute';
import { featuredAthlete } from '@/data/athletes';

export function AthleteProfile() {
  const navigate = useNavigate();
  return (
    <section id="profile" className="section-py">
      <div className="container-px">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Profile card */}
          <div className="reveal order-2 lg:order-1">
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lift">
              {/* Cover */}
              <div className="relative h-24 bg-gradient-to-r from-brand-500 to-brand-700">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              {/* Avatar + name */}
              <div className="px-6 pb-6">
                <div className="-mt-10 flex items-end justify-between">
                  <img
                    src={featuredAthlete.avatar}
                    alt={featuredAthlete.name}
                    className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-card"
                  />
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    <Trophy className="h-3 w-3" />
                    Pro Member
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl font-extrabold text-ink-950">
                  {featuredAthlete.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-ink-500">
                  {featuredAthlete.emoji} {featuredAthlete.sport} · {featuredAthlete.level}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {featuredAthlete.location}
                </p>

                {/* Sports */}
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Sports</p>
                  <div className="mt-2 space-y-2">
                    {featuredAthlete.sports.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2"
                      >
                        <span className="text-sm font-semibold text-ink-800">{s.name}</span>
                        <span className="text-xs font-medium text-ink-500">{s.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400">
                    Achievements
                  </p>
                  <div className="mt-2 space-y-2">
                    {featuredAthlete.achievements.map((a) => (
                      <div
                        key={a.title}
                        className="flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2"
                      >
                        <span className="text-lg">{a.emoji}</span>
                        <span className="text-sm font-semibold text-ink-800">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Looking for */}
                <div className="mt-5">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                    <Target className="h-3 w-3" />
                    Looking for
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {featuredAthlete.lookingFor.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                      >
                        <Check className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button size="md">
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </Button>
                  <Button variant="secondary" size="md">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <span className="reveal mb-4 inline-block text-sm font-bold uppercase tracking-wider text-brand-600">
              Your profile
            </span>
            <h2 className="reveal font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">
              Your sport. Your profile.
              <br />
              Your story.
            </h2>
            <p className="reveal mt-5 text-lg leading-relaxed text-ink-500">
              Build a profile that shows more than your name. Showcase the sports you play, your
              achievements, your skills, and what you're looking for.
            </p>

            <ul className="reveal mt-8 space-y-4">
              {[
                'Show every sport you play, not just one',
                'Display your achievements and milestones',
                "Let others know what you're looking for",
                'Connect with a single tap',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-base font-medium text-ink-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="reveal mt-8" data-delay="120">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Create your profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
