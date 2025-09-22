'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRecoilValue } from 'recoil';
import { hasTokenSelector } from '@/store/authState';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const hasToken = useRecoilValue(hasTokenSelector);

  useEffect(() => {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!hasToken) {
      router.push('/');
    }
  }, [hasToken, router]);

  // 토큰이 없으면 로딩 화면 표시
  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 토큰이 있으면 자식 컴포넌트 렌더링
  return <>{children}</>;
}