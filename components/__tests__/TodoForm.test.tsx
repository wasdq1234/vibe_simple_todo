import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TodoForm from '../TodoForm';

// useTodos 훅 모킹
const mockAddTodo = jest.fn();
const mockClearError = jest.fn();

// 모킹 객체를 저장할 변수
let mockUseTodos = {
  addTodo: mockAddTodo,
  error: null as string | null,
  clearError: mockClearError,
  isLoading: false,
};

jest.mock('@/hooks/useTodos', () => ({
  useTodos: () => mockUseTodos,
}));

describe('TodoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링 및 초기 상태', () => {
    it('기본 구조가 올바르게 렌더링된다', () => {
      render(<TodoForm />);
      
      expect(screen.getByRole('form', { name: /새로운 할 일 추가 폼/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/새로운 할 일 입력/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /할 일 추가/i })).toBeInTheDocument();
    });

    it('커스텀 placeholder가 적용된다', () => {
      const customPlaceholder = '오늘 할 일을 입력하세요';
      render(<TodoForm placeholder={customPlaceholder} />);
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('빈 입력 필드 상태에서 추가 버튼이 비활성화된다', () => {
      render(<TodoForm />);
      
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      expect(addButton).toBeDisabled();
    });

    it('접근성 속성들이 올바르게 설정된다', () => {
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const form = screen.getByRole('form');
      
      expect(form).toHaveAttribute('aria-label', '새로운 할 일 추가 폼');
      expect(form).toHaveAttribute('aria-describedby', 'form-description');
      expect(input).toHaveAttribute('aria-describedby');
      expect(screen.getByText(/할 일을 입력하고 Enter 키를 누르거나/)).toHaveClass('sr-only');
    });
  });

  describe('입력 및 유효성 검사', () => {
    it('텍스트 입력이 올바르게 작동한다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      await user.type(input, '새로운 할 일');
      
      expect(input).toHaveValue('새로운 할 일');
    });

    it('텍스트 입력 시 추가 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      await user.type(input, '할 일');
      
      expect(addButton).toBeEnabled();
    });

    it('450자 초과 시 남은 문자수가 표시된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const longText = 'a'.repeat(451);
      
      await user.type(input, longText);
      
      expect(screen.getByText(/49자 남음/)).toBeInTheDocument();
    });

    it('빈 텍스트 제출 시 유효성 검사 에러가 표시된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      // 공백만 입력
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      await user.type(input, '   ');
      
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText(/빈 공간만으로는 할 일을 추가할 수 없습니다/)).toBeInTheDocument();
      });
    });

    it('500자 초과 입력 시 유효성 검사 에러가 표시된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const tooLongText = 'a'.repeat(501);
      
      await user.type(input, tooLongText);
      
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText(/500자 이하로 입력해주세요/)).toBeInTheDocument();
      });
    });

    it('유효성 검사 에러 시 input 필드에 에러 스타일이 적용된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      await user.type(input, '   ');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(input).toHaveClass('border-red-500');
      });
    });
  });

  describe('폼 제출', () => {
    it('유효한 텍스트로 폼 제출이 성공한다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      await user.type(input, '새로운 할 일');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockAddTodo).toHaveBeenCalledWith('새로운 할 일');
      });
    });

    it('제출 후 입력 필드가 초기화된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      await user.type(input, '새로운 할 일');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('텍스트 앞뒤 공백이 제거되어 제출된다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      await user.type(input, '  새로운 할 일  ');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockAddTodo).toHaveBeenCalledWith('새로운 할 일');
      });
    });
  });

  describe('키보드 접근성', () => {
    it('Enter 키로 폼 제출이 가능하다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      
      await user.type(input, '새로운 할 일');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockAddTodo).toHaveBeenCalledWith('새로운 할 일');
      });
    });

    it('Shift+Enter는 폼을 제출하지 않는다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      
      await user.type(input, '새로운 할 일');
      
      // Shift+Enter 키 조합 시뮬레이션
      fireEvent.keyDown(input, {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
      });
      
      // 잠시 기다려서 제출되지 않았는지 확인
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('Tab으로 폼 요소들 간 이동이 가능하다', async () => {
      const user = userEvent.setup();
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      
      // autoFocus로 인해 이미 input에 포커스가 있음
      expect(input).toHaveFocus();
      
      // 버튼을 활성화하기 위해 텍스트 입력
      await user.type(input, '할 일');
      
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      // Tab으로 다음 요소로 이동 (이제 버튼이 활성화됨)
      await user.tab();
      expect(addButton).toHaveFocus();
      
      // Shift+Tab으로 이전 요소로 이동
      await user.tab({ shift: true });
      expect(input).toHaveFocus();
    });
  });

  describe('에러 상태 처리', () => {
    it('useTodos 에러가 표시된다', () => {
      // 에러 상태로 모킹 변경
      mockUseTodos.error = '네트워크 오류가 발생했습니다';
      
      render(<TodoForm />);
      
      expect(screen.getByText(/네트워크 오류가 발생했습니다/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /오류 메시지 닫기/i })).toBeInTheDocument();
      
      // 모킹 상태 초기화
      mockUseTodos.error = null;
    });

    it('에러 닫기 버튼이 작동한다', async () => {
      const user = userEvent.setup();
      
      // 에러 상태로 모킹 변경
      mockUseTodos.error = '네트워크 오류가 발생했습니다';
      
      render(<TodoForm />);
      
      const closeButton = screen.getByRole('button', { name: /오류 메시지 닫기/i });
      await user.click(closeButton);
      
      expect(mockClearError).toHaveBeenCalled();
      
      // 모킹 상태 초기화
      mockUseTodos.error = null;
    });

    it('로딩 중일 때 입력 필드와 버튼이 비활성화된다', () => {
      // 로딩 상태로 모킹 변경
      mockUseTodos.isLoading = true;
      
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/i);
      const addButton = screen.getByRole('button', { name: /할 일 추가/i });
      
      expect(input).toBeDisabled();
      expect(addButton).toBeDisabled();
      
      // 모킹 상태 초기화
      mockUseTodos.isLoading = false;
    });
  });
}); 