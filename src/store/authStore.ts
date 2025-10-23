import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // 로딩 상태 추가
  setUser: (user: User | null) => void;
  logout: () => void;
  setIsLoading: (loading: boolean) => void; // 로딩 상태 변경 함수 추가
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // 초기 상태는 '로딩 중'
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));