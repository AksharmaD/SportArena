export type Post = {
  name: string;
  sport: string;
  emoji: string;
  avatar: string;
  text: string;
  likes: number;
  comments: number;
  time: string;
};

export const posts: Post[] = [
  {
    name: 'Rahul Sharma',
    sport: 'Cricket',
    emoji: '🏏',
    avatar:
      'https://images.pexels.com/photos/23940843/pexels-photo-23940843.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'Won our college championship today! 🏆',
    likes: 24,
    comments: 5,
    time: '2h ago',
  },
  {
    name: 'Priya Singh',
    sport: 'Running',
    emoji: '🏃',
    avatar:
      'https://images.pexels.com/photos/26655569/pexels-photo-26655569.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'New 5K personal best — 24:32! 🔥',
    likes: 41,
    comments: 8,
    time: '4h ago',
  },
];
