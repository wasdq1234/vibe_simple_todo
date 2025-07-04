import { Todo, StorageService, TodoActionResult } from './types';
import { safeJsonParse } from './utils';

// Constants
const STORAGE_KEY = 'simple-todo-app-data';
const STORAGE_VERSION = '1.0';
const APP_NAME = 'Simple Todo App';
const APP_VERSION = '1.0.0';

// Storage structure
interface StorageData {
  version: string;
  todos: Todo[];
  lastModified: string;
}

// Enhanced export format with metadata
export interface ExportData {
  metadata: {
    appName: string;
    appVersion: string;
    exportVersion: string;
    exportedAt: string;
    totalTodos: number;
    completedTodos: number;
    userAgent?: string;
  };
  data: {
    version: string;
    todos: Todo[];
    lastModified: string;
  };
}

// Import validation result
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  todos?: Todo[];
}

// Export format options
export type ExportFormat = 'json' | 'csv' | 'txt';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includeCompleted: boolean;
  includeCreatedDate: boolean;
  prettyPrint: boolean;
}

/**
 * localStorage wrapper with error handling and enhanced serialization
 */
class LocalStorageService implements StorageService {
  private isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getStorageData(): StorageData {
    if (!this.isAvailable()) {
      return this.getDefaultData();
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.getDefaultData();
      }

      const parsed = safeJsonParse<StorageData>(data, this.getDefaultData());
      
      // Version check and migration if needed
      if (parsed.version !== STORAGE_VERSION) {
        console.log('Storage version mismatch, migrating data...');
        return this.migrateData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.getDefaultData();
    }
  }

  private getDefaultData(): StorageData {
    return {
      version: STORAGE_VERSION,
      todos: [],
      lastModified: new Date().toISOString()
    };
  }

  private migrateData(oldData: any): StorageData {
    // Handle migration from different versions
    // For now, just return default data
    return this.getDefaultData();
  }

  private saveStorageData(data: StorageData): TodoActionResult {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: {
          message: 'localStorage is not available',
          code: 'STORAGE_UNAVAILABLE'
        }
      };
    }

    try {
      const dataToSave = {
        ...data,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      return {
        success: true,
        data: dataToSave
      };
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to save data',
          code: 'STORAGE_SAVE_ERROR'
        }
      };
    }
  }

  getTodos(): Todo[] {
    const data = this.getStorageData();
    return data.todos;
  }

  saveTodos(todos: Todo[]): void {
    const currentData = this.getStorageData();
    const result = this.saveStorageData({
      ...currentData,
      todos
    });

    if (!result.success) {
      console.error('Failed to save todos:', result.error);
      // In a real app, you might want to show a user notification here
    }
  }

  clearTodos(): void {
    const result = this.saveStorageData(this.getDefaultData());
    
    if (!result.success) {
      console.error('Failed to clear todos:', result.error);
    }
  }

  // Additional utility methods
  getLastModified(): string | null {
    const data = this.getStorageData();
    return data.lastModified;
  }

  /**
   * Enhanced export data with metadata and multiple format support
   */
  exportData(options: Partial<ExportOptions> = {}): string {
    const defaultOptions: ExportOptions = {
      format: 'json',
      includeMetadata: true,
      includeCompleted: true,
      includeCreatedDate: true,
      prettyPrint: true
    };

    const opts = { ...defaultOptions, ...options };
    const data = this.getStorageData();
    
    // Filter todos based on options
    let todos = data.todos;
    if (!opts.includeCompleted) {
      todos = todos.filter(todo => !todo.completed);
    }

    switch (opts.format) {
      case 'json':
        return this.exportAsJson(data, todos, opts);
      case 'csv':
        return this.exportAsCsv(todos, opts);
      case 'txt':
        return this.exportAsText(todos, opts);
      default:
        return this.exportAsJson(data, todos, opts);
    }
  }

  private exportAsJson(data: StorageData, todos: Todo[], options: ExportOptions): string {
    if (options.includeMetadata) {
      const exportData: ExportData = {
        metadata: {
          appName: APP_NAME,
          appVersion: APP_VERSION,
          exportVersion: STORAGE_VERSION,
          exportedAt: new Date().toISOString(),
          totalTodos: todos.length,
          completedTodos: todos.filter(t => t.completed).length,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        },
        data: {
          version: data.version,
          todos,
          lastModified: data.lastModified
        }
      };
      
      return JSON.stringify(exportData, null, options.prettyPrint ? 2 : 0);
    } else {
      return JSON.stringify({
        version: data.version,
        todos,
        lastModified: data.lastModified
      }, null, options.prettyPrint ? 2 : 0);
    }
  }

  private exportAsCsv(todos: Todo[], options: ExportOptions): string {
    const headers = ['ID', 'Text', 'Completed'];
    if (options.includeCreatedDate) {
      headers.push('Created At');
    }
    
    const csvRows = [headers.join(',')];
    
    todos.forEach(todo => {
      const row = [
        `"${todo.id}"`,
        `"${todo.text.replace(/"/g, '""')}"`, // Escape quotes
        todo.completed ? 'true' : 'false'
      ];
      
      if (options.includeCreatedDate) {
        row.push(`"${todo.createdAt}"`);
      }
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  private exportAsText(todos: Todo[], options: ExportOptions): string {
    const lines: string[] = [];
    
    if (options.includeMetadata) {
      lines.push(`# ${APP_NAME} Export`);
      lines.push(`Exported: ${new Date().toLocaleString()}`);
      lines.push(`Total todos: ${todos.length}`);
      lines.push('');
    }
    
    todos.forEach((todo, index) => {
      const status = todo.completed ? '✓' : '○';
      const line = `${index + 1}. ${status} ${todo.text}`;
      lines.push(line);
      
      if (options.includeCreatedDate) {
        lines.push(`   Created: ${new Date(todo.createdAt).toLocaleString()}`);
      }
      
      lines.push('');
    });
    
    return lines.join('\n');
  }

  /**
   * Enhanced import with validation and multiple format support
   */
  importData(jsonData: string): TodoActionResult {
    const validation = this.validateImportData(jsonData);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          message: `Import validation failed: ${validation.errors.join(', ')}`,
          code: 'VALIDATION_ERROR'
        }
      };
    }

    try {
      const todos = validation.todos!;
      
      // Create backup before import
      this.createBackup();
      
      return this.saveStorageData({
        version: STORAGE_VERSION,
        todos,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to import data',
          code: 'IMPORT_ERROR'
        }
      };
    }
  }

  /**
   * Validate import data with detailed error reporting
   */
  validateImportData(jsonData: string): ImportValidationResult {
    const result: ImportValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      const parsed = JSON.parse(jsonData);
      
      // Check if it's an enhanced export format
      if (parsed.metadata && parsed.data) {
        return this.validateEnhancedFormat(parsed, result);
      }
      
      // Check if it's a legacy format
      if (parsed.todos && Array.isArray(parsed.todos)) {
        return this.validateLegacyFormat(parsed, result);
      }
      
      result.errors.push('Unrecognized data format');
      return result;
      
    } catch (error) {
      result.errors.push('Invalid JSON format');
      return result;
    }
  }

  private validateEnhancedFormat(data: any, result: ImportValidationResult): ImportValidationResult {
    // Validate metadata
    if (!data.metadata || !data.metadata.appName) {
      result.warnings.push('Missing or incomplete metadata');
    }
    
    // Validate data structure
    if (!data.data || !data.data.todos || !Array.isArray(data.data.todos)) {
      result.errors.push('Invalid data structure: todos array not found');
      return result;
    }
    
    return this.validateTodos(data.data.todos, result);
  }

  private validateLegacyFormat(data: any, result: ImportValidationResult): ImportValidationResult {
    if (!Array.isArray(data.todos)) {
      result.errors.push('Invalid data format: todos must be an array');
      return result;
    }
    
    result.warnings.push('Importing legacy format (no metadata)');
    return this.validateTodos(data.todos, result);
  }

  private validateTodos(todos: any[], result: ImportValidationResult): ImportValidationResult {
    const validTodos: Todo[] = [];
    
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      const todoErrors: string[] = [];
      
      // Validate required fields
      if (!todo.id || typeof todo.id !== 'string') {
        todoErrors.push(`Todo ${i + 1}: missing or invalid id`);
      }
      
      if (!todo.text || typeof todo.text !== 'string' || todo.text.trim().length === 0) {
        todoErrors.push(`Todo ${i + 1}: missing or invalid text`);
      }
      
      if (typeof todo.completed !== 'boolean') {
        todoErrors.push(`Todo ${i + 1}: completed must be boolean`);
      }
      
      if (!todo.createdAt || typeof todo.createdAt !== 'string') {
        todoErrors.push(`Todo ${i + 1}: missing or invalid createdAt`);
      } else {
        // Validate date format
        const date = new Date(todo.createdAt);
        if (isNaN(date.getTime())) {
          todoErrors.push(`Todo ${i + 1}: invalid date format in createdAt`);
        }
      }
      
      if (todoErrors.length > 0) {
        result.errors.push(...todoErrors);
      } else {
        validTodos.push(todo as Todo);
      }
    }
    
    if (result.errors.length === 0) {
      result.isValid = true;
      result.todos = validTodos;
      
      if (validTodos.length !== todos.length) {
        result.warnings.push(`${todos.length - validTodos.length} invalid todos were skipped`);
      }
    }
    
    return result;
  }

  /**
   * Create a backup before importing new data
   */
  createBackup(): string {
    const backup = this.exportData({ includeMetadata: true, prettyPrint: false });
    const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
    
    try {
      localStorage.setItem(backupKey, backup);
      return backupKey;
    } catch (error) {
      console.warn('Failed to create backup:', error);
      return '';
    }
  }

  /**
   * Get list of available backups
   */
  getBackups(): Array<{ key: string; timestamp: number; size: number }> {
    const backups: Array<{ key: string; timestamp: number; size: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY}_backup_`)) {
        const timestamp = parseInt(key.split('_').pop() || '0');
        const data = localStorage.getItem(key);
        const size = data ? new Blob([data]).size : 0;
        
        backups.push({ key, timestamp, size });
      }
    }
    
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Restore from a backup
   */
  restoreFromBackup(backupKey: string): TodoActionResult {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        return {
          success: false,
          error: {
            message: 'Backup not found',
            code: 'BACKUP_NOT_FOUND'
          }
        };
      }
      
      return this.importData(backupData);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to restore from backup',
          code: 'RESTORE_ERROR'
        }
      };
    }
  }

  /**
   * Clean up old backups (keep only the last 5)
   */
  cleanupBackups(): void {
    const backups = this.getBackups();
    const toDelete = backups.slice(5); // Keep only the 5 most recent
    
    toDelete.forEach(backup => {
      try {
        localStorage.removeItem(backup.key);
      } catch (error) {
        console.warn('Failed to delete backup:', backup.key, error);
      }
    });
  }

  getStorageSize(): number {
    if (!this.isAvailable()) return 0;
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? new Blob([data]).size : 0;
    } catch {
      return 0;
    }
  }
}

// Create and export the storage service instance
export const storageService = new LocalStorageService();

// Export the class for testing purposes
export { LocalStorageService };

// Helper functions for component use
export function getTodosFromStorage(): Todo[] {
  return storageService.getTodos();
}

export function saveTodosToStorage(todos: Todo[]): void {
  storageService.saveTodos(todos);
}

export function clearTodosFromStorage(): void {
  storageService.clearTodos();
}

// Browser API utilities and File System Access API integration
export class BrowserFileHandler {
  /**
   * Check if File System Access API is supported
   */
  static isFileSystemAccessSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
  }

  /**
   * Enhanced file save using File System Access API with fallback
   */
  static async saveFile(
    data: string, 
    filename: string, 
    mimeType: string = 'application/json'
  ): Promise<boolean> {
    try {
      if (this.isFileSystemAccessSupported()) {
        // Use modern File System Access API
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Export files',
            accept: {
              [mimeType]: [`.${filename.split('.').pop()}`],
            },
          }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(data);
        await writable.close();
        return true;
      } else {
        // Fallback to traditional download
        return this.fallbackSaveFile(data, filename, mimeType);
      }
    } catch (error) {
      console.warn('File System Access API failed, using fallback:', error);
      return this.fallbackSaveFile(data, filename, mimeType);
    }
  }

  /**
   * Enhanced file read using File System Access API with fallback
   */
  static async openFile(
    acceptedTypes: string[] = ['.json', '.txt', '.csv']
  ): Promise<{ content: string; filename: string } | null> {
    try {
      if (this.isFileSystemAccessSupported()) {
        // Use modern File System Access API
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'Import files',
            accept: {
              'application/json': ['.json'],
              'text/plain': ['.txt'],
              'text/csv': ['.csv'],
            },
          }],
          multiple: false,
        });

        const file = await fileHandle.getFile();
        const content = await file.text();
        return { content, filename: file.name };
      } else {
        // For fallback, we'll rely on the existing file input implementation
        return null;
      }
    } catch (error) {
      console.warn('File System Access API failed:', error);
      return null;
    }
  }

  /**
   * Traditional file download fallback
   */
  private static fallbackSaveFile(data: string, filename: string, mimeType: string): boolean {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Fallback file save failed:', error);
      return false;
    }
  }

  /**
   * Get API capabilities info for UI feedback
   */
  static getApiCapabilities(): {
    fileSystemAccess: boolean;
    dragAndDrop: boolean;
    fileReader: boolean;
  } {
    if (typeof window === 'undefined') {
      return {
        fileSystemAccess: false,
        dragAndDrop: false,
        fileReader: false,
      };
    }
    
    return {
      fileSystemAccess: this.isFileSystemAccessSupported(),
      dragAndDrop: 'DataTransfer' in window,
      fileReader: 'FileReader' in window,
    };
  }
}