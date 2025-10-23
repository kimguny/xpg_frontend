import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getAuthToken } from '@/utils/cookies';
import { getMyProfile } from '@/lib/api/auth'; // /me API 호출 함수

export const useAuthInit = () => {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // 토큰이 있으면 /me API로 사용자 정보를 가져옵니다.
          const userProfile = await getMyProfile();
          setUser(userProfile);
        } catch (error) {
          // 토큰이 유효하지 않으면 로그아웃 처리합니다.
          console.error("Token validation failed:", error);
          setUser(null);
        }
      } else {
        // 토큰이 없으면 로딩 상태만 false로 변경합니다.
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setIsLoading]);
};