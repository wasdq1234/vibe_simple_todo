'use client';

import React, { useState } from 'react';
import { 
  TodoForm, 
  TodoList, 
  TodoFilterComponent, 
  ErrorBoundaryWrapper,
  ImportExportMenu,
  ExportModal,
  ImportModal
} from '@/components';
import { LocalStorageService } from '@/lib/storage';
import type { ExportOptions } from '@/lib/storage';

// Initialize storage service
const storageService = new LocalStorageService();

export default function Home() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExport = (options: Partial<ExportOptions>) => {
    return storageService.exportData(options);
  };

  const handleImport = (data: string) => {
    const result = storageService.importData(data);
    if (result.success) {
      // Trigger a page refresh to update the todos
      window.location.reload();
    }
    return result;
  };

  const handleValidateImport = (data: string) => {
    return storageService.validateImportData(data);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Simple Todo App
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            Organize your life with ease. Create, manage, and track your daily tasks efficiently.
          </p>
          
          {/* Import/Export Menu - positioned in top right of header */}
          <div className="absolute top-0 right-0">
            <ImportExportMenu
              onImport={() => setShowImportModal(true)}
              onExport={() => setShowExportModal(true)}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Form and Filter */}
          <div className="lg:col-span-1 space-y-6">
            <ErrorBoundaryWrapper
              fallback={
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">할 일 입력 폼을 불러오는 중 오류가 발생했습니다.</p>
                </div>
              }
            >
              <TodoForm />
            </ErrorBoundaryWrapper>
            
            <ErrorBoundaryWrapper
              fallback={
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">필터 컴포넌트를 불러오는 중 오류가 발생했습니다.</p>
                </div>
              }
            >
              <TodoFilterComponent />
            </ErrorBoundaryWrapper>
          </div>
          
          {/* Right Column - Todo List */}
          <div className="lg:col-span-2">
            <ErrorBoundaryWrapper
              fallback={
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">할 일 목록을 불러오는 중 오류가 발생했습니다.</p>
                </div>
              }
            >
              <TodoList />
            </ErrorBoundaryWrapper>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </footer>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        onValidate={handleValidateImport}
      />
    </main>
  );
}