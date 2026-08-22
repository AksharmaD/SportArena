import { useEffect, useState } from 'react';
import { Compass, Zap, Calendar, Users, ArrowRight, MapPin, Trophy, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from '@/hooks/useRoute';
import { computeCompatibility } from '@/lib/matching';
import { SPORT_EMOJIS, type Profile, type Game, type Tournament, type Venue } from '@/types';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<{ profile: Profile; score: number }[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !profile) return;

    // Fetch recommended players
    supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .limit(20)
      .then(({ data }) => {
        if (data) {
          const scored = (data as Profile[])
            .map((p) => ({ profile: p, score: computeCompatibility(profile, p) }))
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
          setRecommendations(scored);
        }
      });

    // Fetch upcoming games (games user joined)
    supabase
      .from('game_participants')
      .select('game_id, games(*)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const games = data.map((d) => d.games as unknown as Game).filter(Boolean);
          setUpcomingGames(games.slice(0, 3));
        }
      });

    // Fetch venues
    supabase
      .from('venues')
      .select('*')
      .limit(3)
      .then(({ data }) => setNearbyVenues((data as Venue[]) || []));

    // Fetch tournaments matching user's sports
    let tQuery = supabase.from('tournaments').select('*').eq('status', 'open').limit(3);
    if (profile.sports && profile.sports.length > 0) {
      tQuery = tQuery.in('sport', profile.sports);
    }
    tQuery.then(({ data }) => setTournaments((data as Tournament[]) || []));

    // Unread notifications
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user, profile]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    { label: 'Find Players', desc: 'Discover athletes near you', icon: Compass, href: '/discover', color: 'bg-brand-50 text-brand-600' },
    { label: 'Play Now', desc: 'Quick match instantly', icon: Zap, href: '/quick-match', color: 'bg-accent-50 text-accent-600' },
    { label: 'Find Games', desc: 'Browse and join games', icon: Calendar, href: '/games', color: 'bg-sky-50 text-sky-600' },
    { label: 'Find Teams', desc: 'Join or create a team', icon: Users, href: '/teams', color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="container-px py-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">
              {greeting}, {profile?.full_name?.split(' ')[0] || 'Athlete'} 👋
            </h1>
            <p className="mt-1 text-sm text-ink-500">Here's what's happening in your sports world.</p>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-ink-100 bg-white text-ink-600 shadow-soft hover:bg-ink-50"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="group rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color} transition-transform duration-300 group-hover:scale-110`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink-950">{action.label}</h3>
              <p className="mt-0.5 text-xs text-ink-400">{action.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recommended For You */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-950">Recommended For You</h2>
              <button onClick={() => navigate('/discover')} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View all →
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-400">Based on your sports, skill, and location</p>
            <div className="mt-4 space-y-3">
              {recommendations.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No recommendations yet. Add more sports to your profile!</p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.profile.id} className="flex items-center gap-3 rounded-xl bg-ink-50/60 p-3">
                    {rec.profile.avatar_url ? (
                      <img src={rec.profile.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {rec.profile.full_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{rec.profile.full_name}</p>
                      <p className="text-xs text-ink-400">
                        {rec.profile.sports?.slice(0, 2).map((s) => `${SPORT_EMOJIS[s] || ''} ${s}`).join(' · ') || 'No sports'}
                        {rec.profile.city ? ` · ${rec.profile.city}` : ''}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-brand-600 text-white">
                      <span className="text-sm font-extrabold leading-none">{rec.score}%</span>
                      <span className="text-[8px] leading-none">match</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Games */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-950">Upcoming Games</h2>
              <button onClick={() => navigate('/games')} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View all →
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-400">Games you've joined</p>
            <div className="mt-4 space-y-3">
              {upcomingGames.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No games joined yet. Find a game to play!</p>
              ) : (
                upcomingGames.map((game) => (
                  <div key={game.id} className="flex items-center gap-3 rounded-xl bg-ink-50/60 p-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">
                      {SPORT_EMOJIS[game.sport] || '🏆'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{game.title}</p>
                      <p className="text-xs text-ink-400">
                        {game.game_date} · {game.game_time} · {game.location}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nearby Venues */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-950">Nearby Venues</h2>
              <button onClick={() => navigate('/venues')} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View all →
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-400">Sports facilities near you</p>
            <div className="mt-4 space-y-3">
              {nearbyVenues.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No venues listed yet.</p>
              ) : (
                nearbyVenues.map((venue) => (
                  <div key={venue.id} className="flex items-center gap-3 rounded-xl bg-ink-50/60 p-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">🏟️</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{venue.name}</p>
                      <p className="text-xs text-ink-400">
                        {venue.sports?.slice(0, 2).join(' · ') || 'Multi-sport'}
                        {venue.rating ? ` · ⭐ ${venue.rating}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tournaments */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-950">Tournaments</h2>
              <button onClick={() => navigate('/tournaments')} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View all →
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-400">Upcoming tournaments for your sports</p>
            <div className="mt-4 space-y-3">
              {tournaments.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No tournaments for your sports yet.</p>
              ) : (
                tournaments.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-ink-50/60 p-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-xl">
                      {SPORT_EMOJIS[t.sport] || '🏅'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{t.name}</p>
                      <p className="text-xs text-ink-400">
                        {t.tournament_date} · {t.location} · {t.registered_teams}/{t.max_teams} teams
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
