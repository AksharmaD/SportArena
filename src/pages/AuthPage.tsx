import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from '@/hooks/useRoute';
import { Button } from '@/components/ui/Button';
import { SPORT_OPTIONS } from '@/types';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      if (!fullName.trim()) return setError('Please enter your name.');
      if (selectedSports.length === 0) return setError('Select at least one sport you play.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    const result = isSignup
      ? await signUp(email, password, fullName, selectedSports)
      : await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/50 to-white">
      {/* Top bar */}
      <div className="container-px flex h-16 items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
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
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-lift sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              {isSignup
                ? 'Pick your sports and start connecting with athletes near you.'
                : 'Log in to continue building your sports network.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isSignup && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {isSignup && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-700">
                    What sports do you play?{' '}
                    <span className="font-normal text-ink-400">Select all that apply</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPORT_OPTIONS.map((sport) => {
                      const selected = selectedSports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                            selected
                              ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-colors ${
                              selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'
                            }`}
                          >
                            {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => navigate(isSignup ? '/login' : '/signup')}
                className="font-bold text-brand-600 hover:text-brand-700"
              >
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
