import { Cookies } from "react-cookie";

const cookies = new Cookies();

// 쿠키 옵션 타입 정의
interface CookieOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | "none" | "lax" | "strict";
}

export const setCookie = (name: string, value: string, options?: CookieOptions) => {
  return cookies.set(name, value, { ...options });
};

export const getCookie = (name: string) => {
  return cookies.get(name);
};

export const removeCookie = (name: string, options?: CookieOptions) => {
  return cookies.remove(name, { ...options });
};

// JWT 토큰 관련 헬퍼 함수들
export const TOKEN_COOKIE_NAME = 'xpg_admin_token';

export const setAuthToken = (token: string) => {
  return setCookie(TOKEN_COOKIE_NAME, token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
};

export const getAuthToken = () => {
  return getCookie(TOKEN_COOKIE_NAME);
};

export const removeAuthToken = () => {
  return removeCookie(TOKEN_COOKIE_NAME, { path: '/' });
};