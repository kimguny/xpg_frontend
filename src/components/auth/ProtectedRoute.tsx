'use client';

import { useEffect, ReactNode } from 'react'; // ✨ 1. useEffect를 import 합니다.
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuthInit } from '@/hooks/useAuthInit';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  useAuthInit(); 

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);


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

  return <>{children}</>;
}