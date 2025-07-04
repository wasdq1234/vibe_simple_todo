// Core Todo interface as specified in PRD
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  // Future enhancements (commented for now):
  // priority?: 'low' | 'medium' | 'high';
  // dueDate?: string;
}

// Filter options for todo display
export type TodoFilter = 'all' | 'active' | 'completed';

// Component Props Types
export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
}

export interface TodoListProps {
  todos: Todo[];
  filter: TodoFilter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
}

export interface TodoFormProps {
  placeholder?: string;
  className?: string;
}

// Form validation schema types
export interface TodoFormData {
  text: string;
}

export interface TodoFilterProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  todoStats: TodoStats;
}

// Custom Hook Return Types
export interface UseTodosReturn {
  todos: Todo[];
  filter: TodoFilter;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newText: string) => void;
  setFilter: (filter: TodoFilter) => void;
  filteredTodos: Todo[];
  todoStats: TodoStats;
  clearCompleted: () => void;
  // 에러 핸들링 관련 속성들
  error: string | null;
  clearError: () => void;
  isLoading: boolean;
}

// Storage utility types
export interface StorageService {
  getTodos: () => Todo[];
  saveTodos: (todos: Todo[]) => void;
  clearTodos: () => void;
}

// Error handling types
export interface TodoError {
  message: string;
  code?: string;
  field?: string;
}

export type TodoActionResult = {
  success: true;
  data?: any;
} | {
  success: false;
  error: TodoError;
};

// Utility type for creating new todos
export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt'>;

// Type for todo statistics
export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  completionPercentage: number;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: TodoError[];
}

// Event handler types for better type safety
export type TodoEventHandler = (id: string) => void;
export type TodoEditHandler = (id: string, newText: string) => void;
export type TodoAddHandler = (text: string) => void;
export type FilterChangeHandler = (filter: TodoFilter) => void;