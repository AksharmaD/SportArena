import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, X, Check, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { SPORT_OPTIONS, SPORT_EMOJIS, type Activity } from '@/types';

const ACTIVITY_TYPES = ['Match', 'Practice', 'Tournament'];
const DEFAULT_IMAGES: Record<string, string> = {
  Cricket: 'https://images.pexels.com/photos/29463867/pexels-photo-29463867.jpeg?auto=compress&cs=tinysrgb&w=900',
  Football: 'https://images.pexels.com/photos/38455326/pexels-photo-38455326.jpeg?auto=compress&cs=tinysrgb&w=900',
  Badminton: 'https://images.pexels.com/photos/14605729/pexels-photo-14605729.jpeg?auto=compress&cs=tinysrgb&w=900',
  Running: 'https://images.pexels.com/photos/3764012/pexels-photo-3764012.jpeg?auto=compress&cs=tinysrgb&w=900',
  Swimming: 'https://images.pexels.com/photos/8028682/pexels-photo-8028682.jpeg?auto=compress&cs=tinysrgb&w=900',
  Chess: 'https://images.pexels.com/photos/8443469/pexels-photo-8443469.jpeg?auto=compress&cs=tinysrgb&w=900',
  Basketball: 'https://images.pexels.com/photos/2820906/pexels-photo-2820906.jpeg?auto=compress&cs=tinysrgb&w=900',
  Volleyball: 'https://images.pexels.com/photos/6180408/pexels-photo-6180408.jpeg?auto=compress&cs=tinysrgb&w=900',
};

export function ActivitiesPage() {
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  // Create form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Match');
  const [sport, setSport] = useState('Cricket');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [creating, setCreating] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
    setActivities((data as Activity[]) || []);
    setLoading(false);
  }, []);

  const fetchJoined = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('activity_participants').select('activity_id').eq('user_id', user.id);
    if (data) setJoinedIds(new Set(data.map((d) => d.activity_id)));
  }, [user]);

  useEffect(() => {
    fetchActivities();
    fetchJoined();
  }, [fetchActivities, fetchJoined]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !location.trim()) return;
    setCreating(true);
    await supabase.from('activities').insert({
      owner_id: user.id,
      title: title.trim(),
      type,
      sport,
      day,
      time,
      location: location.trim(),
      capacity: parseInt(capacity) || 0,
      image_url: DEFAULT_IMAGES[sport] || '',
    });
    setCreating(false);
    setShowCreate(false);
    setTitle(''); setDay(''); setTime(''); setLocation(''); setCapacity('10');
    fetchActivities();
  };

  const handleJoin = async (activity: Activity) => {
    if (!user) return;
    if (joinedIds.has(activity.id)) {
      // Leave
      await supabase.from('activity_participants').delete().eq('activity_id', activity.id).eq('user_id', user.id);
      await supabase.from('activities').update({ joined_count: Math.max(0, activity.joined_count - 1) }).eq('id', activity.id);
    } else {
      // Join
      await supabase.from('activity_participants').insert({ activity_id: activity.id, user_id: user.id });
      await supabase.from('activities').update({ joined_count: activity.joined_count + 1 }).eq('id', activity.id);
    }
    fetchActivities();
    fetchJoined();
  };

  return (
    <div className="min-h-screen bg-ink-50/60 pt-16">
      <div className="container-px py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink-950">Activities</h1>
              <p className="mt-1 text-sm text-ink-500">Find games, practice sessions, and tournaments near you.</p>
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Activity
            </Button>
          </div>

          {/* Create modal */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-5" onClick={() => setShowCreate(false)}>
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold text-ink-950">Create an Activity</h2>
                  <button onClick={() => setShowCreate(false)} className="text-ink-400 hover:text-ink-900">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend Cricket Match" required
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-ink-700">Type</label>
                      <select value={type} onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                        {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-ink-700">Sport</label>
                      <select value={sport} onChange={(e) => setSport(e.target.value)}
                        className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                        {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-ink-700">Day</label>
                      <input type="text" value={day} onChange={(e) => setDay(e.target.value)} placeholder="e.g. Saturday"
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-ink-700">Time</label>
                      <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 5:00 PM"
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-ink-700">Location</label>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hyderabad" required
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-ink-700">Capacity (0 = unlimited)</label>
                      <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="0"
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                    </div>
                  </div>
                  <Button type="submit" size="md" className="w-full" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Activity'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Activities list */}
          {loading ? (
            <div className="py-20 text-center text-ink-400">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="py-20 text-center">
              <Trophy className="mx-auto h-10 w-10 text-ink-300" />
              <p className="mt-3 text-sm font-medium text-ink-500">No activities yet.</p>
              <p className="text-xs text-ink-400">Be the first to create one!</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((act) => {
                const isUnlimited = act.capacity === 0;
                const pct = isUnlimited ? 100 : act.capacity > 0 ? Math.min(100, Math.round((act.joined_count / act.capacity) * 100)) : 0;
                const hasJoined = joinedIds.has(act.id);
                const isFull = !isUnlimited && act.joined_count >= act.capacity;
                const isOwner = act.owner_id === user?.id;

                return (
                  <div key={act.id} className="group overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                    <div className="relative h-36 overflow-hidden">
                      {act.image_url ? (
                        <img src={act.image_url} alt={act.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-brand-50 text-4xl">{SPORT_EMOJIS[act.sport] || '🏆'}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800 backdrop-blur-sm">
                        {SPORT_EMOJIS[act.sport] || ''} {act.type}
                      </span>
                      {isOwner && (
                        <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                          Your activity
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-bold text-ink-950">{act.title}</h3>
                      <div className="mt-3 space-y-1.5 text-sm text-ink-500">
                        {act.day && (
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-ink-400" />
                            {act.day}
                            {act.time && (<><Clock className="ml-1 h-4 w-4 text-ink-400" />{act.time}</>)}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-ink-400" />
                          {act.location}
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-ink-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {act.joined_count}
                            {isUnlimited ? ' joined' : `/${act.capacity} joined`}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="mt-5">
                        {isOwner ? (
                          <Button variant="secondary" size="sm" className="w-full" disabled>
                            Managing
                          </Button>
                        ) : hasJoined ? (
                          <Button variant="outline" size="sm" className="w-full" onClick={() => handleJoin(act)}>
                            <Check className="h-4 w-4" />
                            Joined — Tap to leave
                          </Button>
                        ) : isFull ? (
                          <Button variant="secondary" size="sm" className="w-full" disabled>
                            Full
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full" onClick={() => handleJoin(act)}>
                            Join Activity
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
