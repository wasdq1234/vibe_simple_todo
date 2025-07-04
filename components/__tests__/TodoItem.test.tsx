import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TodoItem from '../TodoItem';
import { Todo } from '@/lib/types';

// formatDate와 getRelativeTime 함수 모킹
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn().mockReturnValue('2024년 1월 1일 오전 10:00'),
  getRelativeTime: jest.fn().mockReturnValue('3시간 전')
}));

const mockTodo: Todo = {
  id: '1',
  text: '테스트 할 일',
  completed: false,
  createdAt: '2024-01-01T10:00:00Z'
};

const completedTodo: Todo = {
  id: '2',
  text: '완료된 할 일',
  completed: true,
  createdAt: '2024-01-01T09:00:00Z'
};

const defaultProps = {
  todo: mockTodo,
  onToggle: jest.fn(),
  onDelete: jest.fn(),
  onEdit: jest.fn()
};

// window.confirm 모킹
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
});

describe('TodoItem 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  describe('렌더링', () => {
    it('할 일 내용을 정상적으로 렌더링한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
    });

    it('생성 날짜를 상대적 시간으로 표시한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      expect(screen.getByText('3시간 전')).toBeInTheDocument();
    });

    it('적절한 ARIA 속성을 설정한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      const listItem = screen.getByRole('listitem');
      expect(listItem).toHaveAttribute('aria-label', '할 일: 테스트 할 일');
      
      const checkbox = screen.getByRole('button', { pressed: false });
      expect(checkbox).toHaveAttribute('aria-label', '테스트 할 일를 완료로 표시');
    });

    it('완료된 할 일은 적절한 스타일을 적용한다', () => {
      render(<TodoItem {...defaultProps} todo={completedTodo} />);
      
      const todoText = screen.getByText('완료된 할 일');
      expect(todoText).toHaveClass('line-through', 'text-gray-500');
      
      const completeBadge = screen.getByText('✓ 완료');
      expect(completeBadge).toBeInTheDocument();
    });

    it('완료된 할 일의 체크박스는 체크 표시를 보여준다', () => {
      render(<TodoItem {...defaultProps} todo={completedTodo} />);
      
      const checkbox = screen.getByRole('button', { pressed: true });
      expect(checkbox).toHaveClass('bg-green-500', 'border-green-500');
    });
  });

  describe('체크박스 상호작용', () => {
    it('체크박스 클릭 시 onToggle을 호출한다', () => {
      const mockOnToggle = jest.fn();
      render(<TodoItem {...defaultProps} onToggle={mockOnToggle} />);
      
      const checkbox = screen.getByRole('button', { pressed: false });
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledWith('1');
    });

    it('완료된 할 일의 체크박스 클릭 시에도 onToggle을 호출한다', () => {
      const mockOnToggle = jest.fn();
      render(<TodoItem {...defaultProps} todo={completedTodo} onToggle={mockOnToggle} />);
      
      const checkbox = screen.getByRole('button', { pressed: true });
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledWith('2');
    });
  });

  describe('편집 기능', () => {
    it('편집 버튼 클릭 시 편집 모드로 전환된다', async () => {
      render(<TodoItem {...defaultProps} />);
      
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      expect(screen.getByDisplayValue('테스트 할 일')).toBeInTheDocument();
      expect(screen.getByText('저장')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });

    it('더블클릭으로 편집 모드로 전환된다', () => {
      render(<TodoItem {...defaultProps} />);
      
      const todoText = screen.getByText('테스트 할 일');
      fireEvent.doubleClick(todoText);
      
      expect(screen.getByDisplayValue('테스트 할 일')).toBeInTheDocument();
    });

    it('완료된 할 일은 더블클릭으로 편집 모드로 전환되지 않는다', () => {
      render(<TodoItem {...defaultProps} todo={completedTodo} />);
      
      const todoText = screen.getByText('완료된 할 일');
      fireEvent.doubleClick(todoText);
      
      expect(screen.queryByDisplayValue('완료된 할 일')).not.toBeInTheDocument();
    });

    it('편집 모드에서 텍스트를 변경하고 저장할 수 있다', async () => {
      const mockOnEdit = jest.fn();
      render(<TodoItem {...defaultProps} onEdit={mockOnEdit} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 텍스트 변경
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: '수정된 할 일' } });
      
      // 저장 버튼 클릭
      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnEdit).toHaveBeenCalledWith('1', '수정된 할 일');
      });
    });

    it('편집 모드에서 Enter 키로 저장할 수 있다', async () => {
      const mockOnEdit = jest.fn();
      render(<TodoItem {...defaultProps} onEdit={mockOnEdit} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 텍스트 변경 후 Enter 키
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: '엔터로 저장' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockOnEdit).toHaveBeenCalledWith('1', '엔터로 저장');
      });
    });

    it('편집 모드에서 Escape 키로 취소할 수 있다', () => {
      const mockOnEdit = jest.fn();
      render(<TodoItem {...defaultProps} onEdit={mockOnEdit} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 텍스트 변경 후 Escape 키
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: '취소될 텍스트' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      
      // 원본 텍스트로 복원되고 편집 모드 종료
      expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('취소될 텍스트')).not.toBeInTheDocument();
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it('편집 모드에서 취소 버튼으로 취소할 수 있다', () => {
      const mockOnEdit = jest.fn();
      render(<TodoItem {...defaultProps} onEdit={mockOnEdit} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 텍스트 변경 후 취소 버튼 클릭
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: '취소될 텍스트' } });
      
      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);
      
      // 원본 텍스트로 복원되고 편집 모드 종료
      expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it('편집 모드에서 빈 텍스트로 저장하면 취소된다', () => {
      const mockOnEdit = jest.fn();
      render(<TodoItem {...defaultProps} onEdit={mockOnEdit} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 텍스트를 빈 문자열로 변경 후 저장
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: '   ' } }); // 공백만
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
    });

    it('편집 모드에서 문자수 카운터를 표시한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      expect(screen.getByText('Enter: 저장, Esc: 취소')).toBeInTheDocument();
      expect(screen.getByText('7/500')).toBeInTheDocument(); // "테스트 할 일"의 글자수 (공백 포함)
    });

    it('편집 모드에서 450자 초과 시 경고 스타일을 적용한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 긴 텍스트 입력
      const longText = 'a'.repeat(460);
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: longText } });
      
      const counter = screen.getByText('460/500');
      expect(counter).toHaveClass('text-orange-600', 'font-medium');
    });

    it('onEdit이 없으면 편집 버튼을 표시하지 않는다', () => {
      render(<TodoItem {...defaultProps} onEdit={undefined} />);
      
      expect(screen.queryByTitle('편집')).not.toBeInTheDocument();
    });

    it('완료된 할 일은 편집 버튼을 표시하지 않는다', () => {
      render(<TodoItem {...defaultProps} todo={completedTodo} />);
      
      expect(screen.queryByTitle('편집')).not.toBeInTheDocument();
    });
  });

  describe('삭제 기능', () => {
    it('삭제 버튼 클릭 시 확인 다이얼로그를 표시한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      const deleteButton = screen.getByTitle('삭제');
      fireEvent.click(deleteButton);
      
      expect(mockConfirm).toHaveBeenCalledWith('"테스트 할 일" 할 일을 정말 삭제하시겠습니까?');
    });

    it('삭제 확인 시 onDelete를 호출한다', () => {
      const mockOnDelete = jest.fn();
      mockConfirm.mockReturnValue(true);
      
      render(<TodoItem {...defaultProps} onDelete={mockOnDelete} />);
      
      const deleteButton = screen.getByTitle('삭제');
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('삭제 취소 시 onDelete를 호출하지 않는다', () => {
      const mockOnDelete = jest.fn();
      mockConfirm.mockReturnValue(false);
      
      render(<TodoItem {...defaultProps} onDelete={mockOnDelete} />);
      
      const deleteButton = screen.getByTitle('삭제');
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('날짜 표시', () => {
    it('날짜 버튼 클릭 시 형식을 토글한다', () => {
      render(<TodoItem {...defaultProps} />);
      
      const dateButton = screen.getByText('3시간 전');
      fireEvent.click(dateButton);
      
      expect(screen.getByText('2024년 1월 1일 오전 10:00')).toBeInTheDocument();
      
      // 다시 클릭하면 원래 형식으로
      fireEvent.click(screen.getByText('2024년 1월 1일 오전 10:00'));
      expect(screen.getByText('3시간 전')).toBeInTheDocument();
    });
  });

  describe('마우스 호버 효과', () => {
    it('마우스 호버 시 편집/삭제 버튼이 표시된다', () => {
      const { container } = render(<TodoItem {...defaultProps} />);
      
      const todoItem = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(todoItem);
      
      const editButton = screen.getByTitle('편집');
      const deleteButton = screen.getByTitle('삭제');
      
      expect(editButton).toHaveClass('group-hover:opacity-100');
      expect(deleteButton).toHaveClass('group-hover:opacity-100');
    });
  });

  describe('에러 처리', () => {
    it('편집 중 에러 발생 시 원본 텍스트로 복원한다', async () => {
      const mockOnEdit = jest.fn().mockRejectedValue(new Error('Edit failed'));
      console.error = jest.fn(); // console.error 모킹
      
      render(<TodoItem {...defaultProps} onEdit={mockOnEdit} />);
      
      // 편집 모드 진입
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      // 텍스트 변경 후 저장
      const input = screen.getByDisplayValue('테스트 할 일');
      fireEvent.change(input, { target: { value: '에러 발생할 텍스트' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('테스트 할 일')).toBeInTheDocument();
      });
    });

    it('토글 중 에러 발생 시 콘솔에 로그를 출력한다', async () => {
      const mockOnToggle = jest.fn().mockRejectedValue(new Error('Toggle failed'));
      console.error = jest.fn();
      
      render(<TodoItem {...defaultProps} onToggle={mockOnToggle} />);
      
      const checkbox = screen.getByRole('button', { pressed: false });
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to toggle todo:', expect.any(Error));
      });
    });

    it('삭제 중 에러 발생 시 deleting 상태를 false로 복원한다', async () => {
      const mockOnDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
      console.error = jest.fn();
      
      render(<TodoItem {...defaultProps} onDelete={mockOnDelete} />);
      
      const deleteButton = screen.getByTitle('삭제');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to delete todo:', expect.any(Error));
      });
    });
  });

  describe('접근성', () => {
    it('키보드 탐색이 가능하다', () => {
      render(<TodoItem {...defaultProps} />);
      
      const checkbox = screen.getByRole('button', { pressed: false });
      const editButton = screen.getByTitle('편집');
      const deleteButton = screen.getByTitle('삭제');
      
      // 버튼들이 포커스 가능한지 확인
      expect(checkbox).toBeInTheDocument();
      expect(editButton).toHaveClass('focus:ring-2');
      expect(deleteButton).toHaveClass('focus:ring-2');
    });

    it('편집 모드에서 입력 필드에 자동 포커스된다', () => {
      render(<TodoItem {...defaultProps} />);
      
      const editButton = screen.getByTitle('편집');
      fireEvent.click(editButton);
      
      const input = screen.getByDisplayValue('테스트 할 일');
      expect(input).toHaveFocus();
    });
  });
}); 