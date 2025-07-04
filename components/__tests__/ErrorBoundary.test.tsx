import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, ErrorBoundaryWrapper } from '../ErrorBoundary';

// 에러를 발생시키는 테스트 컴포넌트
const ThrowErrorComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('테스트 에러가 발생했습니다');
  }
  return <div>정상 컴포넌트입니다</div>;
};

// console.error 모킹 (테스트 출력을 깔끔하게 하기 위해)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('정상 상태', () => {
    it('자식 컴포넌트에서 에러가 발생하지 않으면 정상적으로 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('정상 컴포넌트입니다')).toBeInTheDocument();
    });

    it('여러 자식 컴포넌트를 올바르게 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <div>첫 번째 컴포넌트</div>
          <div>두 번째 컴포넌트</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('첫 번째 컴포넌트')).toBeInTheDocument();
      expect(screen.getByText('두 번째 컴포넌트')).toBeInTheDocument();
    });
  });

  describe('에러 발생 시', () => {
    it('기본 에러 UI를 표시한다', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText(/애플리케이션에서 예상치 못한 오류가 발생했습니다/)).toBeInTheDocument();
      expect(screen.getByText('다시 시도')).toBeInTheDocument();
      expect(screen.getByText('페이지 새로고침')).toBeInTheDocument();
    });

    it('커스텀 fallback UI를 표시한다', () => {
      const customFallback = <div>커스텀 에러 메시지</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('커스텀 에러 메시지')).toBeInTheDocument();
      expect(screen.queryByText('문제가 발생했습니다')).not.toBeInTheDocument();
    });

    it('onError 콜백을 호출한다', () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    it('개발 모드에서 에러 세부사항을 표시한다', () => {
      // process.env를 전체적으로 모킹
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development',
      };

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('에러 세부사항 (개발 모드)')).toBeInTheDocument();

      // 환경 변수 복원
      process.env = originalEnv;
    });

    it('프로덕션 모드에서 에러 세부사항을 숨긴다', () => {
      // process.env를 전체적으로 모킹
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
      };

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.queryByText('에러 세부사항 (개발 모드)')).not.toBeInTheDocument();

      // 환경 변수 복원
      process.env = originalEnv;
    });
  });

  describe('에러 복구', () => {
    it('다시 시도 버튼으로 에러 상태를 리셋한다', () => {
      let shouldThrow = true;
      
      const DynamicErrorComponent = () => {
        if (shouldThrow) {
          throw new Error('테스트 에러');
        }
        return <div>복구된 컴포넌트</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <DynamicErrorComponent />
        </ErrorBoundary>
      );

      // 에러 상태 확인
      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();

      // 에러 조건 변경
      shouldThrow = false;

      // 다시 시도 버튼 클릭
      fireEvent.click(screen.getByText('다시 시도'));

      // 리렌더링 후 컴포넌트가 정상적으로 표시되는지 확인
      rerender(
        <ErrorBoundary>
          <DynamicErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('복구된 컴포넌트')).toBeInTheDocument();
    });

    it('페이지 새로고침 버튼이 클릭 가능하고 이벤트 핸들러가 연결되어 있다', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('페이지 새로고침');
      
      // 버튼이 존재하고 클릭 가능한지 확인
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton).toHaveAttribute('type', 'button');
      
      // 클릭 이벤트가 오류 없이 실행되는지 확인
      expect(() => {
        fireEvent.click(reloadButton);
      }).not.toThrow();
    });
  });

  describe('ErrorBoundaryWrapper', () => {
    it('ErrorBoundaryWrapper가 올바르게 작동한다', () => {
      render(
        <ErrorBoundaryWrapper>
          <ThrowErrorComponent shouldThrow={false} />
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByText('정상 컴포넌트입니다')).toBeInTheDocument();
    });

    it('ErrorBoundaryWrapper에서 에러가 발생하면 기본 에러 UI를 표시한다', () => {
      render(
        <ErrorBoundaryWrapper>
          <ThrowErrorComponent />
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    });

    it('ErrorBoundaryWrapper에 커스텀 fallback을 전달할 수 있다', () => {
      const customFallback = <div>래퍼 커스텀 에러</div>;

      render(
        <ErrorBoundaryWrapper fallback={customFallback}>
          <ThrowErrorComponent />
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByText('래퍼 커스텀 에러')).toBeInTheDocument();
    });

    it('ErrorBoundaryWrapper에 onError 콜백을 전달할 수 있다', () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundaryWrapper onError={mockOnError}>
          <ThrowErrorComponent />
        </ErrorBoundaryWrapper>
      );

      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
  });

  describe('접근성', () => {
    it('에러 UI에 적절한 ARIA 속성이 있다', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      const resetButton = screen.getByText('다시 시도');
      const reloadButton = screen.getByText('페이지 새로고침');

      expect(resetButton).toHaveAttribute('type', 'button');
      expect(reloadButton).toHaveAttribute('type', 'button');
    });

    it('키보드 네비게이션이 가능하다', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      const resetButton = screen.getByText('다시 시도');
      const reloadButton = screen.getByText('페이지 새로고침');

      // 포커스 가능 여부 확인
      resetButton.focus();
      expect(resetButton).toHaveFocus();

      reloadButton.focus();
      expect(reloadButton).toHaveFocus();
    });
  });

  describe('에러 로깅', () => {
    it('에러를 콘솔에 로깅한다', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });
}); 