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
  comments: number;
  lat: number;
  lng: number;
  createdAt: string;
  type: "need" | "offer";
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

const users: User[] = [
  currentUser,
  { id: "u2", name: "Mia Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia", bio: "Dog walker & plant lover", karma: 210, verified: true, isPro: false, lat: 40.715, lng: -74.003, privacyLevel: "blurred" },
  { id: "u3", name: "James Okafor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", bio: "Handy with tools 🔧", karma: 580, verified: true, isPro: true, lat: 40.718, lng: -74.008, privacyLevel: "public" },
  { id: "u4", name: "Sofia Gutierrez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia", bio: "Chef by night, neighbor by day", karma: 125, verified: false, isPro: false, lat: 40.710, lng: -74.001, privacyLevel: "blurred" },
  { id: "u5", name: "Ethan Park", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan", bio: "Tech geek, can fix your wifi", karma: 420, verified: true, isPro: false, lat: 40.720, lng: -74.010, privacyLevel: "blurred" },
];

export const mockPosts: Post[] = [
  {
    id: "p1", author: users[1], title: "Need someone to walk my dog this Saturday",
    description: "Going to a family event and need someone to walk Biscuit (golden retriever, very friendly) around 2pm. Usually a 30-min walk around the park.",
    category: "service", tags: ["#Service", "#PetCare"], status: "open",
    likes: 12, comments: 5, lat: 40.715, lng: -74.003, createdAt: "2h ago", type: "need",
  },
  {
    id: "p2", author: users[2], title: "Free ladder available to borrow",
    description: "I have a 12ft aluminum extension ladder that I'm not using this week. Happy to lend it out — just bring it back in one piece!",
    category: "borrow", tags: ["#Borrow", "#Tools"], status: "open",
    likes: 24, comments: 8, lat: 40.718, lng: -74.008, createdAt: "4h ago", type: "offer",
  },
  {
    id: "p3", author: users[3], title: "Power outage on Elm Street — anyone else?",
    description: "Our whole block lost power about 20 minutes ago. Already called the utility company. If anyone has info or needs help keeping food cold, let me know!",
    category: "urgent", tags: ["#Urgent", "#PowerOutage"], status: "open",
    likes: 45, comments: 23, lat: 40.710, lng: -74.001, createdAt: "35min ago", type: "need",
  },
  {
    id: "p4", author: users[4], title: "Offering free WiFi troubleshooting",
    description: "IT professional here — happy to help anyone in the neighborhood diagnose connectivity issues. Just ping me and I'll swing by.",
    category: "service", tags: ["#Service", "#Tech"], status: "open",
    likes: 31, comments: 4, lat: 40.720, lng: -74.010, createdAt: "1d ago", type: "offer",
  },
  {
    id: "p5", author: users[0], title: "Looking for a snow shovel to borrow",
    description: "The forecast says 6 inches tomorrow and I just moved in. Anyone have a spare shovel?",
    category: "borrow", tags: ["#Borrow", "#Winter"], status: "fulfilled",
    likes: 8, comments: 3, lat: 40.7128, lng: -74.006, createdAt: "2d ago", type: "need",
  },
];

export const navItems = [
  { label: "Feed", icon: "home" as const, path: "/" },
  { label: "Map", icon: "map" as const, path: "/map" },
  { label: "Messages", icon: "messages" as const, path: "/messages" },
  { label: "Notifications", icon: "bell" as const, path: "/notifications" },
  { label: "Profile", icon: "profile" as const, path: "/profile" },
];
