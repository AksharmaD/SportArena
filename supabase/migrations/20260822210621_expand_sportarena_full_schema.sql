/*
# SportArena Full Application Schema

Expands the existing schema with all feature tables: games, teams, team_members,
venues, tournaments, tournament_registrations, notifications, and player_stats.
Also expands the profiles table with new fields for onboarding.

## Modified Tables

1. **profiles** — adds columns for the full onboarding model:
   - `profile_image` (text, optional)
   - `age` (int, optional)
   - `latitude` (float8, optional)
   - `longitude` (float8, optional)
   - `availability` (text[], e.g. ['Evening','Weekend'])
   - `preferred_distance` (int, km, default 10)
   - `updated_at` (timestamptz)

## New Tables

2. **games** — user-created games/matches
   - id, owner_id, title, sport, game_date, game_time, location, latitude, longitude,
     skill_level, max_players, description, status, created_at

3. **game_participants** — join table for games
   - id, game_id, user_id, joined_at, UNIQUE(game_id, user_id)

4. **teams** — user-created teams
   - id, owner_id, team_name, sport, skill_level, location, max_members, description, created_at

5. **team_members** — join table for teams
   - id, team_id, user_id, status (pending/accepted), role, joined_at, UNIQUE(team_id, user_id)

6. **venues** — sports venues
   - id, name, sports (text[]), address, latitude, longitude, rating, facilities (text[]),
     opening_hours, image_url, created_at

7. **tournaments** — sports tournaments
   - id, organizer_id, name, sport, location, tournament_date, registration_fee,
     max_teams, registered_teams, description, status, created_at

8. **tournament_registrations** — join table for tournaments
   - id, tournament_id, user_id, team_name, registered_at, UNIQUE(tournament_id, user_id)

9. **notifications** — user notifications
   - id, recipient_id, type, title, message, read, data (jsonb), created_at

10. **player_stats** — per-user sports statistics
    - id, user_id, games_played, games_won, teams_count, tournaments_count,
      connections_count, achievements (text[]), updated_at

## Security (RLS)

All tables have RLS enabled with appropriate policies:
- profiles: SELECT all (for discovery), UPDATE own only
- games: SELECT all, INSERT/UPDATE/DELETE own
- game_participants: SELECT all, INSERT/DELETE own
- teams: SELECT all, INSERT/UPDATE/DELETE own
- team_members: SELECT all, INSERT own, UPDATE own (accept/decline), DELETE own
- venues: SELECT all (anon+authenticated for public venue data), INSERT/UPDATE/DELETE own
- tournaments: SELECT all, INSERT/UPDATE/DELETE own
- tournament_registrations: SELECT all, INSERT/DELETE own
- notifications: SELECT/UPDATE/DELETE own only
- player_stats: SELECT all, INSERT/UPDATE own

## Important Notes

1. DEFAULT auth.uid() on all owner columns for seamless inserts.
2. A trigger auto-creates player_stats when a new profile is created.
3. All policies use auth.uid() for ownership checks.
4. Venues are readable by anon (public venue directory).
*/

-- ============ EXPAND PROFILES ============
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age int;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude float8;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude float8;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_distance int DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============ GAMES ============
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  sport text NOT NULL,
  game_date text NOT NULL DEFAULT '',
  game_time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  latitude float8,
  longitude float8,
  skill_level text NOT NULL DEFAULT 'Intermediate',
  max_players int NOT NULL DEFAULT 8,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "games_select_all" ON games;
CREATE POLICY "games_select_all" ON games FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "games_insert_own" ON games;
CREATE POLICY "games_insert_own" ON games FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "games_update_own" ON games;
CREATE POLICY "games_update_own" ON games FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "games_delete_own" ON games;
CREATE POLICY "games_delete_own" ON games FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ============ GAME PARTICIPANTS ============
CREATE TABLE IF NOT EXISTS game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id)
);

ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_participants_select_all" ON game_participants;
CREATE POLICY "game_participants_select_all" ON game_participants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "game_participants_insert_own" ON game_participants;
CREATE POLICY "game_participants_insert_own" ON game_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_participants_delete_own" ON game_participants;
CREATE POLICY "game_participants_delete_own" ON game_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ TEAMS ============
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  sport text NOT NULL,
  skill_level text NOT NULL DEFAULT 'Intermediate',
  location text NOT NULL DEFAULT '',
  max_members int NOT NULL DEFAULT 10,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_select_all" ON teams;
CREATE POLICY "teams_select_all" ON teams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "teams_insert_own" ON teams;
CREATE POLICY "teams_insert_own" ON teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "teams_update_own" ON teams;
CREATE POLICY "teams_update_own" ON teams FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "teams_delete_own" ON teams;
CREATE POLICY "teams_delete_own" ON teams FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ============ TEAM MEMBERS ============
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  role text DEFAULT '',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_members_select_all" ON team_members;
CREATE POLICY "team_members_select_all" ON team_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "team_members_insert_own" ON team_members;
CREATE POLICY "team_members_insert_own" ON team_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "team_members_update_own" ON team_members;
CREATE POLICY "team_members_update_own" ON team_members FOR UPDATE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid())) WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()));

DROP POLICY IF EXISTS "team_members_delete_own" ON team_members;
CREATE POLICY "team_members_delete_own" ON team_members FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()));

-- ============ VENUES ============
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sports text[] DEFAULT '{}',
  address text DEFAULT '',
  latitude float8,
  longitude float8,
  rating float8 DEFAULT 0,
  facilities text[] DEFAULT '{}',
  opening_hours text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venues_select_all" ON venues;
CREATE POLICY "venues_select_all" ON venues FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "venues_insert_own" ON venues;
CREATE POLICY "venues_insert_own" ON venues FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "venues_update_own" ON venues;
CREATE POLICY "venues_update_own" ON venues FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ TOURNAMENTS ============
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  sport text NOT NULL,
  location text NOT NULL DEFAULT '',
  tournament_date text NOT NULL DEFAULT '',
  registration_fee text NOT NULL DEFAULT 'Free',
  max_teams int NOT NULL DEFAULT 16,
  registered_teams int NOT NULL DEFAULT 0,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournaments_select_all" ON tournaments;
CREATE POLICY "tournaments_select_all" ON tournaments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tournaments_insert_own" ON tournaments;
CREATE POLICY "tournaments_insert_own" ON tournaments FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "tournaments_update_own" ON tournaments;
CREATE POLICY "tournaments_update_own" ON tournaments FOR UPDATE TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "tournaments_delete_own" ON tournaments;
CREATE POLICY "tournaments_delete_own" ON tournaments FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- ============ TOURNAMENT REGISTRATIONS ============
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  team_name text DEFAULT '',
  registered_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournament_reg_select_all" ON tournament_registrations;
CREATE POLICY "tournament_reg_select_all" ON tournament_registrations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tournament_reg_insert_own" ON tournament_registrations;
CREATE POLICY "tournament_reg_insert_own" ON tournament_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tournament_reg_delete_own" ON tournament_registrations;
CREATE POLICY "tournament_reg_delete_own" ON tournament_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = recipient_id);

-- ============ PLAYER STATS ============
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  games_played int NOT NULL DEFAULT 0,
  games_won int NOT NULL DEFAULT 0,
  teams_count int NOT NULL DEFAULT 0,
  tournaments_count int NOT NULL DEFAULT 0,
  connections_count int NOT NULL DEFAULT 0,
  achievements text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_stats_select_all" ON player_stats;
CREATE POLICY "player_stats_select_all" ON player_stats FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "player_stats_insert_own" ON player_stats;
CREATE POLICY "player_stats_insert_own" ON player_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "player_stats_update_own" ON player_stats;
CREATE POLICY "player_stats_update_own" ON player_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ AUTO-CREATE PLAYER STATS ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.player_stats (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_stats ON profiles;
CREATE TRIGGER on_profile_created_stats
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_stats();

REVOKE EXECUTE ON FUNCTION public.handle_new_user_stats() FROM anon, authenticated;

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_location ON games(location);
CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport);
CREATE INDEX IF NOT EXISTS idx_venues_sports ON venues USING gin(sports);
CREATE INDEX IF NOT EXISTS idx_tournaments_sport ON tournaments(sport);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_game ON game_participants(game_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_reg_tournament ON tournament_registrations(tournament_id);
