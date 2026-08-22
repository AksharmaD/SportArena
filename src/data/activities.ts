export type Activity = {
  title: string;
  type: string;
  emoji: string;
  day: string;
  time: string;
  location: string;
  joined: number;
  capacity: number;
  image: string;
};

export const activities: Activity[] = [
  {
    title: 'Weekend Cricket',
    type: 'Cricket Match',
    emoji: '🏏',
    day: 'Saturday',
    time: '5:00 PM',
    location: 'Hyderabad',
    joined: 6,
    capacity: 10,
    image:
      'https://images.pexels.com/photos/29463867/pexels-photo-29463867.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    title: 'Sunday Badminton',
    type: 'Practice Session',
    emoji: '🏸',
    day: 'Sunday',
    time: '7:00 AM',
    location: 'Begumpet',
    joined: 3,
    capacity: 4,
    image:
      'https://images.pexels.com/photos/14605729/pexels-photo-14605729.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    title: 'Morning 5K',
    type: 'Running',
    emoji: '🏃',
    day: 'Sunday',
    time: '6:00 AM',
    location: 'Hyderabad',
    joined: 12,
    capacity: 0,
    image:
      'https://images.pexels.com/photos/3764012/pexels-photo-3764012.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];
