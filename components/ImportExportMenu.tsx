'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  Cog6ToothIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface ImportExportMenuProps {
  onImport: () => void;
  onExport: () => void;
  className?: string;
}

export const ImportExportMenu: React.FC<ImportExportMenuProps> = ({
  onImport,
  onExport,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleImport = () => {
    onImport();
    setIsOpen(false);
  };

  const handleExport = () => {
    onExport();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <motion.button
        onClick={toggleMenu}
        className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Import/Export Settings"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
          )}
        </motion.div>
      </motion.button>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Data Management</h3>
              <p className="text-xs text-gray-500 mt-1">Import or export your todos</p>
            </div>
            
            <div className="py-1">
              <motion.button
                onClick={handleImport}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-3 focus:outline-none focus:bg-blue-50"
                whileHover={{ x: 4 }}
              >
                <div className="p-2 bg-green-100 rounded-full">
                  <ArrowDownTrayIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Import Data</div>
                  <div className="text-xs text-gray-500">Load todos from file</div>
                </div>
              </motion.button>
              
              <motion.button
                onClick={handleExport}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-3 focus:outline-none focus:bg-blue-50"
                whileHover={{ x: 4 }}
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <ArrowUpTrayIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Export Data</div>
                  <div className="text-xs text-gray-500">Save todos to file</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 