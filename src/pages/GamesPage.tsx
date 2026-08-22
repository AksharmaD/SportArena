import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, X, Check, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { SPORT_OPTIONS, SKILL_LEVELS, SPORT_EMOJIS, type Game } from '@/types';

export function GamesPage() {
  const { user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [filterSport, setFilterSport] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create form
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [gameDate, setGameDate] = useState('');
  const [gameTime, setGameTime] = useState('');
  const [location, setLocation] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('games').select('*').order('created_at', { ascending: false });
    if (filterSport) query = query.eq('sport', filterSport);
    const { data } = await query;
    let filtered = (data as Game[]) || [];
    if (searchQuery) {
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setGames(filtered);
    setLoading(false);
  }, [filterSport, searchQuery]);

  const fetchJoined = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('game_participants').select('game_id').eq('user_id', user.id);
    if (data) setJoinedIds(new Set(data.map((d) => d.game_id)));
  }, [user]);

  useEffect(() => { fetchGames(); }, [fetchGames]);
  useEffect(() => { fetchJoined(); }, [fetchJoined]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !location.trim()) return;
    setCreating(true);
    await supabase.from('games').insert({
      owner_id: user.id,
      title: title.trim(),
      sport,
      game_date: gameDate,
      game_time: gameTime,
      location: location.trim(),
      skill_level: skillLevel,
      max_players: parseInt(maxPlayers) || 8,
      description: description.trim(),
      status: 'open',
    });
    setCreating(false);
    setShowCreate(false);
    setTitle(''); setGameDate(''); setGameTime(''); setLocation(''); setDescription('');
    fetchGames();
  };

  const handleJoin = async (game: Game) => {
    if (!user) return;
    if (joinedIds.has(game.id)) {
      await supabase.from('game_participants').delete().eq('game_id', game.id).eq('user_id', user.id);
    } else {
      if (game.max_players > 0) {
        const { count } = await supabase.from('game_participants').select('id', { count: 'exact', head: true }).eq('game_id', game.id);
        if ((count || 0) >= game.max_players) return;
      }
      await supabase.from('game_participants').insert({ game_id: game.id, user_id: user.id });
      // Notify game owner
      await supabase.from('notifications').insert({
        recipient_id: game.owner_id,
        type: 'game_join',
        title: 'Someone joined your game',
        message: `A player joined "${game.title}"`,
        data: { game_id: game.id },
      });
    }
    fetchGames();
    fetchJoined();
  };

  const getParticipantCount = async (gameId: string) => {
    const { count } = await supabase.from('game_participants').select('id', { count: 'exact', head: true }).eq('game_id', gameId);
    return count || 0;
  };

  return (
    <div className="container-px py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-950">Games</h1>
            <p className="mt-1 text-sm text-ink-500">Browse, create, and join games near you.</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create Game
          </Button>
        </div>

        {/* Search & filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or location..."
              className="w-full rounded-xl border border-ink-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
            <option value="">All sports</option>
            {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-5" onClick={() => setShowCreate(false)}>
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-ink-950">Create a Game</h2>
                <button onClick={() => setShowCreate(false)} className="text-ink-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend Badminton" required
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Sport</label>
                    <select value={sport} onChange={(e) => setSport(e.target.value)}
                      className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                      {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Skill level</label>
                    <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                      {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Date</label>
                    <input type="text" value={gameDate} onChange={(e) => setGameDate(e.target.value)} placeholder="e.g. Saturday"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Time</label>
                    <input type="text" value={gameTime} onChange={(e) => setGameTime(e.target.value)} placeholder="e.g. 6:00 PM"
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
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Max players</label>
                    <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} min="1"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Description (optional)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                    placeholder="Any extra details about the game..."
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <Button type="submit" size="md" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Game'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Games list */}
        {loading ? (
          <div className="py-20 text-center text-ink-400">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="py-20 text-center">
            <Calendar className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-500">No games found.</p>
            <p className="text-xs text-ink-400">Be the first to create one!</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const hasJoined = joinedIds.has(game.id);
              const isOwner = game.owner_id === user?.id;
              return (
                <div key={game.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">{SPORT_EMOJIS[game.sport] || '🏆'}</span>
                    <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-600">{game.skill_level}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-ink-950">{game.title}</h3>
                  <div className="mt-2 space-y-1.5 text-sm text-ink-500">
                    {game.game_date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-ink-400" />{game.game_date}{game.game_time && <><Clock className="ml-1 h-4 w-4 text-ink-400" />{game.game_time}</>}</p>}
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-400" />{game.location}</p>
                    <p className="flex items-center gap-2"><Users className="h-4 w-4 text-ink-400" />{game.max_players > 0 ? `Max ${game.max_players} players` : 'Unlimited'}</p>
                  </div>
                  {game.description && <p className="mt-2 line-clamp-2 text-sm text-ink-400">{game.description}</p>}
                  <div className="mt-4">
                    {isOwner ? (
                      <Button variant="secondary" size="sm" className="w-full" disabled>Your Game</Button>
                    ) : hasJoined ? (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleJoin(game)}>
                        <Check className="h-4 w-4" /> Joined — Leave
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => handleJoin(game)}>Join Game</Button>
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
