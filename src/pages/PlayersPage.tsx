import { useState, useEffect, useCallback } from 'react';
import { MapPin, UserPlus, SlidersHorizontal, Search, Check, MessageSquare, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from '@/hooks/useRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { computeCompatibility } from '@/lib/matching';
import { SPORT_OPTIONS, SKILL_LEVELS, AVAILABILITY_OPTIONS, SPORT_EMOJIS, type Profile } from '@/types';

export function PlayersPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [athletes, setAthletes] = useState<{ profile: Profile; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [filterLookingFor, setFilterLookingFor] = useState('');
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').neq('id', user?.id || '');

    if (filterSport) query = query.contains('sports', [filterSport]);
    if (filterSkill) query = query.eq('skill_level', filterSkill);
    if (filterAvailability) query = query.contains('availability', [filterAvailability]);
    if (filterLookingFor) query = query.contains('looking_for', [filterLookingFor]);

    const { data } = await query.limit(30);
    if (data && profile) {
      const scored = (data as Profile[])
        .map((p) => ({ profile: p, score: computeCompatibility(profile, p) }))
        .sort((a, b) => b.score - a.score);
      setAthletes(scored);
    } else {
      setAthletes([]);
    }
    setLoading(false);
  }, [user, profile, filterSport, filterSkill, filterAvailability, filterLookingFor]);

  useEffect(() => { fetchAthletes(); }, [fetchAthletes]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('connections')
      .select('receiver_id, status')
      .eq('requester_id', user.id)
      .then(({ data }) => {
        if (data) {
          const pending = new Set<string>();
          const connected = new Set<string>();
          data.forEach((c) => {
            if (c.status === 'accepted') connected.add(c.receiver_id);
            else if (c.status === 'pending') pending.add(c.receiver_id);
          });
          setConnectedIds(connected);
          setPendingIds(pending);
        }
      });
  }, [user]);

  const handleConnect = async (athleteId: string) => {
    if (!user) return;
    setPendingIds((prev) => new Set(prev).add(athleteId));
    await supabase.from('connections').insert({ requester_id: user.id, receiver_id: athleteId, status: 'pending' });
    // Create notification
    await supabase.from('notifications').insert({
      recipient_id: athleteId,
      type: 'connection',
      title: 'New connection request',
      message: `${profile?.full_name || 'Someone'} wants to connect with you!`,
      data: { from_user: user.id },
    });
  };

  const hasFilters = filterSport || filterSkill || filterAvailability || filterLookingFor;

  return (
    <div className="container-px py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-extrabold text-ink-950">Find Players</h1>
        <p className="mt-1 text-sm text-ink-500">Discover athletes matched by sport, skill, location, and availability.</p>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-400">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-500">Sport</label>
              <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option value="">All sports</option>
                {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-500">Skill level</label>
              <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option value="">Any level</option>
                {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-500">Availability</label>
              <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option value="">Any time</option>
                {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-500">Looking for</label>
              <select value={filterLookingFor} onChange={(e) => setFilterLookingFor(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option value="">Anything</option>
                {['Players', 'Games', 'Teams', 'Tournaments', 'Practice Partners', 'Coaching'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => { setFilterSport(''); setFilterSkill(''); setFilterAvailability(''); setFilterLookingFor(''); }}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-ink-400 hover:text-red-500">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-20 text-center text-ink-400">Searching for athletes...</div>
        ) : athletes.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-500">No athletes found with these filters.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map(({ profile: athlete, score }) => {
              const isPending = pendingIds.has(athlete.id);
              const isConnected = connectedIds.has(athlete.id);
              return (
                <div key={athlete.id} className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  {score >= 50 && (
                    <Badge className="absolute right-4 top-4 bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                      <Check className="h-3 w-3" strokeWidth={3} /> Good Match
                    </Badge>
                  )}
                  <div className="flex items-center gap-3">
                    {athlete.avatar_url ? (
                      <img src={athlete.avatar_url} alt={athlete.full_name} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-ink-100" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">
                        {athlete.full_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                    <div>
                      <h3 className="font-display text-base font-bold text-ink-950">{athlete.full_name}</h3>
                      <p className="text-sm text-ink-500">
                        {athlete.sports?.slice(0, 2).map((s) => `${SPORT_EMOJIS[s] || ''} ${s}`).join(' · ') || 'No sports'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-400">
                    <span className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-600">{athlete.skill_level}</span>
                    {athlete.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{athlete.city}</span>}
                    {athlete.availability?.length > 0 && <span className="text-xs">{athlete.availability.join(', ')}</span>}
                  </div>
                  {/* Compatibility score */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-ink-400">Compatibility</span>
                      <span className={score >= 70 ? 'text-brand-600' : score >= 40 ? 'text-accent-600' : 'text-ink-400'}>{score}% Match</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                      <div className={`h-full rounded-full transition-all duration-500 ${score >= 70 ? 'bg-brand-500' : score >= 40 ? 'bg-accent-500' : 'bg-ink-300'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {isConnected ? (
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/messages/${athlete.id}`)}>
                        <MessageSquare className="h-4 w-4" /> Message
                      </Button>
                    ) : isPending ? (
                      <Button variant="secondary" size="sm" className="flex-1" disabled>
                        <Check className="h-4 w-4" /> Request sent
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => handleConnect(athlete.id)}>
                        <UserPlus className="h-4 w-4" /> Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
