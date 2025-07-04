import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';

// useTodos 훅 모킹
jest.mock('@/hooks/useTodos', () => ({
  useTodos: jest.fn(() => ({
    todos: [
      {
        id: '1',
        text: 'Test Todo 1',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        text: 'Test Todo 2',
        completed: true,
        createdAt: '2024-01-01T11:00:00Z'
      }
    ],
    filter: 'all',
    filteredTodos: [
      {
        id: '1',
        text: 'Test Todo 1',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        text: 'Test Todo 2',
        completed: true,
        createdAt: '2024-01-01T11:00:00Z'
      }
    ],
    todoStats: { total: 2, active: 1, completed: 1, completionPercentage: 50 },
    toggleTodo: jest.fn(),
    deleteTodo: jest.fn(),
    editTodo: jest.fn(),
    addTodo: jest.fn(),
    setFilter: jest.fn(),
    clearCompleted: jest.fn(),
    error: null,
    clearError: jest.fn(),
    isLoading: false
  }))
}));

describe('Home Page Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('메인 페이지를 정상적으로 렌더링한다', () => {
      render(<Home />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Simple Todo App')).toBeInTheDocument();
      expect(screen.getByText('Organize your life with ease. Create, manage, and track your daily tasks efficiently.')).toBeInTheDocument();
    });

    it('모든 주요 컴포넌트들이 렌더링된다', () => {
      render(<Home />);
      
      // 헤더 섹션
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Simple Todo App');
      
      // 폼 컴포넌트 (input과 button으로 확인)
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /추가/i })).toBeInTheDocument();
      
      // 필터 컴포넌트 (필터 버튼들로 확인)
      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('진행 중')).toBeInTheDocument();
      expect(screen.getByText('완료됨')).toBeInTheDocument();
      
      // 할 일 목록 (할 일 항목들로 확인)
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });

    it('푸터를 렌더링한다', () => {
      render(<Home />);
      
      expect(screen.getByText('Built with Next.js, TypeScript, and Tailwind CSS')).toBeInTheDocument();
    });
  });

  describe('반응형 레이아웃', () => {
    it('메인 컨테이너에 적절한 반응형 클래스를 적용한다', () => {
      const { container } = render(<Home />);
      
      const mainContainer = container.querySelector('main');
      expect(mainContainer).toHaveClass('min-h-screen');
      
      const contentContainer = container.querySelector('.container');
      expect(contentContainer).toHaveClass('mx-auto', 'px-4', 'py-8', 'max-w-4xl');
    });

    it('그리드 레이아웃 클래스가 적용된다', () => {
      const { container } = render(<Home />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-8', 'lg:grid-cols-3');
    });

    it('컬럼 스팬 클래스가 올바르게 적용된다', () => {
      const { container } = render(<Home />);
      
      const leftColumn = container.querySelector('.lg\\:col-span-1');
      const rightColumn = container.querySelector('.lg\\:col-span-2');
      
      expect(leftColumn).toBeInTheDocument();
      expect(rightColumn).toBeInTheDocument();
    });
  });

  describe('스타일링', () => {
    it('배경 그라데이션이 적용된다', () => {
      const { container } = render(<Home />);
      
      const main = container.querySelector('main');
      expect(main).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-indigo-100');
    });

    it('헤더 제목에 그라데이션 텍스트가 적용된다', () => {
      render(<Home />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'bg-clip-text', 'text-transparent');
    });

    it('헤더 설명 텍스트가 올바르게 스타일링된다', () => {
      render(<Home />);
      
      const description = screen.getByText('Organize your life with ease. Create, manage, and track your daily tasks efficiently.');
      expect(description).toHaveClass('text-gray-600', 'text-lg', 'max-w-md', 'mx-auto', 'leading-relaxed');
    });
  });

  describe('컴포넌트 배치', () => {
    it('왼쪽 컬럼에 폼과 필터가 배치된다', () => {
      const { container } = render(<Home />);
      
      const leftColumn = container.querySelector('.lg\\:col-span-1');
      
      // 폼 컴포넌트 확인 (input 요소로)
      const formInput = leftColumn?.querySelector('input[type="text"]');
      expect(formInput).toBeInTheDocument();
      
      // 필터 컴포넌트 확인 (필터 텍스트로)
      expect(leftColumn).toHaveTextContent('전체');
      expect(leftColumn).toHaveTextContent('진행 중');
      expect(leftColumn).toHaveTextContent('완료됨');
    });

    it('오른쪽 컬럼에 할 일 목록이 배치된다', () => {
      const { container } = render(<Home />);
      
      const rightColumn = container.querySelector('.lg\\:col-span-2');
      
      // 할 일 목록 확인
      expect(rightColumn).toHaveTextContent('Test Todo 1');
      expect(rightColumn).toHaveTextContent('Test Todo 2');
    });
  });

  describe('접근성', () => {
    it('적절한 시맨틱 HTML 구조를 사용한다', () => {
      render(<Home />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('모든 인터랙티브 요소들이 접근 가능하다', () => {
      render(<Home />);
      
      // 폼 요소들
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /추가/i })).toBeInTheDocument();
      
      // 필터 버튼들
      const filterButtons = screen.getAllByRole('button');
      expect(filterButtons.length).toBeGreaterThan(3); // 폼 버튼 + 필터 버튼들 + 할 일 버튼들
    });
  });

  describe('컴포넌트 통합', () => {
    it('모든 컴포넌트가 useTodos 훅을 통해 통합된다', () => {
      render(<Home />);
      
      // 각 컴포넌트가 독립적으로 렌더링되는지 확인
      // (Props 전달 없이도 모든 기능이 작동)
      
      // TodoForm
      expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
      
      // TodoFilter
      expect(screen.getByText('필터')).toBeInTheDocument();
      
      // TodoList
      expect(screen.getByRole('list', { name: '할 일 목록' })).toBeInTheDocument();
    });
  });

  describe('레이아웃 구조', () => {
    it('올바른 중첩 구조를 가진다', () => {
      const { container } = render(<Home />);
      
      // main > container > header + grid + footer 구조
      const main = container.querySelector('main');
      const containerDiv = main?.querySelector('.container');
      const header = containerDiv?.querySelector('.text-center.mb-12');
      const grid = containerDiv?.querySelector('.grid');
      const footer = containerDiv?.querySelector('footer');
      
      expect(main).toBeInTheDocument();
      expect(containerDiv).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(grid).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });

    it('적절한 간격과 여백을 적용한다', () => {
      const { container } = render(<Home />);
      
      // 헤더 여백
      const header = container.querySelector('.text-center.mb-12');
      expect(header).toHaveClass('mb-12');
      
      // 그리드 간격
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-8');
      
      // 푸터 여백
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('mt-16', 'pt-8');
    });
  });
}); 