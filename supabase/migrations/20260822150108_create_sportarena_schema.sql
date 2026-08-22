/*
# SportArena Core Schema

Creates the full multi-user schema for SportArena: profiles with sport selection,
discovery, activities (games/practices/tournaments), connections between athletes,
and in-app messaging.

## New Tables

1. **profiles** — extends auth.users with athlete-specific data
   - `id` (uuid, PK, matches auth.users.id)
   - `full_name` (text)
   - `bio` (text, optional)
   - `city` (text, where the athlete plays)
   - `area` (text, more specific location)
   - `avatar_url` (text, optional profile photo)
   - `sports` (text[], array of sport names the user plays)
   - `skill_level` (text, default 'Beginner')
   - `achievements` (text[], array of achievement strings)
   - `looking_for` (text[], array: 'Teams','Players','Tournaments')
   - `created_at` (timestamptz)

2. **activities** — games, practice sessions, tournaments
   - `id` (uuid, PK)
   - `owner_id` (uuid, FK profiles, who created it)
   - `title` (text)
   - `type` (text: 'Match','Practice','Tournament')
   - `sport` (text)
   - `day` (text, e.g. 'Saturday')
   - `time` (text, e.g. '5:00 PM')
   - `location` (text)
   - `capacity` (int, max participants, 0 = unlimited)
   - `joined_count` (int, default 0)
   - `image_url` (text, optional)
   - `created_at` (timestamptz)

3. **activity_participants** — join table for who joined which activity
   - `id` (uuid, PK)
   - `activity_id` (uuid, FK activities)
   - `user_id` (uuid, FK profiles)
   - `joined_at` (timestamptz)
   - UNIQUE(activity_id, user_id)

4. **connections** — athlete-to-athlete connect requests
   - `id` (uuid, PK)
   - `requester_id` (uuid, FK profiles)
   - `receiver_id` (uuid, FK profiles)
   - `status` (text: 'pending','accepted','declined', default 'pending')
   - `created_at` (timestamptz)
   - UNIQUE(requester_id, receiver_id)

5. **messages** — in-app chat between connected athletes
   - `id` (uuid, PK)
   - `sender_id` (uuid, FK profiles)
   - `receiver_id` (uuid, FK profiles)
   - `content` (text)
   - `read` (boolean, default false)
   - `created_at` (timestamptz)

## Security (RLS)

All tables have RLS enabled. Policies:
- **profiles**: authenticated users can SELECT all profiles (needed for discovery);
  users can UPDATE only their own profile. INSERT is handled at signup via a
  SECURITY DEFINER function (profiles are created automatically on signup).
- **activities**: authenticated can SELECT all; owner can INSERT/UPDATE/DELETE own.
- **activity_participants**: authenticated can SELECT all; users can INSERT/DELETE own participation.
- **connections**: authenticated can SELECT connections where they are requester or receiver;
  users can INSERT own (as requester), UPDATE own (accept/decline).
- **messages**: authenticated can SELECT messages they sent or received;
  users can INSERT messages where they are the sender.

## Important Notes

1. A trigger function `handle_new_user` automatically creates a profile row when a
   new user signs up via Supabase Auth, using the email as full_name placeholder.
2. `DEFAULT auth.uid()` on owner columns so inserts work without explicitly passing user_id.
3. Email confirmation is OFF (Supabase default for this environment).
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  city text DEFAULT '',
  area text DEFAULT '',
  avatar_url text DEFAULT '',
  sports text[] DEFAULT '{}',
  skill_level text NOT NULL DEFAULT 'Beginner',
  achievements text[] DEFAULT '{}',
  looking_for text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ ACTIVITIES ============
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Match',
  sport text NOT NULL,
  day text NOT NULL DEFAULT '',
  time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  capacity int NOT NULL DEFAULT 0,
  joined_count int NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_select_all" ON activities;
CREATE POLICY "activities_select_all" ON activities FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "activities_insert_own" ON activities;
CREATE POLICY "activities_insert_own" ON activities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "activities_update_own" ON activities;
CREATE POLICY "activities_update_own" ON activities FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "activities_delete_own" ON activities;
CREATE POLICY "activities_delete_own" ON activities FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ============ ACTIVITY PARTICIPANTS ============
CREATE TABLE IF NOT EXISTS activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_select_all" ON activity_participants;
CREATE POLICY "participants_select_all" ON activity_participants FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "participants_insert_own" ON activity_participants;
CREATE POLICY "participants_insert_own" ON activity_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "participants_delete_own" ON activity_participants;
CREATE POLICY "participants_delete_own" ON activity_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CONNECTIONS ============
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "connections_select_own" ON connections;
CREATE POLICY "connections_select_own" ON connections FOR SELECT
  TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "connections_insert_own" ON connections;
CREATE POLICY "connections_insert_own" ON connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "connections_update_own" ON connections;
CREATE POLICY "connections_update_own" ON connections FOR UPDATE
  TO authenticated USING (auth.uid() = receiver_id OR auth.uid() = requester_id)
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = requester_id);

-- ============ MESSAGES ============
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_own" ON messages;
CREATE POLICY "messages_select_own" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert_own" ON messages;
CREATE POLICY "messages_insert_own" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_activities_sport ON activities(sport);
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(location);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
