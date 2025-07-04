import { Todo, CreateTodoInput, TodoStats, ValidationResult, TodoError } from './types';

/**
 * Generate a unique ID for new todos
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new todo with generated ID and timestamp
 */
export function createTodo(input: CreateTodoInput): Todo {
  return {
    id: generateId(),
    text: input.text,
    completed: input.completed,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate todo text input
 */
export function validateTodoText(text: string): ValidationResult {
  const errors: TodoError[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push({
      message: 'Todo text cannot be empty',
      code: 'EMPTY_TEXT',
      field: 'text'
    });
  }
  
  if (text.trim().length > 500) {
    errors.push({
      message: 'Todo text cannot exceed 500 characters',
      code: 'TEXT_TOO_LONG',
      field: 'text'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate statistics for a list of todos
 */
export function calculateTodoStats(todos: Todo[]): TodoStats {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    active,
    completed,
    completionPercentage
  };
}

/**
 * Filter todos based on completion status
 */
export function filterTodos(todos: Todo[], filter: 'all' | 'active' | 'completed'): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

/**
 * Sort todos by creation date (newest first)
 */
export function sortTodosByDate(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Format date for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a todo matches search criteria
 */
export function matchesSearch(todo: Todo, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;
  
  return todo.text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return formatDate(isoString);
}