import { create } from 'zustand';

interface FeedState {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  activeTab: 0,
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
