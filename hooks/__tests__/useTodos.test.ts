import { renderHook, act } from '@testing-library/react'
import { useTodos } from '../useTodos'
import * as storage from '@/lib/storage'

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  getTodosFromStorage: jest.fn(),
  saveTodosToStorage: jest.fn(),
}))

const mockGetTodosFromStorage = storage.getTodosFromStorage as jest.MockedFunction<typeof storage.getTodosFromStorage>
const mockSaveTodosToStorage = storage.saveTodosToStorage as jest.MockedFunction<typeof storage.saveTodosToStorage>

describe('useTodos Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetTodosFromStorage.mockReturnValue([])
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 한다', async () => {
      const { result } = renderHook(() => useTodos())
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.todos).toEqual([])
      expect(result.current.filter).toBe('all')
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('localStorage에서 기존 데이터를 로드해야 한다', async () => {
      const savedTodos = [
        {
          id: '1',
          text: '기존 할 일',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ]
      
      mockGetTodosFromStorage.mockReturnValue(savedTodos)
      
      const { result } = renderHook(() => useTodos())
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.todos).toEqual(savedTodos)
      expect(mockGetTodosFromStorage).toHaveBeenCalledTimes(1)
    })
  })

  describe('Todo 추가 (addTodo)', () => {
    it('새로운 할 일을 추가할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useTodos())
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addTodo('새로운 할 일')
      })

      expect(result.current.todos).toHaveLength(1)
      expect(result.current.todos[0].text).toBe('새로운 할 일')
      expect(result.current.todos[0].completed).toBe(false)
    })

    it('빈 문자열로는 할 일을 추가할 수 없어야 한다', async () => {
      const { result } = renderHook(() => useTodos())
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addTodo('')
      })

      expect(result.current.todos).toHaveLength(0)
      expect(result.current.error).toBe('할 일 내용을 입력해주세요.')
    })
  })

  describe('Todo 토글 (toggleTodo)', () => {
    it('할 일의 완료 상태를 토글할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useTodos())
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addTodo('테스트 할 일')
      })

      const todoId = result.current.todos[0].id

      act(() => {
        result.current.toggleTodo(todoId)
      })

      expect(result.current.todos[0].completed).toBe(true)
    })
  })

  describe('에러 핸들링', () => {
    it('에러를 초기화할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useTodos())
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addTodo('')
      })

      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
}) 