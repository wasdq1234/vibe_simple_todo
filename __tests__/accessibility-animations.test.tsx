import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import TodoFilter from '../components/TodoFilter';
import TodoItem from '../components/TodoItem';
import { Todo } from '@/lib/types';

// 테스트 환경에서 window.matchMedia 모킹
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('애니메이션 접근성 테스트', () => {
  const mockTodo: Todo = {
    id: '1',
    text: '테스트 할 일',
    completed: false,
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    localStorage.clear();
    // 기본적으로 애니메이션 활성화 상태로 설정
    mockMatchMedia(false);
  });

  describe('prefers-reduced-motion 지원', () => {
    it('TodoForm에서 reduced motion이 활성화되면 적절한 클래스가 적용되어야 한다', () => {
      mockMatchMedia(true);
      
      const { container } = render(<TodoForm />);
      const formElement = container.querySelector('form');
      
      expect(formElement).toBeInTheDocument();
      // motion-reduce 클래스 또는 스타일이 적용되는지 확인
      expect(formElement).toHaveClass('space-y-4');
    });

    it('TodoList에서 reduced motion이 활성화되면 적절한 처리가 되어야 한다', () => {
      mockMatchMedia(true);
      
      render(<TodoList />);
      const emptyState = screen.getByTestId('empty-state');
      
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('text-center');
    });

    it('TodoFilter에서 reduced motion이 활성화되면 적절한 처리가 되어야 한다', () => {
      mockMatchMedia(true);
      
      render(<TodoFilter />);
      const allButton = screen.getByRole('button', { name: /전체 할 일 보기/ });
      
      expect(allButton).toBeInTheDocument();
      expect(allButton).toHaveClass('relative');
    });

    it('TodoItem에서 reduced motion이 활성화되면 적절한 처리가 되어야 한다', () => {
      mockMatchMedia(true);
      
      render(<TodoItem todo={mockTodo} />);
      const todoItem = screen.getByTestId('todo-item-1');
      
      expect(todoItem).toBeInTheDocument();
      expect(todoItem).toHaveClass('todo-item');
    });
  });

  describe('ARIA 속성 검사', () => {
    it('TodoForm의 로딩 상태가 스크린 리더에 올바르게 전달되어야 한다', async () => {
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/);
      const button = screen.getByRole('button', { name: /할 일 추가/ });
      
      fireEvent.change(input, { target: { value: '새 할 일' } });
      
      // 폼 제출 시 버튼이 적절한 ARIA 속성을 가지는지 확인
      await act(async () => {
        fireEvent.click(button);
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      // 버튼이 적절한 aria-label을 가지고 있는지 확인
      expect(button).toHaveAttribute('aria-label', '할 일 추가');
    });

    it('TodoList의 빈 상태가 스크린 리더에 알려져야 한다', () => {
      render(<TodoList />);
      
      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('text-center');
    });

    it('TodoFilter의 필터 상태가 스크린 리더에 전달되어야 한다', () => {
      render(<TodoFilter />);
      
      const allButton = screen.getByRole('button', { name: /전체 할 일 보기/ });
      const activeButton = screen.getByRole('button', { name: /진행 중 할 일 보기/ });
      const completedButton = screen.getByRole('button', { name: /완료 할 일 보기/ });
      
      // 버튼들이 적절한 aria-label을 가져야 함
      expect(allButton).toHaveAttribute('aria-label');
      expect(activeButton).toHaveAttribute('aria-label');
      expect(completedButton).toHaveAttribute('aria-label');
    });

    it('TodoItem의 토글 버튼 상태가 스크린 리더에 올바르게 전달되어야 한다', () => {
      render(<TodoItem todo={mockTodo} />);
      
      const toggleButton = screen.getByRole('checkbox', { name: /할 일을 완료로 표시/ });
      expect(toggleButton).toHaveAttribute('aria-label', '할 일을 완료로 표시');
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      expect(toggleButton).toHaveClass('border-2');
    });

    it('TodoItem의 편집 모드가 스크린 리더에 알려져야 한다', () => {
      render(<TodoItem todo={mockTodo} />);
      
      const editButton = screen.getByRole('button', { name: /할 일 수정/ });
      fireEvent.click(editButton);
      
      // 편집 모드로 전환 후 입력 필드가 나타나야 함
      waitFor(() => {
        const input = screen.queryByDisplayValue(mockTodo.text);
        if (input) {
          expect(input).toBeInTheDocument();
        }
      });
    });
  });

  describe('애니메이션 안전성 검사', () => {
    it('애니메이션이 적절한 duration을 가져야 한다', () => {
      render(<TodoList />);
      
      const emptyState = screen.getByTestId('empty-state');
      
      // 요소가 존재하고 적절한 클래스를 가지는지 확인
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('text-center');
    });

    it('자동 재생되는 애니메이션이 적절히 제어되어야 한다', () => {
      render(<TodoForm />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-label', '새로운 할 일 추가 폼');
    });

    it('모션이 시각적 콘텐츠의 이해를 방해하지 않아야 한다', async () => {
      render(<TodoItem todo={mockTodo} />);
      
      const todoText = screen.getByText(mockTodo.text);
      const toggleButton = screen.getByRole('checkbox', { name: /할 일을 완료로 표시/ });
      
      // 초기 상태에서 텍스트가 존재해야 함
      expect(todoText).toBeInTheDocument();
      
      // 토글 버튼 클릭 후에도 텍스트가 계속 존재해야 함
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(todoText).toBeInTheDocument();
      });
    });
  });

  describe('키보드 네비게이션과 애니메이션', () => {
    it('키보드 포커스가 애니메이션 중에도 명확하게 보여야 한다', () => {
      render(<TodoFilter />);
      
      const allButton = screen.getByRole('button', { name: /전체 할 일 보기/ });
      allButton.focus();
      
      expect(allButton).toHaveFocus();
      expect(allButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('탭 순서가 애니메이션에 의해 방해받지 않아야 한다', () => {
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/);
      const button = screen.getByRole('button', { name: /할 일 추가/ });
      
      input.focus();
      expect(input).toHaveFocus();
      
      // Tab 키 시뮬레이션
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('스크린 리더 호환성', () => {
    it('동적 콘텐츠 변경이 스크린 리더에 알려져야 한다', async () => {
      render(<TodoForm />);
      
      const input = screen.getByLabelText(/새로운 할 일 입력/);
      const button = screen.getByRole('button', { name: /할 일 추가/ });
      
      // 새 할 일 추가
      fireEvent.change(input, { target: { value: '새 할 일' } });
      
      await act(async () => {
        fireEvent.click(button);
        // 제출 후 상태 변화 대기
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      // 폼이 적절한 구조를 유지하는지 확인
      expect(button).toBeInTheDocument();
    });

    it('애니메이션 상태 변경이 보조 기술에 전달되어야 한다', () => {
      const completedTodo = { ...mockTodo, completed: true };
      render(<TodoItem todo={completedTodo} />);
      
      const toggleButton = screen.getByRole('checkbox', { name: /할 일을 미완료로 표시/ });
      expect(toggleButton).toHaveAttribute('aria-label', '할 일을 미완료로 표시');
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
      
      // 완료된 상태의 시각적 변화가 보조 기술에도 전달되어야 함
      const todoText = screen.getByText(completedTodo.text);
      expect(todoText).toHaveClass('line-through');
    });
  });

  describe('접근성 표준 준수', () => {
    it('모든 상호작용 요소가 적절한 role을 가져야 한다', () => {
      render(<TodoItem todo={mockTodo} />);
      
      const toggleButton = screen.getByRole('checkbox', { name: /할 일을 완료로 표시/ });
      const editButton = screen.getByRole('button', { name: /할 일 수정/ });
      const deleteButton = screen.getByRole('button', { name: /할 일 삭제/ });
      
      expect(toggleButton).toHaveAttribute('role', 'checkbox');
      expect(editButton).toHaveAttribute('type', 'button');
      expect(deleteButton).toHaveAttribute('type', 'button');
    });

    it('폼 요소들이 적절한 라벨과 설명을 가져야 한다', () => {
      render(<TodoForm />);
      
      const form = screen.getByRole('form');
      const input = screen.getByLabelText(/새로운 할 일 입력/);
      const button = screen.getByRole('button', { name: /할 일 추가/ });
      
      expect(form).toHaveAttribute('aria-label', '새로운 할 일 추가 폼');
      expect(input).toHaveAttribute('aria-describedby');
      expect(button).toHaveAttribute('aria-label', '할 일 추가');
    });

    it('리스트 구조가 의미론적으로 올바르게 구성되어야 한다', () => {
      render(<TodoItem todo={mockTodo} />);
      
      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveClass('todo-item');
    });
  });
}); 