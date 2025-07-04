import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../TodoList';
import { useTodos } from '@/hooks/useTodos';
import { Todo, TodoStats } from '@/lib/types';

// useTodos 훅 모킹
jest.mock('@/hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

// 테스트용 샘플 데이터
const mockTodos: Todo[] = [
  {
    id: '1',
    text: '첫 번째 할 일',
    completed: false,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    text: '두 번째 할 일',
    completed: true,
    createdAt: '2024-01-01T11:00:00Z'
  },
  {
    id: '3',
    text: '세 번째 할 일',
    completed: false,
    createdAt: '2024-01-01T12:00:00Z'
  }
];

const mockTodoStats: TodoStats = {
  total: 3,
  active: 2,
  completed: 1,
  completionPercentage: 33
};

const defaultMockReturn = {
  todos: mockTodos,
  filter: 'all' as const,
  filteredTodos: mockTodos,
  todoStats: mockTodoStats,
  toggleTodo: jest.fn(),
  deleteTodo: jest.fn(),
  editTodo: jest.fn(),
  addTodo: jest.fn(),
  setFilter: jest.fn(),
  clearCompleted: jest.fn(),
  error: null,
  clearError: jest.fn(),
  isLoading: false
};

describe('TodoList 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodos.mockReturnValue(defaultMockReturn);
  });

  describe('렌더링', () => {
    it('할 일 목록을 정상적으로 렌더링한다', () => {
      render(<TodoList />);
      
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument();
      expect(screen.getByText('두 번째 할 일')).toBeInTheDocument();
      expect(screen.getByText('세 번째 할 일')).toBeInTheDocument();
    });

    it('통계 정보를 정확히 표시한다', () => {
      render(<TodoList />);
      
      // 분리된 텍스트를 위해 클래스 기반으로 요소 찾기
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('개의 할 일')).toBeInTheDocument();
      
      // 개별 통계 span 요소들 확인
      expect(screen.getByText(/전체:\s*3/)).toBeInTheDocument();
      expect(screen.getByText(/진행 중:\s*2/)).toBeInTheDocument();
      expect(screen.getByText(/완료:\s*1/)).toBeInTheDocument();
      expect(screen.getByText(/33\s*% 완료/)).toBeInTheDocument();
    });

    it('진행률 바를 표시한다', () => {
      render(<TodoList />);
      
      const progressBar = document.querySelector('[style*="width: 33%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('할 일 목록에 적절한 ARIA 레이블을 설정한다', () => {
      render(<TodoList />);
      
      expect(screen.getByRole('list', { name: '할 일 목록' })).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 스켈레톤을 표시한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true
      });

      render(<TodoList />);
      
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('에러가 있을 때 에러 메시지를 표시한다', () => {
      const errorMessage = '네트워크 오류가 발생했습니다';
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        error: errorMessage
      });

      render(<TodoList />);
      
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('할 일이 없을 때 빈 상태 메시지를 표시한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todos: [],
        filteredTodos: [],
        todoStats: { total: 0, active: 0, completed: 0, completionPercentage: 0 }
      });

      render(<TodoList />);
      
      expect(screen.getByText('할 일이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 할 일을 추가해보세요!')).toBeInTheDocument();
    });

    it('필터링된 결과가 없을 때 적절한 메시지를 표시한다 - active', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'active',
        filteredTodos: [],
        todoStats: { total: 2, active: 0, completed: 2, completionPercentage: 100 }
      });

      render(<TodoList />);
      
      expect(screen.getByText('진행 중인 할 일이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('모든 할 일을 완료했네요! 🎉')).toBeInTheDocument();
    });

    it('필터링된 결과가 없을 때 적절한 메시지를 표시한다 - completed', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'completed',
        filteredTodos: [],
        todoStats: { total: 2, active: 2, completed: 0, completionPercentage: 0 }
      });

      render(<TodoList />);
      
      expect(screen.getByText('완료된 할 일이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('할 일을 완료해보세요!')).toBeInTheDocument();
    });
  });

  describe('필터 표시', () => {
    it('active 필터가 적용되었을 때 필터 배지를 표시한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'active',
        filteredTodos: mockTodos.filter(todo => !todo.completed)
      });

      render(<TodoList />);
      
      expect(screen.getByText('진행 중')).toBeInTheDocument();
    });

    it('completed 필터가 적용되었을 때 필터 배지를 표시한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'completed',
        filteredTodos: mockTodos.filter(todo => todo.completed)
      });

      render(<TodoList />);
      
      expect(screen.getByText('완료됨')).toBeInTheDocument();
    });
  });

  describe('많은 항목 표시', () => {
    it('10개 이상의 항목이 있을 때 필터된 개수를 표시한다', () => {
      const manyTodos = Array.from({ length: 15 }, (_, i) => ({
        id: String(i + 1),
        text: `할 일 ${i + 1}`,
        completed: false,
        createdAt: '2024-01-01T10:00:00Z'
      }));

      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todos: manyTodos,
        filteredTodos: manyTodos,
        todoStats: { total: 15, active: 15, completed: 0, completionPercentage: 0 }
      });

      render(<TodoList />);
      
      // 통계 정보가 올바르게 표시되는지 확인
      expect(screen.getByText('개의 할 일')).toBeInTheDocument();
      expect(screen.getByText(/전체:\s*15/)).toBeInTheDocument();
      expect(screen.getByText(/진행 중:\s*15/)).toBeInTheDocument();
      expect(screen.getByText(/완료:\s*0/)).toBeInTheDocument();
      
      // 할 일 항목들이 실제로 렌더링되는지 확인 (처음과 마지막)
      expect(screen.getByText('할 일 1')).toBeInTheDocument();
      expect(screen.getByText('할 일 15')).toBeInTheDocument();
      
      // 15개의 할 일 항목이 모두 렌더링되는지 확인
      const todoItems = screen.getAllByRole('listitem');
      expect(todoItems).toHaveLength(15);
    });
  });

  describe('애니메이션', () => {
    it('할 일 항목들에 페이드인 애니메이션 클래스가 적용된다', () => {
      render(<TodoList />);
      
      const animatedElements = document.querySelectorAll('.animate-fade-in');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('접근성', () => {
    it('할 일 목록이 적절한 role과 aria-label을 가진다', () => {
      render(<TodoList />);
      
      expect(screen.getByRole('list', { name: '할 일 목록' })).toBeInTheDocument();
    });
  });

  describe('커스텀 className', () => {
    it('전달된 className을 적용한다', () => {
      const { container } = render(<TodoList className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
}); 