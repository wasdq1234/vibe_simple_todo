# 📚 API 문서

Simple Todo App의 내부 API, 유틸리티 함수, 컴포넌트 인터페이스에 대한 종합 문서입니다.

## 📋 목차

1. [타입 정의](#타입-정의)
2. [커스텀 훅](#커스텀-훅)
3. [유틸리티 함수](#유틸리티-함수)
4. [스토리지 서비스](#스토리지-서비스)
5. [컴포넌트 API](#컴포넌트-api)
6. [상수](#상수)

## 🔧 타입 정의

### Todo

```typescript
interface Todo {
  /** 고유 식별자 */
  id: string;
  /** 할 일 내용 */
  text: string;
  /** 완료 상태 */
  completed: boolean;
  /** 생성 일시 (ISO 8601 형식) */
  createdAt: string;
}
```

### TodoFilter

```typescript
type TodoFilter = 'all' | 'active' | 'completed';
```

### ExportOptions

```typescript
interface ExportOptions {
  /** 메타데이터 포함 여부 */
  includeMetadata?: boolean;
  /** 완료된 할 일 포함 여부 */
  includeCompleted?: boolean;
  /** 생성 날짜 포함 여부 */
  includeCreatedAt?: boolean;
  /** JSON 예쁘게 출력 여부 */
  pretty?: boolean;
}
```

### ExportResult

```typescript
interface ExportResult {
  /** 성공 여부 */
  success: boolean;
  /** 내보낸 데이터 */
  data?: string;
  /** 파일명 */
  filename?: string;
  /** 오류 메시지 */
  error?: string;
}
```

### ImportResult

```typescript
interface ImportResult {
  /** 성공 여부 */
  success: boolean;
  /** 가져온 할 일 목록 */
  data?: Todo[];
  /** 오류 목록 */
  errors?: string[];
  /** 경고 목록 */
  warnings?: string[];
  /** 가져온 항목 수 */
  count?: number;
}
```

## 🪝 커스텀 훅

### useTodos

할 일 상태 관리를 위한 메인 훅입니다.

```typescript
function useTodos(): {
  /** 현재 필터에 따른 할 일 목록 */
  todos: Todo[];
  /** 현재 필터 */
  filter: TodoFilter;
  /** 통계 정보 */
  stats: {
    total: number;
    completed: number;
    active: number;
  };
  /** 할 일 추가 */
  addTodo: (text: string) => void;
  /** 할 일 완료 상태 토글 */
  toggleTodo: (id: string) => void;
  /** 할 일 삭제 */
  deleteTodo: (id: string) => void;
  /** 할 일 수정 */
  editTodo: (id: string, text: string) => void;
  /** 필터 설정 */
  setFilter: (filter: TodoFilter) => void;
  /** 완료된 할 일 모두 삭제 */
  clearCompleted: () => void;
  /** 모든 할 일 토글 */
  toggleAll: () => void;
}
```

**사용 예시:**

```typescript
const TodoApp = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div>
      <TodoForm onAdd={addTodo} />
      <TodoList 
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
};
```

### useLocalStorage

로컬 저장소 관리를 위한 훅입니다.

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
```

**매개변수:**
- `key`: 로컬 저장소 키
- `initialValue`: 초기값

**반환값:**
- `[0]`: 현재 저장된 값
- `[1]`: 값 설정 함수

**사용 예시:**

```typescript
const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);

// 값 설정
setTodos([...todos, newTodo]);

// 함수로 설정
setTodos(prev => prev.filter(todo => todo.id !== deletedId));
```

### useKeyboard

키보드 이벤트 처리를 위한 훅입니다.

```typescript
function useKeyboard(
  handlers: Record<string, () => void>,
  dependencies?: React.DependencyList
): void
```

**사용 예시:**

```typescript
const TodoItem = ({ todo, onSave, onCancel }) => {
  useKeyboard({
    'Enter': onSave,
    'Escape': onCancel,
  }, [onSave, onCancel]);

  return <input ... />;
};
```

## 🛠️ 유틸리티 함수

### formatDate

날짜를 사용자 친화적인 형식으로 포맷합니다.

```typescript
function formatDate(dateString: string): string
```

**매개변수:**
- `dateString`: ISO 8601 형식의 날짜 문자열

**반환값:**
- 포맷된 날짜 문자열

**사용 예시:**

```typescript
formatDate('2024-01-01T12:00:00.000Z')
// → "2024년 1월 1일"

formatDate('2024-01-01T12:00:00.000Z')  
// → "1시간 전" (상대적 시간)
```

### generateId

고유 ID를 생성합니다.

```typescript
function generateId(): string
```

**반환값:**
- UUID v4 형식의 고유 문자열

**사용 예시:**

```typescript
const newTodo: Todo = {
  id: generateId(),
  text: 'New todo',
  completed: false,
  createdAt: new Date().toISOString()
};
```

### cn (클래스명 유틸리티)

조건부 클래스명을 합성합니다.

```typescript
function cn(...classes: (string | undefined | false | null)[]): string
```

**사용 예시:**

```typescript
const className = cn(
  'base-class',
  isActive && 'active-class',
  error && 'error-class'
);
```

### debounce

함수 호출을 지연시킵니다.

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

**사용 예시:**

```typescript
const debouncedSearch = debounce((query: string) => {
  // 검색 로직
}, 300);
```

## 💾 스토리지 서비스

### LocalStorageService

파일 내보내기/가져오기를 위한 서비스 클래스입니다.

#### 생성자

```typescript
class LocalStorageService {
  constructor()
}
```

#### 메서드

##### exportToJSON

```typescript
exportToJSON(todos: Todo[], options?: ExportOptions): ExportResult
```

할 일 목록을 JSON 형식으로 내보냅니다.

**매개변수:**
- `todos`: 내보낼 할 일 목록
- `options`: 내보내기 옵션

**사용 예시:**

```typescript
const service = new LocalStorageService();
const result = service.exportToJSON(todos, {
  includeMetadata: true,
  pretty: true
});

if (result.success) {
  downloadFile(result.data!, result.filename!);
}
```

##### exportToCSV

```typescript
exportToCSV(todos: Todo[], options?: ExportOptions): ExportResult
```

할 일 목록을 CSV 형식으로 내보냅니다.

##### exportToTXT

```typescript
exportToTXT(todos: Todo[], options?: ExportOptions): ExportResult
```

할 일 목록을 텍스트 형식으로 내보냅니다.

##### importFromFile

```typescript
async importFromFile(file: File): Promise<ImportResult>
```

파일에서 할 일 목록을 가져옵니다.

**매개변수:**
- `file`: 가져올 파일 (JSON, CSV, TXT 지원)

**사용 예시:**

```typescript
const handleFileImport = async (file: File) => {
  const service = new LocalStorageService();
  const result = await service.importFromFile(file);
  
  if (result.success) {
    setTodos(prev => [...prev, ...result.data!]);
  } else {
    console.error('Import failed:', result.errors);
  }
};
```

##### createBackup

```typescript
createBackup(todos: Todo[]): void
```

현재 데이터의 백업을 생성합니다.

##### restoreFromBackup

```typescript
restoreFromBackup(): Todo[] | null
```

가장 최근 백업에서 데이터를 복원합니다.

## 🧩 컴포넌트 API

### TodoForm

할 일 추가 폼 컴포넌트입니다.

```typescript
interface TodoFormProps {
  /** 할 일 추가 시 호출되는 콜백 */
  onAdd: (text: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 추가 버튼 텍스트 */
  buttonText?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
}
```

### TodoItem

개별 할 일 항목 컴포넌트입니다.

```typescript
interface TodoItemProps {
  /** 할 일 객체 */
  todo: Todo;
  /** 완료 상태 토글 콜백 */
  onToggle: (id: string) => void;
  /** 삭제 콜백 */
  onDelete: (id: string) => void;
  /** 수정 콜백 */
  onEdit: (id: string, text: string) => void;
  /** 읽기 전용 모드 */
  readonly?: boolean;
}
```

### TodoList

할 일 목록 컴포넌트입니다.

```typescript
interface TodoListProps {
  /** 할 일 목록 */
  todos: Todo[];
  /** 완료 상태 토글 콜백 */
  onToggle: (id: string) => void;
  /** 삭제 콜백 */
  onDelete: (id: string) => void;
  /** 수정 콜백 */
  onEdit: (id: string, text: string) => void;
  /** 로딩 상태 */
  loading?: boolean;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
}
```

### TodoFilter

필터 버튼 컴포넌트입니다.

```typescript
interface TodoFilterProps {
  /** 현재 필터 */
  currentFilter: TodoFilter;
  /** 필터 변경 콜백 */
  onFilterChange: (filter: TodoFilter) => void;
  /** 통계 정보 */
  stats: {
    total: number;
    active: number;
    completed: number;
  };
}
```

### ImportExportMenu

가져오기/내보내기 메뉴 컴포넌트입니다.

```typescript
interface ImportExportMenuProps {
  /** 할 일 목록 */
  todos: Todo[];
  /** 가져오기 성공 콜백 */
  onImportSuccess: (todos: Todo[]) => void;
  /** 오류 콜백 */
  onError: (error: string) => void;
}
```

### ExportModal

내보내기 모달 컴포넌트입니다.

```typescript
interface ExportModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 할 일 목록 */
  todos: Todo[];
}
```

### ImportModal

가져오기 모달 컴포넌트입니다.

```typescript
interface ImportModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 가져오기 성공 콜백 */
  onImportSuccess: (todos: Todo[]) => void;
}
```

## 📊 상수

### STORAGE_KEYS

```typescript
const STORAGE_KEYS = {
  TODOS: 'simple-todos',
  BACKUP: 'simple-todos-backup',
  SETTINGS: 'simple-todos-settings'
} as const;
```

### EXPORT_FORMATS

```typescript
const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  TXT: 'txt'
} as const;
```

### ANIMATION_DURATION

```typescript
const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;
```

### FILE_CONSTRAINTS

```typescript
const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_TYPES: ['application/json', 'text/csv', 'text/plain'],
  MAX_TODOS: 10000
} as const;
```

## 🎨 CSS 클래스

### 유틸리티 클래스

```css
/* 애니메이션 */
.fade-in { /* 페이드 인 애니메이션 */ }
.slide-up { /* 슬라이드 업 애니메이션 */ }
.bounce-in { /* 바운스 인 애니메이션 */ }

/* 상태 */
.completed { /* 완료된 할 일 스타일 */ }
.editing { /* 편집 중 상태 스타일 */ }
.loading { /* 로딩 상태 스타일 */ }

/* 반응형 */
.mobile-hidden { /* 모바일에서 숨김 */ }
.desktop-hidden { /* 데스크톱에서 숨김 */ }
```

## 🔧 환경 변수

### 개발 환경

```bash
# 개발 모드 여부
NODE_ENV=development

# 디버그 모드
DEBUG=true

# API 기본 URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# 애니메이션 활성화
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```

## 📱 브라우저 지원

### 지원되는 기능

| 기능 | Chrome | Firefox | Safari | Edge |
|------|---------|---------|---------|------|
| 기본 기능 | ✅ 80+ | ✅ 78+ | ✅ 14+ | ✅ 80+ |
| File System Access API | ✅ 86+ | ❌ | ❌ | ✅ 86+ |
| Import Maps | ✅ 89+ | ✅ 102+ | ✅ 16.4+ | ✅ 89+ |

### 폴리필

```typescript
// 필요한 경우 폴리필 로드
if (!('crypto' in window) || !('randomUUID' in crypto)) {
  // UUID 폴리필 로드
}

if (!('showSaveFilePicker' in window)) {
  // File System Access API 폴백
}
```

---

## 🙋‍♂️ 도움이 필요하신가요?

- 📖 [개발 가이드](development.md) - 개발 환경 및 아키텍처
- 🧪 [테스팅 가이드](testing.md) - 테스트 작성 및 실행
- 🤝 [기여 가이드](../CONTRIBUTING.md) - 프로젝트 기여 방법
- 🐛 [이슈 신고](https://github.com/your-username/simple-todo-app/issues)

**API 관련 질문이나 제안이 있으시면 언제든지 연락해주세요!** 