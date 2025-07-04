import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTodos } from '../useTodos'
import * as storage from '@/lib/storage'

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  getTodosFromStorage: jest.fn(),
  saveTodosToStorage: jest.fn(),
}))

const mockGetTodosFromStorage = storage.getTodosFromStorage as jest.MockedFunction<typeof storage.getTodosFromStorage>
const mockSaveTodosToStorage = storage.saveTodosToStorage as jest.MockedFunction<typeof storage.saveTodosToStorage>

// 테스트용 컴포넌트
const TodoTestComponent: React.FC = () => {
  const {
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
    error,
    clearError,
    isLoading,
  } = useTodos()

  if (isLoading) {
    return <div data-testid="loading">로딩중...</div>
  }

  return (
    <div>
      {/* 에러 표시 */}
      {error && (
        <div data-testid="error">
          {error}
          <button onClick={clearError} data-testid="clear-error">
            에러 초기화
          </button>
        </div>
      )}

      {/* Todo 추가 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const text = formData.get('todoText') as string
          addTodo(text)
          ;(e.target as HTMLFormElement).reset()
        }}
      >
        <input
          name="todoText"
          placeholder="새로운 할 일을 입력하세요"
          data-testid="todo-input"
        />
        <button type="submit" data-testid="add-todo">
          추가
        </button>
      </form>

      {/* 필터 버튼들 */}
      <div data-testid="filter-buttons">
        <button
          onClick={() => setFilter('all')}
          data-active={filter === 'all'}
          data-testid="filter-all"
        >
          전체 ({todoStats.total})
        </button>
        <button
          onClick={() => setFilter('active')}
          data-active={filter === 'active'}
          data-testid="filter-active"
        >
          진행중 ({todoStats.active})
        </button>
        <button
          onClick={() => setFilter('completed')}
          data-active={filter === 'completed'}
          data-testid="filter-completed"
        >
          완료됨 ({todoStats.completed})
        </button>
      </div>

      {/* Todo 목록 */}
      <ul data-testid="todo-list">
        {filteredTodos.map((todo) => (
          <li key={todo.id} data-testid={`todo-item-${todo.id}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              data-testid={`toggle-${todo.id}`}
            />
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              data-testid={`todo-text-${todo.id}`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => editTodo(todo.id, `${todo.text} (수정됨)`)}
              data-testid={`edit-${todo.id}`}
            >
              수정
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              data-testid={`delete-${todo.id}`}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      {/* 완료된 할 일 정리 버튼 */}
      {todoStats.completed > 0 && (
        <button onClick={clearCompleted} data-testid="clear-completed">
          완료된 할 일 정리 ({todoStats.completed}개)
        </button>
      )}

      {/* 통계 표시 */}
      <div data-testid="todo-stats">
        전체: {todoStats.total}, 진행중: {todoStats.active}, 완료: {todoStats.completed}
      </div>
    </div>
  )
}

describe('useTodos Hook Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetTodosFromStorage.mockReturnValue([])
  })

  it('컴포넌트가 정상적으로 렌더링되고 로딩 상태가 해제되어야 한다', async () => {
    render(<TodoTestComponent />)
    
    // 로딩 상태가 있을 수도, 없을 수도 있음 (매우 빠르게 끝날 수 있음)
    const loadingElement = screen.queryByTestId('loading')
    if (loadingElement) {
      // 로딩 완료 대기
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
      })
    }

    // 기본 UI 요소들 확인
    expect(screen.getByTestId('todo-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-todo')).toBeInTheDocument()
    expect(screen.getByTestId('filter-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('todo-list')).toBeInTheDocument()
  })

  it('새로운 할 일을 추가하고 UI에 표시되어야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    const input = screen.getByTestId('todo-input')
    const addButton = screen.getByTestId('add-todo')

    // 할 일 추가
    await user.type(input, '새로운 할 일')
    await user.click(addButton)

    // Todo 목록에 추가된 항목 확인
    await waitFor(() => {
      expect(screen.getByText('새로운 할 일')).toBeInTheDocument()
    })

    // 통계 업데이트 확인
    expect(screen.getByTestId('todo-stats')).toHaveTextContent('전체: 1, 진행중: 1, 완료: 0')
  })

  it('할 일의 완료 상태를 토글할 수 있어야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // 할 일 추가
    const input = screen.getByTestId('todo-input')
    await user.type(input, '토글 테스트')
    await user.click(screen.getByTestId('add-todo'))

    await waitFor(() => {
      expect(screen.getByText('토글 테스트')).toBeInTheDocument()
    })

    // 완료 상태로 토글
    const toggleButton = screen.getByRole('checkbox')
    await user.click(toggleButton)

    // 체크박스가 체크되었는지 확인
    expect(toggleButton).toBeChecked()

    // 통계 업데이트 확인
    await waitFor(() => {
      expect(screen.getByTestId('todo-stats')).toHaveTextContent('전체: 1, 진행중: 0, 완료: 1')
    })
  })

  it('필터링이 올바르게 작동해야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // 여러 할 일 추가
    const input = screen.getByTestId('todo-input')
    
    await user.type(input, '첫 번째 할 일')
    await user.click(screen.getByTestId('add-todo'))
    
    // 첫 번째 할 일이 추가되고 input이 비워질 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument()
      expect(input).toHaveValue('')
    })
    
    // 두 번째 할 일 추가
    await user.type(input, '두 번째 할 일')
    await user.click(screen.getByTestId('add-todo'))
    
    // 두 번째 할 일이 추가될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('두 번째 할 일')).toBeInTheDocument()
    })

    // 하나를 완료 상태로 변경
    await waitFor(() => {
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // 완료됨 필터 클릭
    await user.click(screen.getByTestId('filter-completed'))

    // 완료된 할 일만 표시되는지 확인
    expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument()
    expect(screen.queryByText('두 번째 할 일')).not.toBeInTheDocument()

    // 진행중 필터 클릭
    await user.click(screen.getByTestId('filter-active'))

    // 진행중인 할 일만 표시되는지 확인
    expect(screen.queryByText('첫 번째 할 일')).not.toBeInTheDocument()
    expect(screen.getByText('두 번째 할 일')).toBeInTheDocument()
  })

  it('할 일 삭제가 올바르게 작동해야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // 할 일 추가
    const input = screen.getByTestId('todo-input')
    await user.type(input, '삭제될 할 일')
    await user.click(screen.getByTestId('add-todo'))

    await waitFor(() => {
      expect(screen.getByText('삭제될 할 일')).toBeInTheDocument()
    })

    // 삭제 버튼 클릭
    const deleteButton = screen.getByText('삭제')
    await user.click(deleteButton)

    // 할 일이 제거되었는지 확인
    await waitFor(() => {
      expect(screen.queryByText('삭제될 할 일')).not.toBeInTheDocument()
    })

    // 통계 업데이트 확인
    expect(screen.getByTestId('todo-stats')).toHaveTextContent('전체: 0, 진행중: 0, 완료: 0')
  })

  it('에러 상태를 올바르게 처리해야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // 빈 문자열로 할 일 추가 시도 (에러 발생)
    const addButton = screen.getByTestId('add-todo')
    await user.click(addButton)

    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
      expect(screen.getByText('할 일 내용을 입력해주세요.')).toBeInTheDocument()
    })

    // 에러 초기화 버튼 클릭
    await user.click(screen.getByTestId('clear-error'))

    // 에러가 제거되었는지 확인
    await waitFor(() => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })
  })

  it('완료된 할 일 정리 기능이 작동해야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // 여러 할 일 추가
    const input = screen.getByTestId('todo-input')
    
    await user.type(input, '첫 번째')
    await user.click(screen.getByTestId('add-todo'))
    
    // 첫 번째 할 일이 추가되고 input이 비워질 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('첫 번째')).toBeInTheDocument()
      expect(input).toHaveValue('')
    })
    
    // 두 번째 할 일 추가
    await user.type(input, '두 번째')
    await user.click(screen.getByTestId('add-todo'))
    
    // 두 번째 할 일이 추가될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('두 번째')).toBeInTheDocument()
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // 완료된 할 일 정리 버튼이 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByTestId('clear-completed')).toBeInTheDocument()
    })

    // 완료된 할 일 정리 실행
    await user.click(screen.getByTestId('clear-completed'))

    // 완료된 할 일만 제거되었는지 확인
    await waitFor(() => {
      expect(screen.queryByText('첫 번째')).not.toBeInTheDocument()
      expect(screen.getByText('두 번째')).toBeInTheDocument()
    })

    // 통계 업데이트 확인
    expect(screen.getByTestId('todo-stats')).toHaveTextContent('전체: 1, 진행중: 1, 완료: 0')
  })

  it('localStorage 동기화가 호출되어야 한다', async () => {
    render(<TodoTestComponent />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // 초기 로드 호출 확인
    expect(mockGetTodosFromStorage).toHaveBeenCalledTimes(1)

    // 할 일 추가
    const input = screen.getByTestId('todo-input')
    await user.type(input, '저장 테스트')
    await user.click(screen.getByTestId('add-todo'))

    // localStorage 저장 호출 확인
    await waitFor(() => {
      expect(mockSaveTodosToStorage).toHaveBeenCalled()
    })
  })
}) 