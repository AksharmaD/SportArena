import { useState, useEffect } from 'react';
import { Zap, ArrowRight, ArrowLeft, Check, MapPin, UserPlus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { computeCompatibility } from '@/lib/matching';
import { SPORT_OPTIONS, SKILL_LEVELS, AVAILABILITY_OPTIONS, SPORT_EMOJIS, type Profile, type Game } from '@/types';

export function QuickMatchPage() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState('');
  const [skill, setSkill] = useState('');
  const [distance, setDistance] = useState('10');
  const [time, setTime] = useState('');
  const [results, setResults] = useState<{ profile: Profile; score: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const steps = ['Choose Sport', 'Skill Level', 'Distance', 'Time'];

  const handleSearch = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').neq('id', user?.id || '');
    if (sport) query = query.contains('sports', [sport]);
    if (skill) query = query.eq('skill_level', skill);
    if (time) query = query.contains('availability', [time]);
    const { data } = await query.limit(10);
    if (data && profile) {
      const scored = (data as Profile[])
        .map((p) => ({ profile: p, score: computeCompatibility(profile, p) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);
      setResults(scored);
    }
    setLoading(false);
    setStep(4); // results step
  };

  const handleCreateQuickMatch = async () => {
    if (!user || !sport) return;
    await supabase.from('games').insert({
      owner_id: user.id,
      title: `Quick Match — ${sport}`,
      sport,
      game_date: 'Today',
      game_time: time || 'Now',
      location: profile?.city || 'TBD',
      skill_level: skill || 'Any',
      max_players: 4,
      description: 'Quick match created via Play Now',
      status: 'open',
    });
    setCreated(true);
  };

  return (
    <div className="container-px py-8 lg:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-950">Play Now</h1>
            <p className="text-sm text-ink-500">Find compatible players and start a quick match.</p>
          </div>
        </div>

        {created ? (
          <div className="mt-8 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink-950">Quick Match Created!</h2>
            <p className="mt-2 text-sm text-ink-500">Your {sport} quick match has been posted. Players nearby can join it now.</p>
            <Button className="mt-6" size="md" onClick={() => { window.location.hash = '/games'; }}>
              View in Games <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : step < 4 ? (
          <div className="mt-8 rounded-3xl border border-ink-100 bg-white p-7 shadow-lift">
            {/* Progress dots */}
            <div className="mb-6 flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${i <= step ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'}`}>
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && <div className={`h-0.5 w-8 ${i < step ? 'bg-brand-600' : 'bg-ink-100'}`} />}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div>
                <h2 className="font-display text-lg font-bold text-ink-950">Choose your sport</h2>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {SPORT_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setSport(s)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-semibold transition-all ${sport === s ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300'}`}>
                      <span className="text-xl">{SPORT_EMOJIS[s]}</span>
                      {s}
                    </button>
                  ))}
                </div>
                <Button className="mt-6 w-full" size="md" disabled={!sport} onClick={() => setStep(1)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-lg font-bold text-ink-950">Choose skill level</h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {SKILL_LEVELS.map((l) => (
                    <button key={l} onClick={() => setSkill(l)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${skill === l ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="secondary" size="md" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button className="flex-1" size="md" disabled={!skill} onClick={() => setStep(2)}>Continue <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-lg font-bold text-ink-950">Preferred distance</h2>
                <p className="mt-1 text-sm text-ink-500">How far are you willing to travel?</p>
                <div className="mt-6">
                  <input type="range" min="1" max="50" value={distance} onChange={(e) => setDistance(e.target.value)}
                    className="w-full accent-brand-600" />
                  <p className="mt-2 text-center text-lg font-bold text-brand-600">{distance} km</p>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="secondary" size="md" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button className="flex-1" size="md" onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-lg font-bold text-ink-950">When are you available?</h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {AVAILABILITY_OPTIONS.map((t) => (
                    <button key={t} onClick={() => setTime(t)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${time === t ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="secondary" size="md" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button className="flex-1" size="md" onClick={handleSearch}>
                    {loading ? 'Searching...' : 'Find Players'} <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="mt-8">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{SPORT_EMOJIS[sport] || '🏆'}</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-950">{sport || 'All Sports'}</h2>
                  <p className="text-sm text-ink-500">{results.length} compatible player{results.length !== 1 ? 's' : ''} found · {distance} km radius · {time || 'Any time'}</p>
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-10 text-center shadow-soft">
                <Search className="mx-auto h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-500">No compatible players found right now.</p>
                <p className="text-xs text-ink-400">Try adjusting your filters or create a quick match anyway.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {results.map(({ profile: p, score }) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {p.full_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{p.full_name}</p>
                      <p className="text-xs text-ink-400">
                        {p.skill_level} · {p.city ? `${p.city}` : ''} · {p.availability?.join(', ') || 'Flexible'}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-brand-600 text-white">
                      <span className="text-sm font-extrabold leading-none">{score}%</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Button size="lg" className="w-full" onClick={handleCreateQuickMatch}>
                <Zap className="h-5 w-5" /> Create Quick Match
              </Button>
              <button onClick={() => setStep(0)} className="mt-3 w-full text-center text-sm font-semibold text-ink-400 hover:text-ink-700">
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
