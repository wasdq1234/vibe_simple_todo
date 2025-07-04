'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowUpTrayIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { ImportValidationResult, BrowserFileHandler } from '@/lib/storage';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: string) => { success: boolean; error?: any; data?: any };
  onValidate: (data: string) => ImportValidationResult;
  className?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onValidate,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiCapabilities, setApiCapabilities] = useState({
    fileSystemAccess: false,
    dragAndDrop: false,
    fileReader: false,
  });

  // Detect API capabilities on client side only
  useEffect(() => {
    setApiCapabilities(BrowserFileHandler.getApiCapabilities());
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValidation(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const validationResult = onValidate(content);
      setValidation(validationResult);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleEnhancedFileOpen = async () => {
    try {
      const result = await BrowserFileHandler.openFile();
      if (result) {
        // Create a fake File object for compatibility with existing validation flow
        const fakeFile = new File([result.content], result.filename, { type: 'text/plain' });
        setSelectedFile(fakeFile);
        
        const validationResult = onValidate(result.content);
        setValidation(validationResult);
      }
    } catch (error) {
      console.error('Enhanced file open failed:', error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validation?.isValid) return;
    
    setIsImporting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = onImport(content);
        
        if (result.success) {
          onClose();
          // Reset state
          setSelectedFile(null);
          setValidation(null);
        }
        setIsImporting(false);
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Import failed:', error);
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setValidation(null);
    setIsImporting(false);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
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
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-xl shadow-2xl w-full max-w-lg ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Import Todos</h2>
                  <p className="text-sm text-gray-500 mt-1">Upload a file to import your todos</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* File Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : selectedFile
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.txt,.csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-3">
                      <DocumentIcon className="w-12 h-12 text-green-500 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-blue-600 hover:text-blue-700 underline"
                        >
                          Choose different file
                        </button>
                        {apiCapabilities.fileSystemAccess && (
                          <button
                            onClick={handleEnhancedFileOpen}
                            className="text-sm text-green-600 hover:text-green-700 underline"
                          >
                            Browse files
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CloudArrowUpIcon className={`w-12 h-12 mx-auto ${
                        dragActive ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer"
                        >
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Upload a file
                          </span>
                          <span className="text-sm text-gray-500"> or drag and drop</span>
                        </label>
                        {apiCapabilities.fileSystemAccess && (
                          <div className="mt-3">
                            <button
                              onClick={handleEnhancedFileOpen}
                              className="inline-flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            >
                              <DocumentIcon className="w-4 h-4 mr-1" />
                              Browse Files (Enhanced)
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        JSON, TXT, or CSV files only
                        {apiCapabilities.fileSystemAccess && (
                          <span className="block text-green-600 mt-1">
                            ✨ Enhanced file picker available
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Validation Results */}
                {validation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      validation.isValid
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {validation.isValid ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          validation.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {validation.isValid ? 'File is valid!' : 'Validation failed'}
                        </h4>
                        
                        {validation.isValid && validation.todos && (
                          <p className="text-sm text-green-700 mt-1">
                            Found {validation.todos.length} valid todo{validation.todos.length !== 1 ? 's' : ''}
                          </p>
                        )}
                        
                        {validation.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-red-700 font-medium">Errors:</p>
                            <ul className="list-disc list-inside text-sm text-red-600 mt-1 space-y-0.5">
                              {validation.errors.slice(0, 3).map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                              {validation.errors.length > 3 && (
                                <li>... and {validation.errors.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {validation.warnings.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-yellow-700 font-medium">Warnings:</p>
                            <ul className="list-disc list-inside text-sm text-yellow-600 mt-1 space-y-0.5">
                              {validation.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleImport}
                  disabled={!validation?.isValid || isImporting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    !validation?.isValid || isImporting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                  whileHover={validation?.isValid && !isImporting ? { scale: 1.02 } : {}}
                  whileTap={validation?.isValid && !isImporting ? { scale: 0.98 } : {}}
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  <span>{isImporting ? 'Importing...' : 'Import'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 