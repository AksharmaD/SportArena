export type Profile = {
  id: string;
  full_name: string;
  bio: string;
  city: string;
  area: string;
  avatar_url: string;
  profile_image: string;
  age: number | null;
  latitude: number | null;
  longitude: number | null;
  sports: string[];
  skill_level: string;
  achievements: string[];
  looking_for: string[];
  availability: string[];
  preferred_distance: number;
  created_at: string;
  updated_at: string;
};

export type Game = {
  id: string;
  owner_id: string;
  title: string;
  sport: string;
  game_date: string;
  game_time: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  skill_level: string;
  max_players: number;
  description: string;
  status: string;
  created_at: string;
};

export type Team = {
  id: string;
  owner_id: string;
  team_name: string;
  sport: string;
  skill_level: string;
  location: string;
  max_members: number;
  description: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  status: 'pending' | 'accepted';
  role: string;
  joined_at: string;
};

export type Venue = {
  id: string;
  name: string;
  sports: string[];
  address: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  facilities: string[];
  opening_hours: string;
  image_url: string;
};

export type Tournament = {
  id: string;
  organizer_id: string;
  name: string;
  sport: string;
  location: string;
  tournament_date: string;
  registration_fee: string;
  max_teams: number;
  registered_teams: number;
  description: string;
  status: string;
  created_at: string;
};

export type Notification = {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown>;
  created_at: string;
};

export type PlayerStats = {
  id: string;
  user_id: string;
  games_played: number;
  games_won: number;
  teams_count: number;
  tournaments_count: number;
  connections_count: number;
  achievements: string[];
  updated_at: string;
};

export type Activity = {
  id: string;
  owner_id: string;
  title: string;
  type: string;
  sport: string;
  day: string;
  time: string;
  location: string;
  capacity: number;
  joined_count: number;
  image_url: string;
  created_at: string;
};

export type Connection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export const SPORT_OPTIONS = [
  'Cricket',
  'Football',
  'Badminton',
  'Running',
  'Swimming',
  'Chess',
  'Basketball',
  'Volleyball',
  'Tennis',
  'Table Tennis',
  'Cycling',
  'Yoga',
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

export const AVAILABILITY_OPTIONS = ['Morning', 'Evening', 'Weekend', 'Weekdays', 'Flexible'];

export const LOOKING_FOR_OPTIONS = ['Players', 'Games', 'Teams', 'Tournaments', 'Practice Partners', 'Coaching'];

export const SPORT_EMOJIS: Record<string, string> = {
  Cricket: '🏏',
  Football: '⚽',
  Badminton: '🏸',
  Running: '🏃',
  Swimming: '🏊',
  Chess: '♟',
  Basketball: '🏀',
  Volleyball: '🏐',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Cycling: '🚴',
  Yoga: '🧘',
};
