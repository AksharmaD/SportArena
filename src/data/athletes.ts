export type Athlete = {
  name: string;
  sport: string;
  emoji: string;
  level: string;
  location: string;
  distance?: string;
  avatar: string;
  match?: boolean;
};

export const featuredAthlete = {
  name: 'Rahul Sharma',
  sport: 'Cricket',
  emoji: '🏏',
  level: 'Intermediate',
  location: 'Hyderabad',
  avatar:
    'https://images.pexels.com/photos/23940843/pexels-photo-23940843.jpeg?auto=compress&cs=tinysrgb&w=600',
  sports: [
    { name: 'Cricket', level: 'Intermediate' },
    { name: 'Badminton', level: 'Beginner' },
  ],
  achievements: [
    { title: 'College Cricket Champion', emoji: '🏆' },
    { title: 'District Tournament Winner', emoji: '🥇' },
  ],
  lookingFor: ['Teams', 'Players', 'Tournaments'],
};

export const discoveryAthletes: Athlete[] = [
  {
    name: 'Rahul Sharma',
    sport: 'Cricket',
    emoji: '🏏',
    level: 'Intermediate',
    location: 'Hyderabad',
    distance: '1.2 km away',
    avatar:
      'https://images.pexels.com/photos/23940843/pexels-photo-23940843.jpeg?auto=compress&cs=tinysrgb&w=400',
    match: true,
  },
  {
    name: 'Arjun Kumar',
    sport: 'Cricket',
    emoji: '🏏',
    level: 'Intermediate',
    location: 'Hyderabad',
    distance: '2.4 km away',
    avatar:
      'https://images.pexels.com/photos/20613105/pexels-photo-20613105.jpeg?auto=compress&cs=tinysrgb&w=400',
    match: true,
  },
  {
    name: 'Priya Singh',
    sport: 'Badminton',
    emoji: '🏸',
    level: 'Advanced',
    location: 'Hyderabad',
    distance: '3.1 km away',
    avatar:
      'https://images.pexels.com/photos/26655569/pexels-photo-26655569.jpeg?auto=compress&cs=tinysrgb&w=400',
    match: true,
  },
];
