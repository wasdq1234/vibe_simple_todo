import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoFilterComponent from '../TodoFilter';
import { useTodos } from '@/hooks/useTodos';
import { TodoStats } from '@/lib/types';

// useTodos 훅 모킹
jest.mock('@/hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

const mockTodoStats: TodoStats = {
  total: 10,
  active: 6,
  completed: 4,
  completionPercentage: 40
};

const defaultMockReturn = {
  todos: [],
  filter: 'all' as const,
  filteredTodos: [],
  todoStats: mockTodoStats,
  setFilter: jest.fn(),
  clearCompleted: jest.fn(),
  toggleTodo: jest.fn(),
  deleteTodo: jest.fn(),
  editTodo: jest.fn(),
  addTodo: jest.fn(),
  error: null,
  clearError: jest.fn(),
  isLoading: false
};

// window.confirm 모킹
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
});

describe('TodoFilter 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodos.mockReturnValue(defaultMockReturn);
    mockConfirm.mockReturnValue(true);
  });

  describe('렌더링', () => {
    it('필터 컴포넌트를 정상적으로 렌더링한다', () => {
      render(<TodoFilterComponent />);
      
      expect(screen.getByText('필터')).toBeInTheDocument();
      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('진행 중')).toBeInTheDocument();
      expect(screen.getByText('완료됨')).toBeInTheDocument();
    });

    it('각 필터 버튼에 적절한 아이콘을 표시한다', () => {
      render(<TodoFilterComponent />);
      
      expect(screen.getByText('📋')).toBeInTheDocument(); // 전체
      expect(screen.getByText('⏳')).toBeInTheDocument(); // 진행 중
      expect(screen.getByText('✅')).toBeInTheDocument(); // 완료됨
    });

    it('각 필터에 해당하는 개수를 표시한다', () => {
      render(<TodoFilterComponent />);
      
      // 각 필터 버튼을 role과 name으로 찾아서 개수 확인
      expect(screen.getByRole('button', { name: /모든 할 일 보기.*10개/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /완료되지 않은 할 일.*6개/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /완료된 할 일.*4개/ })).toBeInTheDocument();
    });

    it('통계 정보를 표시한다', () => {
      render(<TodoFilterComponent />);
      
      expect(screen.getByText('전체:')).toBeInTheDocument();
      expect(screen.getByText('완료율:')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
      
      // 통계 영역의 10을 확인
      const statsArea = screen.getByText('전체:').closest('div');
      expect(statsArea).toHaveTextContent('10');
    });

    it('진행률 바를 표시한다', () => {
      render(<TodoFilterComponent />);
      
      const progressBar = document.querySelector('[style*="width: 40%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('진행률 표시 영역을 렌더링한다', () => {
      render(<TodoFilterComponent />);
      
      expect(screen.getByText('진행률')).toBeInTheDocument();
      expect(screen.getByText('4/10')).toBeInTheDocument();
    });
  });

  describe('필터 상호작용', () => {
    it('전체 필터 버튼을 클릭하면 setFilter를 호출한다', () => {
      const mockSetFilter = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter
      });

      render(<TodoFilterComponent />);
      
      const allButton = screen.getByRole('button', { name: /모든 할 일 보기.*10개/ });
      fireEvent.click(allButton);
      
      expect(mockSetFilter).toHaveBeenCalledWith('all');
    });

    it('진행 중 필터 버튼을 클릭하면 setFilter를 호출한다', () => {
      const mockSetFilter = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter
      });

      render(<TodoFilterComponent />);
      
      const activeButton = screen.getByRole('button', { name: /완료되지 않은 할 일.*6개/ });
      fireEvent.click(activeButton);
      
      expect(mockSetFilter).toHaveBeenCalledWith('active');
    });

    it('완료됨 필터 버튼을 클릭하면 setFilter를 호출한다', () => {
      const mockSetFilter = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter
      });

      render(<TodoFilterComponent />);
      
      const completedButton = screen.getByRole('button', { name: /완료된 할 일.*4개/ });
      fireEvent.click(completedButton);
      
      expect(mockSetFilter).toHaveBeenCalledWith('completed');
    });
  });

  describe('활성 필터 표시', () => {
    it('현재 선택된 필터에 활성 스타일을 적용한다 - all', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'all'
      });

      render(<TodoFilterComponent />);
      
      const allButton = screen.getByRole('button', { name: /모든 할 일 보기.*10개/ });
      expect(allButton).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700');
      expect(allButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('현재 선택된 필터에 활성 스타일을 적용한다 - active', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'active'
      });

      render(<TodoFilterComponent />);
      
      const activeButton = screen.getByRole('button', { name: /완료되지 않은 할 일.*6개/ });
      expect(activeButton).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700');
      expect(activeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('현재 선택된 필터에 활성 스타일을 적용한다 - completed', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'completed'
      });

      render(<TodoFilterComponent />);
      
      const completedButton = screen.getByRole('button', { name: /완료된 할 일.*4개/ });
      expect(completedButton).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700');
      expect(completedButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('비활성 필터는 기본 스타일을 적용한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'active'
      });

      render(<TodoFilterComponent />);
      
      const allButton = screen.getByRole('button', { name: /모든 할 일 보기.*10개/ });
      expect(allButton).toHaveClass('bg-gray-50', 'border-transparent', 'text-gray-600');
      expect(allButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('완료된 항목 정리', () => {
    it('완료된 할 일이 있을 때 정리 버튼을 표시한다', () => {
      render(<TodoFilterComponent />);
      
      expect(screen.getByRole('button', { name: '완료된 4개 할 일 삭제' })).toBeInTheDocument();
      expect(screen.getByText('완료됨 정리')).toBeInTheDocument();
    });

    it('완료된 할 일이 없을 때 정리 버튼을 표시하지 않는다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todoStats: { total: 5, active: 5, completed: 0, completionPercentage: 0 }
      });

      render(<TodoFilterComponent />);
      
      expect(screen.queryByText('완료됨 정리')).not.toBeInTheDocument();
    });

    it('정리 버튼 클릭 시 확인 다이얼로그를 표시한다', () => {
      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      fireEvent.click(clearButton);
      
      expect(mockConfirm).toHaveBeenCalledWith('완료된 4개의 할 일을 정말 삭제하시겠습니까?');
    });

    it('확인 후 clearCompleted를 호출한다', () => {
      const mockClearCompleted = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        clearCompleted: mockClearCompleted
      });
      mockConfirm.mockReturnValue(true);

      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      fireEvent.click(clearButton);
      
      expect(mockClearCompleted).toHaveBeenCalled();
    });

    it('취소 시 clearCompleted를 호출하지 않는다', () => {
      const mockClearCompleted = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        clearCompleted: mockClearCompleted
      });
      mockConfirm.mockReturnValue(false);

      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      fireEvent.click(clearButton);
      
      expect(mockClearCompleted).not.toHaveBeenCalled();
    });

    it('completed 필터에서 정리한 후 active 필터로 전환한다', () => {
      const mockSetFilter = jest.fn();
      const mockClearCompleted = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'completed',
        setFilter: mockSetFilter,
        clearCompleted: mockClearCompleted
      });
      mockConfirm.mockReturnValue(true);

      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      fireEvent.click(clearButton);
      
      expect(mockClearCompleted).toHaveBeenCalled();
      expect(mockSetFilter).toHaveBeenCalledWith('active');
    });

    it('all 필터에서 정리해도 필터를 변경하지 않는다', () => {
      const mockSetFilter = jest.fn();
      const mockClearCompleted = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'all',
        setFilter: mockSetFilter,
        clearCompleted: mockClearCompleted
      });
      mockConfirm.mockReturnValue(true);

      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      fireEvent.click(clearButton);
      
      expect(mockClearCompleted).toHaveBeenCalled();
      expect(mockSetFilter).not.toHaveBeenCalled();
    });
  });

  describe('빈 상태', () => {
    it('할 일이 없을 때 진행률 바를 표시하지 않는다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todoStats: { total: 0, active: 0, completed: 0, completionPercentage: 0 }
      });

      render(<TodoFilterComponent />);
      
      expect(screen.queryByText('진행률')).not.toBeInTheDocument();
      expect(screen.queryByText('0/0')).not.toBeInTheDocument();
    });

    it('할 일이 없을 때도 필터 버튼들은 표시한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todoStats: { total: 0, active: 0, completed: 0, completionPercentage: 0 }
      });

      render(<TodoFilterComponent />);
      
      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('진행 중')).toBeInTheDocument();
      expect(screen.getByText('완료됨')).toBeInTheDocument();
      
      // 필터 버튼들의 개수가 0으로 표시 (배지만 선택)
      const filterButtons = screen.getAllByRole('button');
      const filterZeroCounts = filterButtons.slice(0, 3).map(button => {
        // 개수 배지만 선택 (마지막 span 요소)
        const spans = button.querySelectorAll('span');
        return spans[spans.length - 1]?.textContent;
      });
      expect(filterZeroCounts).toEqual(['0', '0', '0']);
    });
  });

  describe('접근성', () => {
    it('각 필터 버튼에 적절한 aria-label을 설정한다', () => {
      render(<TodoFilterComponent />);
      
      expect(screen.getByRole('button', { name: /모든 할 일 보기.*10개/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /완료되지 않은 할 일.*6개/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /완료된 할 일.*4개/ })).toBeInTheDocument();
    });

    it('각 필터 버튼에 title 속성을 설정한다', () => {
      render(<TodoFilterComponent />);
      
      const allButton = screen.getByRole('button', { name: /모든 할 일 보기.*10개/ });
      const activeButton = screen.getByRole('button', { name: /완료되지 않은 할 일.*6개/ });
      const completedButton = screen.getByRole('button', { name: /완료된 할 일.*4개/ });
      
      expect(allButton).toHaveAttribute('title', '모든 할 일 보기');
      expect(activeButton).toHaveAttribute('title', '완료되지 않은 할 일');
      expect(completedButton).toHaveAttribute('title', '완료된 할 일');
    });

    it('정리 버튼에 적절한 aria-label을 설정한다', () => {
      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      expect(clearButton).toHaveAttribute('aria-label', '완료된 4개 할 일 삭제');
    });

    it('정리 버튼에 포커스 링을 적용한다', () => {
      render(<TodoFilterComponent />);
      
      const clearButton = screen.getByRole('button', { name: '완료된 4개 할 일 삭제' });
      expect(clearButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-red-500', 'focus:ring-offset-2');
    });
  });

  describe('스타일링', () => {
    it('필터 버튼들에 호버 효과를 적용한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'completed' // all이 아닌 다른 필터를 활성화
      });

      render(<TodoFilterComponent />);
      
      const allButton = screen.getByRole('button', { name: /모든 할 일 보기.*10개/ });
      expect(allButton).toHaveClass('hover:bg-gray-100', 'hover:border-gray-200');
    });

    it('활성 필터에 시각적 강조 효과를 적용한다', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        filter: 'active'
      });

      render(<TodoFilterComponent />);
      
      const activeFilterRing = document.querySelector('.ring-2.ring-blue-500.ring-opacity-20');
      expect(activeFilterRing).toBeInTheDocument();
    });

    it('진행률 바에 그라데이션 효과를 적용한다', () => {
      render(<TodoFilterComponent />);
      
      const progressFill = document.querySelector('.bg-gradient-to-r.from-green-400.to-green-500');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('커스텀 className', () => {
    it('전달된 className을 적용한다', () => {
      const { container } = render(<TodoFilterComponent className="custom-filter-class" />);
      
      expect(container.firstChild).toHaveClass('custom-filter-class');
    });

    it('기본 className과 커스텀 className을 모두 적용한다', () => {
      const { container } = render(<TodoFilterComponent className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'custom-class');
    });
  });

  describe('완료율 계산', () => {
    it('완료율이 정확히 계산되어 표시된다', () => {
      const stats = { total: 8, active: 3, completed: 5, completionPercentage: 63 };
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todoStats: stats
      });

      render(<TodoFilterComponent />);
      
      expect(screen.getByText('63%')).toBeInTheDocument();
    });

    it('100% 완료 시 적절히 표시된다', () => {
      const stats = { total: 5, active: 0, completed: 5, completionPercentage: 100 };
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todoStats: stats
      });

      render(<TodoFilterComponent />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      
      const progressBar = document.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });
}); 