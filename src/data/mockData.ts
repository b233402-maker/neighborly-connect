export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  karma: number;
  verified: boolean;
  isPro: boolean;
  lat: number;
  lng: number;
  privacyLevel: "blurred" | "public" | "hidden";
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: User;
  title: string;
  description: string;
  category: "borrow" | "service" | "urgent" | "offering";
  tags: string[];
  image?: string;
  status: "open" | "fulfilled";
  likes: number;
  comments: Comment[];
  lat: number;
  lng: number;
  createdAt: string;
  type: "need" | "offer";
}

export interface Message {
  id: string;
  from: User;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface Notification {
  id: string;
  user: User;
  action: string;
  target: string;
  time: string;
  read: boolean;
  type: "help" | "comment" | "like" | "karma" | "system";
}

export const currentUser: User = {
  id: "u1",
  name: "Alex Rivera",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  bio: "Always happy to lend a hand 🤝",
  karma: 340,
  verified: true,
  isPro: true,
  lat: 40.7128,
  lng: -74.006,
  privacyLevel: "blurred",
};

export const users: User[] = [
  currentUser,
  { id: "u2", name: "Mia Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia", bio: "Dog walker & plant lover 🌿", karma: 210, verified: true, isPro: false, lat: 40.715, lng: -74.003, privacyLevel: "blurred" },
  { id: "u3", name: "James Okafor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", bio: "Handy with tools 🔧", karma: 580, verified: true, isPro: true, lat: 40.718, lng: -74.008, privacyLevel: "public" },
  { id: "u4", name: "Sofia Gutierrez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia", bio: "Chef by night, neighbor by day 🍳", karma: 125, verified: false, isPro: false, lat: 40.710, lng: -74.001, privacyLevel: "blurred" },
  { id: "u5", name: "Ethan Park", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan", bio: "Tech geek, can fix your wifi 💻", karma: 420, verified: true, isPro: false, lat: 40.720, lng: -74.010, privacyLevel: "blurred" },
];

const makeComments = (postId: string): Comment[] => {
  const commentSets: Record<string, Comment[]> = {
    p1: [
      { id: "c1", author: users[2], text: "I can walk Biscuit! I love golden retrievers 🐕", createdAt: "1h ago", likes: 3, replies: [
        { id: "c1r1", author: users[1], text: "That would be amazing James! I'll DM you the details.", createdAt: "45min ago", likes: 1 },
        { id: "c1r2", author: users[4], text: "James is great with dogs, you're in good hands!", createdAt: "30min ago", likes: 2 },
      ]},
      { id: "c2", author: users[3], text: "If James can't make it, I'm also available Saturday afternoon!", createdAt: "50min ago", likes: 1 },
      { id: "c3", author: users[0], text: "Such a helpful neighborhood ❤️", createdAt: "20min ago", likes: 4 },
    ],
    p2: [
      { id: "c4", author: users[0], text: "I could really use this! When can I pick it up?", createdAt: "3h ago", likes: 2, replies: [
        { id: "c4r1", author: users[2], text: "Anytime this week Alex! Just swing by after 5pm.", createdAt: "2h ago", likes: 1 },
      ]},
      { id: "c5", author: users[4], text: "Great neighbor move, James! 👍", createdAt: "2h ago", likes: 5 },
    ],
    p3: [
      { id: "c6", author: users[0], text: "Yeah we lost power too on Oak Ave. Called ConEd as well.", createdAt: "30min ago", likes: 8, replies: [
        { id: "c6r1", author: users[3], text: "Thanks Alex. They said 2 hours to restore.", createdAt: "25min ago", likes: 3 },
      ]},
      { id: "c7", author: users[2], text: "I have a portable generator if anyone needs to charge phones!", createdAt: "20min ago", likes: 12 },
      { id: "c8", author: users[4], text: "Power company just posted an update — should be back by 6pm", createdAt: "10min ago", likes: 15 },
    ],
    p4: [
      { id: "c9", author: users[1], text: "My wifi has been dropping all week! Can you help?", createdAt: "20h ago", likes: 1, replies: [
        { id: "c9r1", author: users[4], text: "Absolutely Mia! DM me your address and I'll come by tomorrow.", createdAt: "18h ago", likes: 2 },
      ]},
    ],
    p5: [
      { id: "c10", author: users[2], text: "I have two! Come grab one from my porch.", createdAt: "1d ago", likes: 3, replies: [
        { id: "c10r1", author: users[0], text: "You're a lifesaver James! Picked it up, thank you! 🙏", createdAt: "1d ago", likes: 5 },
      ]},
    ],
  };
  return commentSets[postId] || [];
};

export const mockPosts: Post[] = [
  {
    id: "p1", author: users[1], title: "Need someone to walk my dog this Saturday",
    description: "Going to a family event and need someone to walk Biscuit (golden retriever, very friendly) around 2pm. Usually a 30-min walk around the park.",
    category: "service", tags: ["#Service", "#PetCare"], status: "open",
    likes: 12, comments: makeComments("p1"), lat: 40.715, lng: -74.003, createdAt: "2h ago", type: "need",
  },
  {
    id: "p2", author: users[2], title: "Free ladder available to borrow",
    description: "I have a 12ft aluminum extension ladder that I'm not using this week. Happy to lend it out — just bring it back in one piece!",
    category: "borrow", tags: ["#Borrow", "#Tools"], status: "open",
    likes: 24, comments: makeComments("p2"), lat: 40.718, lng: -74.008, createdAt: "4h ago", type: "offer",
  },
  {
    id: "p3", author: users[3], title: "Power outage on Elm Street — anyone else?",
    description: "Our whole block lost power about 20 minutes ago. Already called the utility company. If anyone has info or needs help keeping food cold, let me know!",
    category: "urgent", tags: ["#Urgent", "#PowerOutage"], status: "open",
    likes: 45, comments: makeComments("p3"), lat: 40.710, lng: -74.001, createdAt: "35min ago", type: "need",
  },
  {
    id: "p4", author: users[4], title: "Offering free WiFi troubleshooting",
    description: "IT professional here — happy to help anyone in the neighborhood diagnose connectivity issues. Just ping me and I'll swing by.",
    category: "service", tags: ["#Service", "#Tech"], status: "open",
    likes: 31, comments: makeComments("p4"), lat: 40.720, lng: -74.010, createdAt: "1d ago", type: "offer",
  },
  {
    id: "p5", author: users[0], title: "Looking for a snow shovel to borrow",
    description: "The forecast says 6 inches tomorrow and I just moved in. Anyone have a spare shovel?",
    category: "borrow", tags: ["#Borrow", "#Winter"], status: "fulfilled",
    likes: 8, comments: makeComments("p5"), lat: 40.7128, lng: -74.006, createdAt: "2d ago", type: "need",
  },
];

export const mockMessages: Message[] = [
  { id: "m1", from: users[2], lastMessage: "Sure, come grab the ladder anytime after 5!", time: "2h ago", unread: 2, online: true },
  { id: "m2", from: users[1], lastMessage: "Thanks for offering to walk Biscuit! 🐕", time: "3h ago", unread: 0, online: true },
  { id: "m3", from: users[3], lastMessage: "Power is back on our end finally!", time: "1h ago", unread: 1, online: false },
  { id: "m4", from: users[4], lastMessage: "I can check your router tomorrow morning", time: "5h ago", unread: 0, online: true },
];

export const mockNotifications: Notification[] = [
  { id: "n1", user: users[2], action: "offered to help on", target: "your snow shovel request", time: "1h ago", read: false, type: "help" },
  { id: "n2", user: users[1], action: "commented on", target: "Power outage on Elm Street", time: "2h ago", read: false, type: "comment" },
  { id: "n3", user: users[4], action: "liked", target: "your post about WiFi help", time: "3h ago", read: false, type: "like" },
  { id: "n4", user: users[3], action: "gave you +10 Karma for", target: "helping with groceries", time: "5h ago", read: true, type: "karma" },
  { id: "n5", user: users[2], action: "commented on", target: "Free ladder available", time: "6h ago", read: true, type: "comment" },
  { id: "n6", user: users[1], action: "offered to help on", target: "Dog walking Saturday", time: "8h ago", read: true, type: "help" },
  { id: "n7", user: users[4], action: "liked", target: "your comment on Power outage", time: "1d ago", read: true, type: "like" },
];

export const mockChatMessages = [
  { id: "cm1", from: "them" as const, text: "Hey Alex! I saw you need a snow shovel?", time: "10:30 AM" },
  { id: "cm2", from: "me" as const, text: "Yes! The forecast looks pretty bad for tomorrow 😅", time: "10:32 AM" },
  { id: "cm3", from: "them" as const, text: "I have two shovels, you can borrow one! Just come by my place.", time: "10:33 AM" },
  { id: "cm4", from: "me" as const, text: "You're a lifesaver! What's a good time?", time: "10:35 AM" },
  { id: "cm5", from: "them" as const, text: "Sure, come grab the ladder anytime after 5!", time: "10:40 AM" },
  { id: "cm6", from: "me" as const, text: "Perfect, I'll swing by around 5:30. Thanks so much! 🙏", time: "10:42 AM" },
];
