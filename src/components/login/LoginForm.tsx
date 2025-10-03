'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetRecoilState } from 'recoil';
import { authState } from '@/store/authState';
import { setAuthToken } from '@/utils/cookies';
import { loginUser } from '@/lib/api/auth';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    idOrEmail: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const setAuth = useSetRecoilState(authState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser(formData);
      
      // JWT 토큰 저장
      setAuthToken(response.accessToken);
      
      // Recoil 상태 업데이트
      setAuth({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      // 대시보드로 리다이렉트
      router.push('/save/dashboard');
      
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-black mb-2">
            ✕
          </div>
          <h1 className="text-2xl font-bold text-black">X-Play.G</h1>
          <p className="text-gray-600 mt-4">관리자 로그인</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID 입력 */}
          <div>
            <label htmlFor="idOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              id="idOrEmail"
              name="idOrEmail"
              value={formData.idOrEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="아이디를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Pass
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '로그인 중...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}