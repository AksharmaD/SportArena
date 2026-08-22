import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, X, Check, MapPin, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { computeCompatibility } from '@/lib/matching';
import { SPORT_OPTIONS, SKILL_LEVELS, SPORT_EMOJIS, type Team, type TeamMember, type Profile } from '@/types';

export function TeamsPage() {
  const { user, profile } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [memberStatus, setMemberStatus] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Record<string, { profile: Profile; score: number }[]>>({});

  // Create form
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [location, setLocation] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
    setTeams((data as Team[]) || []);

    // Fetch member counts
    if (data) {
      const counts: Record<string, number> = {};
      const statuses: Record<string, string> = {};
      for (const team of data) {
        const { count } = await supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('team_id', team.id).eq('status', 'accepted');
        counts[team.id] = count || 0;
        if (user) {
          const { data: myMembership } = await supabase.from('team_members').select('status').eq('team_id', team.id).eq('user_id', user.id).maybeSingle();
          statuses[team.id] = myMembership?.status || 'none';
        }
      }
      setMemberCounts(counts);
      setMemberStatus(statuses);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teamName.trim()) return;
    setCreating(true);
    const { data: team } = await supabase.from('teams').insert({
      owner_id: user.id,
      team_name: teamName.trim(),
      sport,
      skill_level: skillLevel,
      location: location.trim(),
      max_members: parseInt(maxMembers) || 10,
      description: description.trim(),
    }).select().single();

    if (team) {
      // Owner is automatically a member
      await supabase.from('team_members').insert({
        team_id: team.id,
        user_id: user.id,
        status: 'accepted',
        role: 'Owner',
      });
    }
    setCreating(false);
    setShowCreate(false);
    setTeamName(''); setLocation(''); setDescription('');
    fetchTeams();
  };

  const handleJoin = async (team: Team) => {
    if (!user) return;
    const status = memberStatus[team.id];
    if (status === 'accepted' || status === 'pending') return;

    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      status: 'pending',
    });
    // Notify team owner
    await supabase.from('notifications').insert({
      recipient_id: team.owner_id,
      type: 'team_join',
      title: 'Team join request',
      message: `Someone requested to join "${team.team_name}"`,
      data: { team_id: team.id },
    });
    fetchTeams();
  };

  const handleInvite = async (teamId: string, athleteId: string) => {
    if (!user) return;
    await supabase.from('notifications').insert({
      recipient_id: athleteId,
      type: 'team_invite',
      title: 'Team invitation',
      message: `You've been invited to join a team!`,
      data: { team_id: teamId, from_user: user.id },
    });
  };

  const fetchRecommendations = async (team: Team) => {
    if (!profile) return;
    const { data } = await supabase.from('profiles').select('*').neq('id', user?.id || '').contains('sports', [team.sport]).limit(5);
    if (data) {
      const scored = (data as Profile[])
        .map((p) => ({ profile: p, score: computeCompatibility(profile, p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      setRecommendations((prev) => ({ ...prev, [team.id]: scored }));
    }
  };

  return (
    <div className="container-px py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-950">Teams</h1>
            <p className="mt-1 text-sm text-ink-500">Browse, create, and join teams for your sport.</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create Team
          </Button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-5" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-ink-950">Create a Team</h2>
                <button onClick={() => setShowCreate(false)} className="text-ink-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Team name</label>
                  <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Hyderabad Strikers" required
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
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Location</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hyderabad"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Max members</label>
                    <input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} min="1"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Description (optional)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <Button type="submit" size="md" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Team'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Teams list */}
        {loading ? (
          <div className="py-20 text-center text-ink-400">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-500">No teams yet.</p>
            <p className="text-xs text-ink-400">Create the first team!</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {teams.map((team) => {
              const isOwner = team.owner_id === user?.id;
              const status = memberStatus[team.id] || 'none';
              const count = memberCounts[team.id] || 0;
              const needsPlayers = team.max_members > count;
              const recs = recommendations[team.id] || [];

              return (
                <div key={team.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl">{SPORT_EMOJIS[team.sport] || '👥'}</span>
                    {isOwner && <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">Owner</span>}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-ink-950">{team.team_name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                    <span className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-600">{team.skill_level}</span>
                    {team.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{team.location}</span>}
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{count}/{team.max_members}</span>
                  </div>
                  {team.description && <p className="mt-2 line-clamp-2 text-sm text-ink-400">{team.description}</p>}

                  {/* Smart recommendations for team owner */}
                  {isOwner && needsPlayers && (
                    <div className="mt-4 rounded-xl bg-brand-50/60 p-3">
                      <p className="text-xs font-bold text-brand-700">Your team needs {team.max_members - count} more player{team.max_members - count !== 1 ? 's' : ''}.</p>
                      {recs.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {recs.map((rec) => (
                            <div key={rec.profile.id} className="flex items-center gap-2">
                              {rec.profile.avatar_url ? (
                                <img src={rec.profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{rec.profile.full_name?.charAt(0).toUpperCase()}</span>
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-bold text-ink-900">{rec.profile.full_name}</p>
                                <p className="text-[10px] text-ink-400">{rec.profile.skill_level}</p>
                              </div>
                              <span className="text-xs font-bold text-brand-600">{rec.score}%</span>
                              <button onClick={() => handleInvite(team.id, rec.profile.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700">
                                <UserPlus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button onClick={() => fetchRecommendations(team)} className="mt-1 text-xs font-bold text-brand-600 hover:text-brand-700">
                          Find recommended players →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    {isOwner ? (
                      <Button variant="secondary" size="sm" className="w-full" disabled>Managing</Button>
                    ) : status === 'accepted' ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Check className="h-4 w-4" /> Member
                      </Button>
                    ) : status === 'pending' ? (
                      <Button variant="secondary" size="sm" className="w-full" disabled>Request sent</Button>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => handleJoin(team)}>Request to Join</Button>
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
