# 🧪 테스팅 가이드

Simple Todo App의 테스트 작성과 실행에 대한 종합 가이드입니다.

## 📋 목차

1. [테스트 환경 설정](#테스트-환경-설정)
2. [테스트 유형](#테스트-유형)
3. [컴포넌트 테스트](#컴포넌트-테스트)
4. [훅 테스트](#훅-테스트)
5. [유틸리티 테스트](#유틸리티-테스트)
6. [E2E 테스트](#e2e-테스트)
7. [테스트 모범 사례](#테스트-모범-사례)
8. [CI/CD 통합](#cicd-통합)

## ⚙️ 테스트 환경 설정

### 테스트 스택

- **Jest**: 테스트 러너 및 단언 라이브러리
- **React Testing Library**: React 컴포넌트 테스트
- **@testing-library/jest-dom**: 추가 DOM 매처
- **@testing-library/user-event**: 사용자 상호작용 시뮬레이션

### Jest 설정

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 테스트 유틸리티 설정

```typescript
// __tests__/utils/test-utils.tsx
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { TodoProvider } from '@/hooks/useTodos'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TodoProvider>
      {children}
    </TodoProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

## 🎯 테스트 유형

### 1. **단위 테스트 (Unit Tests)**
- 개별 함수, 컴포넌트, 훅 테스트
- 빠른 실행, 높은 커버리지
- 격리된 환경에서 실행

### 2. **통합 테스트 (Integration Tests)**
- 여러 컴포넌트 간의 상호작용 테스트
- 실제 사용자 워크플로우 검증

### 3. **E2E 테스트 (End-to-End Tests)**
- 전체 애플리케이션 플로우 테스트
- 브라우저 환경에서 실행

## 🧩 컴포넌트 테스트

### 기본 컴포넌트 테스트

```typescript
// __tests__/components/TodoItem.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TodoItem from '@/components/TodoItem'
import { Todo } from '@/lib/types'

const mockTodo: Todo = {
  id: '1',
  text: 'Test todo',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z'
}

const mockHandlers = {
  onToggle: jest.fn(),
  onDelete: jest.fn(),
  onEdit: jest.fn(),
}

describe('TodoItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders todo text correctly', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />)
    
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1')
  })

  it('shows completed state correctly', () => {
    const completedTodo = { ...mockTodo, completed: true }
    render(<TodoItem todo={completedTodo} {...mockHandlers} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
    
    const text = screen.getByText('Test todo')
    expect(text).toHaveClass('line-through')
  })

  it('enters edit mode on double click', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />)
    
    const text = screen.getByText('Test todo')
    fireEvent.doubleClick(text)
    
    expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument()
  })

  it('saves edited text on Enter key', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />)
    
    const text = screen.getByText('Test todo')
    fireEvent.doubleClick(text)
    
    const input = screen.getByDisplayValue('Test todo')
    fireEvent.change(input, { target: { value: 'Updated todo' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('1', 'Updated todo')
  })

  it('cancels edit on Escape key', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />)
    
    const text = screen.getByText('Test todo')
    fireEvent.doubleClick(text)
    
    const input = screen.getByDisplayValue('Test todo')
    fireEvent.change(input, { target: { value: 'Updated todo' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(screen.getByText('Test todo')).toBeInTheDocument()
    expect(mockHandlers.onEdit).not.toHaveBeenCalled()
  })
})
```

### 폼 컴포넌트 테스트

```typescript
// __tests__/components/TodoForm.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoForm from '@/components/TodoForm'

describe('TodoForm', () => {
  const mockOnAdd = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input field and button', () => {
    render(<TodoForm onAdd={mockOnAdd} />)
    
    expect(screen.getByPlaceholderText('새 할 일을 입력하세요...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
  })

  it('adds todo on form submission', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAdd={mockOnAdd} />)
    
    const input = screen.getByPlaceholderText('새 할 일을 입력하세요...')
    const button = screen.getByRole('button', { name: '추가' })
    
    await user.type(input, 'New todo item')
    await user.click(button)
    
    expect(mockOnAdd).toHaveBeenCalledWith('New todo item')
    expect(input).toHaveValue('')
  })

  it('adds todo on Enter key press', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAdd={mockOnAdd} />)
    
    const input = screen.getByPlaceholderText('새 할 일을 입력하세요...')
    
    await user.type(input, 'New todo item{enter}')
    
    expect(mockOnAdd).toHaveBeenCalledWith('New todo item')
  })

  it('does not add empty todos', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAdd={mockOnAdd} />)
    
    const button = screen.getByRole('button', { name: '추가' })
    await user.click(button)
    
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('trims whitespace from input', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAdd={mockOnAdd} />)
    
    const input = screen.getByPlaceholderText('새 할 일을 입력하세요...')
    
    await user.type(input, '  spaced todo  {enter}')
    
    expect(mockOnAdd).toHaveBeenCalledWith('spaced todo')
  })
})
```

## 🪝 훅 테스트

### 커스텀 훅 테스트

```typescript
// __tests__/hooks/useTodos.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useTodos } from '@/hooks/useTodos'

// localStorage 모킹
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with empty todos array', () => {
    const { result } = renderHook(() => useTodos())
    
    expect(result.current.todos).toEqual([])
    expect(result.current.stats.total).toBe(0)
  })

  it('adds a new todo', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.addTodo('Test todo')
    })
    
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Test todo')
    expect(result.current.todos[0].completed).toBe(false)
  })

  it('toggles todo completion', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.addTodo('Test todo')
    })
    
    const todoId = result.current.todos[0].id
    
    act(() => {
      result.current.toggleTodo(todoId)
    })
    
    expect(result.current.todos[0].completed).toBe(true)
  })

  it('deletes a todo', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.addTodo('Test todo')
    })
    
    const todoId = result.current.todos[0].id
    
    act(() => {
      result.current.deleteTodo(todoId)
    })
    
    expect(result.current.todos).toHaveLength(0)
  })

  it('filters todos correctly', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.addTodo('Todo 1')
      result.current.addTodo('Todo 2')
    })
    
    const firstTodoId = result.current.todos[0].id
    
    act(() => {
      result.current.toggleTodo(firstTodoId)
    })
    
    // Test active filter
    act(() => {
      result.current.setFilter('active')
    })
    
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].completed).toBe(false)
    
    // Test completed filter
    act(() => {
      result.current.setFilter('completed')
    })
    
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].completed).toBe(true)
  })

  it('persists data to localStorage', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.addTodo('Persistent todo')
    })
    
    const savedData = localStorage.getItem('simple-todos')
    const parsedData = JSON.parse(savedData!)
    
    expect(parsedData).toHaveLength(1)
    expect(parsedData[0].text).toBe('Persistent todo')
  })
})
```

## 🛠️ 유틸리티 테스트

### 스토리지 서비스 테스트

```typescript
// __tests__/lib/storage.test.ts
import { LocalStorageService } from '@/lib/storage'
import { Todo } from '@/lib/types'

const mockTodos: Todo[] = [
  {
    id: '1',
    text: 'Test todo 1',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    text: 'Test todo 2',
    completed: true,
    createdAt: '2024-01-02T00:00:00.000Z'
  }
]

describe('LocalStorageService', () => {
  let storageService: LocalStorageService

  beforeEach(() => {
    localStorage.clear()
    storageService = new LocalStorageService()
  })

  describe('exportToJSON', () => {
    it('exports todos in JSON format', () => {
      const result = storageService.exportToJSON(mockTodos)
      
      expect(result.success).toBe(true)
      expect(result.data).toContain('"text":"Test todo 1"')
      expect(result.filename).toMatch(/todos-\d{4}-\d{2}-\d{2}\.json/)
    })

    it('includes metadata when requested', () => {
      const result = storageService.exportToJSON(mockTodos, {
        includeMetadata: true,
        pretty: true
      })
      
      expect(result.data).toContain('"metadata"')
      expect(result.data).toContain('"appName"')
      expect(result.data).toContain('"exportedAt"')
    })

    it('filters completed todos when excluded', () => {
      const result = storageService.exportToJSON(mockTodos, {
        includeCompleted: false
      })
      
      const parsedData = JSON.parse(result.data!)
      expect(parsedData.todos).toHaveLength(1)
      expect(parsedData.todos[0].completed).toBe(false)
    })
  })

  describe('exportToCSV', () => {
    it('exports todos in CSV format', () => {
      const result = storageService.exportToCSV(mockTodos)
      
      expect(result.success).toBe(true)
      expect(result.data).toContain('id,text,completed,createdAt')
      expect(result.data).toContain('Test todo 1')
      expect(result.filename).toMatch(/todos-\d{4}-\d{2}-\d{2}\.csv/)
    })
  })

  describe('exportToTXT', () => {
    it('exports todos in text format', () => {
      const result = storageService.exportToTXT(mockTodos)
      
      expect(result.success).toBe(true)
      expect(result.data).toContain('□ Test todo 1')
      expect(result.data).toContain('✓ Test todo 2')
    })
  })

  describe('importFromFile', () => {
    it('imports JSON file successfully', async () => {
      const jsonData = JSON.stringify({
        todos: mockTodos,
        metadata: { version: '1.0.0' }
      })
      
      const file = new File([jsonData], 'todos.json', { type: 'application/json' })
      
      const result = await storageService.importFromFile(file)
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data![0].text).toBe('Test todo 1')
    })

    it('validates required fields', async () => {
      const invalidData = JSON.stringify({
        todos: [{ text: 'Invalid todo' }] // missing id and completed
      })
      
      const file = new File([invalidData], 'todos.json', { type: 'application/json' })
      
      const result = await storageService.importFromFile(file)
      
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('handles unsupported file types', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      
      const result = await storageService.importFromFile(file)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('지원하지 않는 파일 형식입니다')
    })
  })
})
```

## 🚀 E2E 테스트

### Playwright 설정 (선택사항)

```typescript
// e2e/todo-app.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should add a new todo', async ({ page }) => {
    const input = page.getByPlaceholder('새 할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })
    
    await input.fill('E2E Test Todo')
    await addButton.click()
    
    await expect(page.getByText('E2E Test Todo')).toBeVisible()
  })

  test('should toggle todo completion', async ({ page }) => {
    // Add a todo first
    await page.getByPlaceholder('새 할 일을 입력하세요...').fill('Test Todo')
    await page.getByRole('button', { name: '추가' }).click()
    
    const checkbox = page.getByRole('checkbox').first()
    await checkbox.click()
    
    await expect(checkbox).toBeChecked()
  })

  test('should filter todos', async ({ page }) => {
    // Add multiple todos
    const input = page.getByPlaceholder('새 할 일을 입력하세요...')
    await input.fill('Active Todo')
    await page.getByRole('button', { name: '추가' }).click()
    
    await input.fill('Completed Todo')
    await page.getByRole('button', { name: '추가' }).click()
    
    // Complete one todo
    await page.getByRole('checkbox').first().click()
    
    // Test filter buttons
    await page.getByRole('button', { name: /완료되지 않은/ }).click()
    await expect(page.getByText('Active Todo')).toBeVisible()
    await expect(page.getByText('Completed Todo')).not.toBeVisible()
    
    await page.getByRole('button', { name: /완료된/ }).click()
    await expect(page.getByText('Completed Todo')).toBeVisible()
    await expect(page.getByText('Active Todo')).not.toBeVisible()
  })
})
```

## 📝 테스트 모범 사례

### 1. **테스트 구조 (AAA 패턴)**

```typescript
// Arrange - Act - Assert
it('should add a new todo', () => {
  // Arrange: 테스트 설정
  const mockOnAdd = jest.fn()
  render(<TodoForm onAdd={mockOnAdd} />)
  
  // Act: 액션 수행
  fireEvent.change(screen.getByRole('textbox'), { 
    target: { value: 'New todo' } 
  })
  fireEvent.click(screen.getByRole('button', { name: '추가' }))
  
  // Assert: 결과 검증
  expect(mockOnAdd).toHaveBeenCalledWith('New todo')
})
```

### 2. **의미있는 테스트 이름**

```typescript
// ❌ 나쁜 예
it('should work', () => {})
it('test todo', () => {})

// ✅ 좋은 예  
it('should add todo when form is submitted with valid text', () => {})
it('should not add todo when input is empty', () => {})
it('should display error message when save fails', () => {})
```

### 3. **적절한 모킹**

```typescript
// 외부 의존성 모킹
jest.mock('@/lib/storage', () => ({
  LocalStorageService: jest.fn().mockImplementation(() => ({
    exportToJSON: jest.fn().mockReturnValue({ success: true, data: '{}' }),
    importFromFile: jest.fn().mockResolvedValue({ success: true, data: [] })
  }))
}))
```

### 4. **접근성 고려**

```typescript
// 역할과 레이블 기반 선택자 사용
const addButton = screen.getByRole('button', { name: '추가' })
const todoInput = screen.getByLabelText('새 할 일 입력')
const completedTodos = screen.getAllByRole('checkbox', { checked: true })
```

## 🔄 CI/CD 통합

### GitHub Actions 설정

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test -- --coverage --watchAll=false
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build application
      run: npm run build
```

### 테스트 스크립트

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests"
  }
}
```

## 📊 커버리지 목표

- **라인 커버리지**: 80% 이상
- **함수 커버리지**: 80% 이상
- **브랜치 커버리지**: 80% 이상
- **구문 커버리지**: 80% 이상

### 커버리지 확인

```bash
# 전체 커버리지 리포트
npm run test:coverage

# HTML 리포트 생성
npx jest --coverage --coverageReporters=html
open coverage/lcov-report/index.html
```

---

## 🙋‍♂️ 도움이 필요하신가요?

- 📖 [개발 가이드](development.md) - 개발 환경 및 아키텍처
- 🤝 [기여 가이드](../CONTRIBUTING.md) - 프로젝트 기여 방법
- 🐛 [이슈 신고](https://github.com/your-username/simple-todo-app/issues)

**테스트 관련 질문이나 제안이 있으시면 언제든지 연락해주세요!** 