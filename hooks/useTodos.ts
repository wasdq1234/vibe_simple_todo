import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Todo, TodoFilter, UseTodosReturn, TodoStats } from '@/lib/types';
import { getTodosFromStorage, saveTodosToStorage } from '@/lib/storage';

/**
 * useTodos - Todo 상태 관리와 localStorage 동기화를 담당하는 커스텀 훅
 * 
 * @returns {UseTodosReturn} Todo 관리에 필요한 상태와 함수들
 */
export const useTodos = (): UseTodosReturn => {
  // 1. 상태 관리 - 첫 번째 서브태스크
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [isLoaded, setIsLoaded] = useState(false); // 초기 로드 상태
  const [isLoading, setIsLoading] = useState(false); // 비동기 작업 로딩 상태

  // 에러 상태 관리 (추후 에러 핸들링 서브태스크에서 활용)
  const [error, setError] = useState<string | null>(null);

  // 2. CRUD 작업 구현 - 두 번째 서브태스크
  
  // Todo 추가 함수 (에러 핸들링 강화)
  const addTodo = useCallback(async (text: string) => {
    // 입력 검증 (인라인으로 처리)
    if (!text || typeof text !== 'string') {
      setError('할 일 내용을 입력해주세요.');
      return;
    }
    
    if (text.trim().length === 0) {
      setError('할 일 내용은 공백일 수 없습니다.');
      return;
    }
    
    if (text.trim().length > 1000) {
      setError('할 일 내용은 1000자를 초과할 수 없습니다.');
      return;
    }
    
    setIsLoading(true);
    try {
      // 약간의 지연을 추가하여 실제 비동기 작업 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newTodo: Todo = {
        id: crypto.randomUUID(), // 고유 ID 생성
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setError(null); // 성공 시 에러 상태 초기화
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('할 일 추가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Todo 완료 상태 토글 함수 (에러 핸들링 강화)
  const toggleTodo = useCallback((id: string) => {
    try {
      setTodos(prevTodos => {
        // ID 검증을 prevTodos를 사용하여 수행
        const todoExists = prevTodos.some(todo => todo.id === id);
        if (!id || typeof id !== 'string' || !todoExists) {
          setError(!id ? '올바르지 않은 할 일 ID입니다.' : '존재하지 않는 할 일입니다.');
          return prevTodos;
        }
        
        setError(null);
        return prevTodos.map(todo =>
          todo.id === id 
            ? { ...todo, completed: !todo.completed }
            : todo
        );
      });
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      setError('할 일 상태 변경에 실패했습니다.');
    }
  }, []);

  // Todo 삭제 함수 (에러 핸들링 강화)
  const deleteTodo = useCallback((id: string) => {
    try {
      setTodos(prevTodos => {
        // ID 검증을 prevTodos를 사용하여 수행
        const todoExists = prevTodos.some(todo => todo.id === id);
        if (!id || typeof id !== 'string' || !todoExists) {
          setError(!id ? '올바르지 않은 할 일 ID입니다.' : '존재하지 않는 할 일입니다.');
          return prevTodos;
        }
        
        setError(null);
        return prevTodos.filter(todo => todo.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('할 일 삭제에 실패했습니다.');
    }
  }, []);

  // Todo 텍스트 편집 함수 (에러 핸들링 강화)
  const editTodo = useCallback((id: string, newText: string) => {
    try {
      setTodos(prevTodos => {
        // ID와 텍스트 검증
        const todoExists = prevTodos.some(todo => todo.id === id);
        if (!id || typeof id !== 'string' || !todoExists) {
          setError(!id ? '올바르지 않은 할 일 ID입니다.' : '존재하지 않는 할 일입니다.');
          return prevTodos;
        }
        
        if (!newText || typeof newText !== 'string' || newText.trim().length === 0) {
          setError('할 일 내용을 입력해주세요.');
          return prevTodos;
        }
        
        if (newText.trim().length > 1000) {
          setError('할 일 내용은 1000자를 초과할 수 없습니다.');
          return prevTodos;
        }
        
        setError(null);
        return prevTodos.map(todo =>
          todo.id === id 
            ? { ...todo, text: newText.trim() }
            : todo
        );
      });
    } catch (err) {
      console.error('Failed to edit todo:', err);
      setError('할 일 수정에 실패했습니다.');
    }
  }, []);

  // 완료된 Todo들 모두 삭제 함수 (에러 핸들링 강화)
  const clearCompleted = useCallback(() => {
    try {
      setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
      setError(null);
    } catch (err) {
      console.error('Failed to clear completed todos:', err);
      setError('완료된 할 일들 삭제에 실패했습니다.');
    }
  }, []);

  // 필터링된 Todo 목록 계산 (useMemo로 최적화)
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // Todo 통계 계산 (useMemo로 최적화)
  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return {
      total,
      active,
      completed,
      completionPercentage,
    };
  }, [todos]);

  // 3. localStorage 동기화 구현 - 세 번째 서브태스크
  
  // 초기 로드: 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    try {
      const savedTodos = getTodosFromStorage();
      if (savedTodos.length > 0) {
        setTodos(savedTodos);
      }
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Failed to load todos from localStorage:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      setIsLoaded(true); // 에러가 발생해도 로드 완료로 표시
    }
  }, []);

  // 자동 저장: todos 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    // 초기 로드가 완료되지 않았다면 저장하지 않음 (무한 루프 방지)
    if (!isLoaded) return;

    try {
      saveTodosToStorage(todos);
      setError(null);
    } catch (err) {
      console.error('Failed to save todos to localStorage:', err);
      setError('데이터 저장에 실패했습니다.');
    }
  }, [todos, isLoaded]);

  // 4. 에러 핸들링 구현 - 네 번째 서브태스크
  
  // 에러 초기화 함수
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 입력 검증 함수
  const validateTodoText = useCallback((text: string): boolean => {
    if (!text || typeof text !== 'string') {
      setError('할 일 내용을 입력해주세요.');
      return false;
    }
    
    if (text.trim().length === 0) {
      setError('할 일 내용은 공백일 수 없습니다.');
      return false;
    }
    
    if (text.trim().length > 1000) {
      setError('할 일 내용은 1000자를 초과할 수 없습니다.');
      return false;
    }
    
    return true;
  }, []);

  // Todo ID 검증 함수
  const validateTodoId = (id: string): boolean => {
    if (!id || typeof id !== 'string') {
      setError('올바르지 않은 할 일 ID입니다.');
      return false;
    }
    
    const todoExists = todos.some(todo => todo.id === id);
    if (!todoExists) {
      setError('존재하지 않는 할 일입니다.');
      return false;
    }
    
    return true;
  };

  return {
    todos,
    filter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    setFilter,
    filteredTodos,
    todoStats,
    clearCompleted,
    // 에러 관련 상태와 함수 추가
    error,
    clearError,
    isLoading: !isLoaded || isLoading, // 초기 로드 중이거나 비동기 작업 중
  };
}; 