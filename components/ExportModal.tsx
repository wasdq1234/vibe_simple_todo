'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon,
  CheckIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { ExportOptions, ExportFormat, BrowserFileHandler } from '@/lib/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: Partial<ExportOptions>) => string;
  className?: string;
}

const formatIcons = {
  json: CodeBracketIcon,
  csv: DocumentChartBarIcon,
  txt: DocumentTextIcon,
};

const formatLabels = {
  json: 'JSON',
  csv: 'CSV',
  txt: 'Text',
};

const formatDescriptions = {
  json: 'Structured data with metadata',
  csv: 'Spreadsheet-compatible format',
  txt: 'Human-readable text format',
};

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  className = ''
}) => {
  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    format: 'json',
    includeMetadata: true,
    includeCompleted: true,
    includeCreatedDate: true,
    prettyPrint: true,
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const data = onExport(exportOptions);
      const filename = `todos-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      const mimeType = exportOptions.format === 'json' ? 'application/json' : 'text/plain';
      
      // Use enhanced file handling with File System Access API
      const success = await BrowserFileHandler.saveFile(data, filename, mimeType);
      
      if (success) {
        onClose();
      } else {
        console.error('Export failed: File save operation was cancelled or failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-xl shadow-2xl w-full max-w-md ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Export Todos</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose your export options</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(formatIcons) as ExportFormat[]).map((format) => {
                      const Icon = formatIcons[format];
                      const isSelected = exportOptions.format === format;
                      
                      return (
                        <motion.button
                          key={format}
                          onClick={() => handleOptionChange('format', format)}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${
                            isSelected ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                          <div className={`text-sm font-medium ${
                            isSelected ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {formatLabels[format]}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDescriptions[format]}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Export Options
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'includeMetadata', label: 'Include metadata', description: 'App info and export timestamp' },
                      { key: 'includeCompleted', label: 'Include completed todos', description: 'Export finished tasks too' },
                      { key: 'includeCreatedDate', label: 'Include creation dates', description: 'When each todo was created' },
                      { key: 'prettyPrint', label: 'Pretty format', description: 'Human-readable formatting' },
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-start space-x-3">
                        <button
                          onClick={() => handleOptionChange(key as keyof ExportOptions, !(exportOptions as any)[key])}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            (exportOptions as any)[key]
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {(exportOptions as any)[key] && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            {label}
                          </label>
                          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    isExporting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                  whileHover={!isExporting ? { scale: 1.02 } : {}}
                  whileTap={!isExporting ? { scale: 0.98 } : {}}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 