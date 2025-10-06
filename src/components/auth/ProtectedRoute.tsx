'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/authState'; // authState 전체를 import하여 isAuthenticated와 isLoading 사용
import { useAuthInitialization } from '@/hooks/useAuthInitialization'; // 초기 인증 확인을 위한 커스텀 훅 (추후 구현 필요)

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 인증된 사용자만 접근할 수 있도록 페이지를 보호하는 컴포넌트입니다.
 * * 1. 로딩 중: 로딩 화면 표시
 * 2. 미인증: /login 페이지로 리다이렉트
 * 3. 인증됨: 자식 컴포넌트 렌더링
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRecoilValue(authState);
  
  // NOTE: Next.js CSR 환경에서 Recoil 상태를 초기화하는 로직이 필요합니다. 
  // 여기서는 useAuthInitialization 훅이 쿠키를 확인하고 authState를 초기화한다고 가정합니다.
  // useAuthInitialization(); 

  useEffect(() => {
    // 1. 로딩이 끝났고 (isLoading === false)
    // 2. 인증되지 않았다면 (isAuthenticated === false)
    if (!isLoading && !isAuthenticated) {
      // 관리자 로그인 페이지로 리다이렉트
      router.replace('/login'); 
    }
  }, [isAuthenticated, isLoading, router]);

  // 1. 초기 인증 상태 확인 중이거나 (페이지 로드 시 쿠키 검사 등)
  // 2. 인증되지 않은 상태에서 리다이렉션을 기다리는 중
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // 3. 인증이 완료되면 자식 컴포넌트(보호된 페이지)를 렌더링
  return <>{children}</>;
}
