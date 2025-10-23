import { create } from 'zustand';
import { Content } from '@/lib/api/admin';

interface ContentStore {
  contentToClone: Content | null;
  setContentToClone: (content: Content | null) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  contentToClone: null,
  setContentToClone: (content) => set({ contentToClone: content }),
}));