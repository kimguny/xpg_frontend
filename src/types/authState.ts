import { atom, selector } from 'recoil';
import { AuthState } from '@/types/auth';
import { getAuthToken } from '@/utils/cookies';

// 인증 상태 atom
export const authState = atom<AuthState>({
  key: 'authState',
  default: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
});

// 현재 사용자 selector
export const currentUserSelector = selector({
  key: 'currentUserSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.user;
  },
});

// 인증 여부 selector
export const isAuthenticatedSelector = selector({
  key: 'isAuthenticatedSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.isAuthenticated;
  },
});

// 관리자 권한 여부 selector
export const isAdminSelector = selector({
  key: 'isAdminSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.user?.isAdmin ?? false;
  },
});

// 토큰 존재 여부 selector (초기 로딩시 토큰 확인용)
export const hasTokenSelector = selector({
  key: 'hasTokenSelector',
  get: () => {
    if (typeof window !== 'undefined') {
      return !!getAuthToken();
    }
    return false;
  },
});