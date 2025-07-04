# 🛠️ 개발 가이드

Simple Todo App의 개발 환경 설정, 아키텍처, 그리고 개발 워크플로우에 대한 종합 가이드입니다.

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 아키텍처](#프로젝트-아키텍처)
3. [개발 워크플로우](#개발-워크플로우)
4. [컴포넌트 가이드](#컴포넌트-가이드)
5. [상태 관리](#상태-관리)
6. [성능 최적화](#성능-최적화)
7. [디버깅 가이드](#디버깅-가이드)

## 🚀 개발 환경 설정

### 시스템 요구사항

```bash
# Node.js 버전 확인
node --version  # v18.0.0+

# npm 버전 확인  
npm --version   # v8.0.0+

# Git 버전 확인
git --version   # v2.0+
```

### IDE 설정

#### **Visual Studio Code (권장)**

**필수 확장프로그램:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-jest",
    "formulahendry.auto-rename-tag"
  ]
}
```

**VS Code 설정 (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 로컬 개발 환경

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/simple-todo-app.git
cd simple-todo-app

# 2. 의존성 설치
npm install

# 3. 환경변수 설정 (선택사항)
cp .env.example .env.local

# 4. 개발 서버 시작
npm run dev
```

### 개발 도구 명령어

```bash
# 개발
npm run dev              # 개발 서버 (localhost:3000)
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버

# 코드 품질
npm run lint             # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run type-check       # TypeScript 타입 검사

# 테스팅
npm run test             # Jest 테스트 실행
npm run test:watch       # 테스트 감시 모드
npm run test:coverage    # 테스트 커버리지

# 유틸리티
npm run clean            # 빌드 파일 정리
npm run analyze          # 번들 크기 분석
```

## 🏗️ 프로젝트 아키텍처

### 폴더 구조

```
simple-todo-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   ├── globals.css        # 전역 스타일
│   └── favicon.ico        # 파비콘
├── components/            # React 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── features/          # 기능별 컴포넌트
│   │   ├── TodoForm.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoFilter.tsx
│   ├── layout/            # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── import-export/     # 가져오기/내보내기 관련
│   │   ├── ImportExportMenu.tsx
│   │   ├── ExportModal.tsx
│   │   └── ImportModal.tsx
│   ├── ErrorBoundary.tsx  # 오류 경계
│   └── index.ts           # 컴포넌트 exports
├── hooks/                 # 커스텀 훅
│   ├── useTodos.tsx       # 할 일 상태 관리
│   ├── useLocalStorage.tsx # 로컬 저장소 훅
│   └── useKeyboard.tsx    # 키보드 이벤트 훅
├── lib/                   # 유틸리티 및 설정
│   ├── types.ts           # TypeScript 타입 정의
│   ├── storage.ts         # 저장소 서비스
│   ├── utils.ts           # 헬퍼 함수
│   └── constants.ts       # 상수 정의
├── __tests__/            # 테스트 파일
│   ├── components/        # 컴포넌트 테스트
│   ├── hooks/             # 훅 테스트
│   ├── lib/               # 유틸리티 테스트
│   └── __mocks__/         # 모킹 파일
├── docs/                  # 문서
├── public/                # 정적 파일
└── config files           # 설정 파일들
```

### 기술 스택

**핵심 기술:**
- **Next.js 14**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS
- **Framer Motion**: 애니메이션 라이브러리

**개발 도구:**
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포매팅
- **Jest**: 테스트 프레임워크
- **React Testing Library**: 컴포넌트 테스트

### 아키텍처 원칙

#### 1. **관심사의 분리 (Separation of Concerns)**
```typescript
// ✅ 좋은 예: 로직과 UI 분리
const useTodos = () => {
  // 비즈니스 로직
  const [todos, setTodos] = useState<Todo[]>([]);
  // ...
  return { todos, addTodo, toggleTodo, deleteTodo };
};

const TodoList: React.FC = () => {
  // UI 렌더링만 담당
  const { todos, toggleTodo, deleteTodo } = useTodos();
  return (/* JSX */);
};
```

#### 2. **단일 책임 원칙 (Single Responsibility)**
```typescript
// ✅ 각 컴포넌트는 하나의 책임만
const TodoItem = ({ todo, onToggle, onDelete }) => { /* 할 일 항목 렌더링 */ };
const TodoForm = ({ onAdd }) => { /* 할 일 추가 폼 */ };
const TodoFilter = ({ filter, onFilterChange }) => { /* 필터 UI */ };
```

#### 3. **컴포지션 패턴 (Composition Pattern)**
```typescript
// ✅ 작은 컴포넌트들을 조합
const TodoApp = () => (
  <ErrorBoundaryWrapper>
    <Header>
      <TodoForm onAdd={addTodo} />
      <ImportExportMenu />
    </Header>
    <main>
      <TodoFilter />
      <TodoList />
    </main>
  </ErrorBoundaryWrapper>
);
```

## 🔄 개발 워크플로우

### 기능 개발 프로세스

```bash
# 1. 새 기능 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/todo-categories

# 2. 개발 진행
# - 컴포넌트 작성
# - 훅 구현
# - 타입 정의
# - 테스트 작성

# 3. 커밋 (Conventional Commits)
git add .
git commit -m "feat(todo): add category support

- Add TodoCategory component
- Update Todo type with category field
- Add category filtering logic
- Add tests for category functionality"

# 4. 푸시 및 PR 생성
git push origin feature/todo-categories
# GitHub에서 Pull Request 생성
```

### 코딩 컨벤션

#### **네이밍 규칙**
```typescript
// 컴포넌트: PascalCase
const TodoItem: React.FC = () => {};

// 변수/함수: camelCase
const todoItems = [];
const handleAddTodo = () => {};

// 상수: UPPER_SNAKE_CASE
const MAX_TODO_LENGTH = 280;

// 타입/인터페이스: PascalCase
interface TodoProps {
  id: string;
  text: string;
}

// 파일명: kebab-case 또는 PascalCase
todo-item.test.ts
TodoItem.tsx
```

#### **Import 순서**
```typescript
// 1. React/Next.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. 외부 라이브러리
import { motion } from 'framer-motion';

// 3. 내부 컴포넌트
import { TodoItem } from '@/components';

// 4. 내부 유틸리티
import { formatDate } from '@/lib/utils';
import type { Todo } from '@/lib/types';
```

## 🧩 컴포넌트 가이드

### 컴포넌트 구조

```typescript
// TodoItem.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { Todo } from '@/lib/types';

// 1. 타입 정의
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

// 2. 컴포넌트 구현
const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onEdit
}) => {
  // 3. 상태 및 훅
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  // 4. 이벤트 핸들러
  const handleEdit = () => {
    if (isEditing) {
      onEdit(todo.id, editText);
    }
    setIsEditing(!isEditing);
  };

  // 5. 렌더링
  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* JSX 내용 */}
    </motion.div>
  );
};

// 6. 메모화 (필요시)
export default React.memo(TodoItem);
```

### 재사용 가능한 컴포넌트

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

## 🔄 상태 관리

### 커스텀 훅을 통한 상태 관리

```typescript
// hooks/useTodos.tsx
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Todo, TodoFilter } from '@/lib/types';

export const useTodos = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('simple-todos', []);
  const [filter, setFilter] = useState<TodoFilter>('all');

  // 할 일 추가
  const addTodo = useCallback((text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
  }, [setTodos]);

  // 할 일 토글
  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }, [setTodos]);

  // 할 일 삭제
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, [setTodos]);

  // 필터링된 할 일
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active': return !todo.completed;
      case 'completed': return todo.completed;
      default: return true;
    }
  });

  // 통계
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length,
  };

  return {
    todos: filteredTodos,
    filter,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
  };
};
```

### 로컬 저장소 훅

```typescript
// hooks/useLocalStorage.tsx
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 초기값 설정
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 값 설정 함수
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

## ⚡ 성능 최적화

### React.memo 활용

```typescript
// 불필요한 리렌더링 방지
const TodoItem = React.memo<TodoItemProps>(({ todo, onToggle, onDelete }) => {
  // 컴포넌트 로직
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수 (선택사항)
  return prevProps.todo.id === nextProps.todo.id &&
         prevProps.todo.completed === nextProps.todo.completed &&
         prevProps.todo.text === nextProps.todo.text;
});
```

### useCallback과 useMemo

```typescript
const TodoList: React.FC = () => {
  const { todos, toggleTodo, deleteTodo } = useTodos();

  // 콜백 메모화
  const handleToggle = useCallback((id: string) => {
    toggleTodo(id);
  }, [toggleTodo]);

  // 계산 결과 메모화
  const sortedTodos = useMemo(() => 
    todos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [todos]
  );

  return (
    <div>
      {sortedTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={deleteTodo}
        />
      ))}
    </div>
  );
};
```

### 코드 분할

```typescript
// 동적 import를 통한 지연 로딩
const ImportModal = lazy(() => import('./ImportModal'));
const ExportModal = lazy(() => import('./ExportModal'));

const ImportExportMenu: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {showImport && <ImportModal />}
      {showExport && <ExportModal />}
    </Suspense>
  );
};
```

## 🐛 디버깅 가이드

### 개발자 도구 활용

```typescript
// 개발 모드에서 디버깅 정보 출력
const useTodos = () => {
  // ... 기존 코드

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Todos updated:', todos);
      console.log('Stats:', stats);
    }
  }, [todos, stats]);
};
```

### React DevTools

```bash
# React DevTools 설치
npm install -g react-devtools

# 실행
react-devtools
```

### 에러 바운더리

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">
            문제가 발생했습니다
          </h2>
          <p className="text-red-600">
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📚 추가 자료

- 🧪 [테스팅 가이드](testing.md) - 테스트 작성 및 실행 가이드
- 🎨 [디자인 시스템](design-system.md) - UI/UX 가이드라인
- 🚀 [배포 가이드](deployment.md) - 프로덕션 배포 절차
- 📖 [API 문서](api.md) - 내부 API 및 유틸리티 함수

---

## 🙋‍♂️ 도움이 필요하신가요?

- 💬 [GitHub Discussions](https://github.com/your-username/simple-todo-app/discussions)
- 🐛 [이슈 리포트](https://github.com/your-username/simple-todo-app/issues)
- 📧 이메일: dev@your-app.com 