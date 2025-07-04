import { useEffect, useState } from 'react';

/**
 * 사용자의 모션 감소 선호도를 감지하는 커스텀 훅
 * 접근성을 위해 prefers-reduced-motion 미디어 쿼리를 사용
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // 미디어 쿼리 확인
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // 초기 상태 설정
    setPrefersReducedMotion(mediaQuery.matches);

    // 미디어 쿼리 변경 감지
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // 이벤트 리스너 추가
    mediaQuery.addEventListener('change', handleChange);

    // 정리 함수
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}; 