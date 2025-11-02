// src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * 디바운스된 값을 반환하는 커스텀 훅
 * @param value 디바운싱할 값 (예: 검색어)
 * @param delay 디바운싱 지연 시간 (ms)
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 디바운스된 값을 저장할 state
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 이후에 value로 state를 업데이트하는 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 컴포넌트가 언마운트되거나 value/delay가 변경되면
    // 이전에 설정한 타이머를 취소합니다.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // value나 delay가 변경될 때만 이 effect를 재실행

  return debouncedValue;
}