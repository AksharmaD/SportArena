import { useState } from 'react';
import { ArrowRight, Check, MapPin, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from '@/hooks/useRoute';
import { Button } from '@/components/ui/Button';
import { SPORT_OPTIONS, SKILL_LEVELS, AVAILABILITY_OPTIONS, LOOKING_FOR_OPTIONS, SPORT_EMOJIS } from '@/types';

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [age, setAge] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [availability, setAvailability] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [preferredDistance, setPreferredDistance] = useState('10');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSport = (sport: string) => {
    setSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]));
  };

  const toggleArr = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) return setError('Please enter your name.');
    if (!city.trim()) return setError('Please enter your city.');
    if (sports.length === 0) return setError('Select at least one sport.');

    setSaving(true);
    setError(null);

    await supabase.from('profiles').update({
      full_name: fullName.trim(),
      city: city.trim(),
      area: area.trim(),
      age: age ? parseInt(age) : null,
      sports,
      skill_level: skillLevel,
      availability,
      looking_for: lookingFor,
      preferred_distance: parseInt(preferredDistance) || 10,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    await refreshProfile();
    setSaving(false);
    navigate('/dashboard');
  };

  const steps = ['Basic Info', 'Your Sports', 'Preferences'];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/50 to-white">
      <div className="container-px flex h-16 items-center">
        <a href="#/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-950">
            Sport<span className="text-brand-600">Arena</span>
          </span>
        </a>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i <= step ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-12 ${i < step ? 'bg-brand-600' : 'bg-ink-100'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-lift sm:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-ink-950">Tell us about you</h2>
                  <p className="mt-1 text-sm text-ink-500">This helps us find players near you.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Full name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Nandini Reddy"
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-700">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Hyderabad"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-700">Area</label>
                    <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Jubilee Hills"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Age (optional)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 24" min="1"
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <Button size="md" className="w-full" onClick={() => setStep(1)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-ink-950">What sports do you play?</h2>
                  <p className="mt-1 text-sm text-ink-500">Select all that apply — you can change these later.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SPORT_OPTIONS.map((sport) => {
                    const selected = sports.includes(sport);
                    return (
                      <button key={sport} type="button" onClick={() => toggleSport(sport)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          selected ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                        }`}>
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'}`}>
                          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        {SPORT_EMOJIS[sport] || ''} {sport}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Skill level</label>
                  <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="md" onClick={() => setStep(0)}>Back</Button>
                  <Button size="md" className="flex-1" onClick={() => setStep(2)}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-ink-950">Your preferences</h2>
                  <p className="mt-1 text-sm text-ink-500">When and what are you looking for?</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-700">Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((item) => (
                      <button key={item} type="button" onClick={() => toggleArr(availability, item, setAvailability)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${availability.includes(item) ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-500 hover:bg-ink-100'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-700">Looking for</label>
                  <div className="flex flex-wrap gap-2">
                    {LOOKING_FOR_OPTIONS.map((item) => (
                      <button key={item} type="button" onClick={() => toggleArr(lookingFor, item, setLookingFor)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${lookingFor.includes(item) ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-500 hover:bg-ink-100'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Preferred distance (km)</label>
                  <input type="number" value={preferredDistance} onChange={(e) => setPreferredDistance(e.target.value)} min="1"
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="secondary" size="md" onClick={() => setStep(1)}>Back</Button>
                  <Button size="md" className="flex-1" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Complete setup'}
                    {!saving && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
