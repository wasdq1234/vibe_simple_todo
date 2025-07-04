'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodos } from '@/hooks/useTodos';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Todo } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
}

const TodoItem = memo<TodoItemProps>(({ todo }) => {
  const { toggleTodo, deleteTodo, editTodo } = useTodos();
  const prefersReducedMotion = useReducedMotion();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== todo.text) {
      editTodo(todo.id, trimmedText);
    }
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteTodo(todo.id);
    } else {
      setShowDeleteConfirm(true);
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleToggle = () => {
    toggleTodo(todo.id);
  };

  // 성능 최적화를 위한 애니메이션 설정
  const itemVariants = prefersReducedMotion ? {} : {
    layout: true,
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { duration: 0.15 }
    },
    whileHover: { 
      scale: 1.01,
      transition: { duration: 0.1 }
    }
  };

  const checkboxVariants = prefersReducedMotion ? {} : {
    whileTap: { scale: 0.9 },
    whileHover: { scale: 1.1 },
    transition: { duration: 0.1 }
  };

  return (
    <motion.li
      className={`todo-item group ${todo.completed ? 'completed' : ''}`}
      data-testid={`todo-item-${todo.id}`}
      {...itemVariants}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <motion.button
          type="button"
          onClick={handleToggle}
          className="flex-shrink-0 w-6 h-6 border-2 border-primary-blue rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-primary-blue/10 focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
          aria-label={todo.completed ? '할 일을 미완료로 표시' : '할 일을 완료로 표시'}
          role="checkbox"
          aria-checked={todo.completed}
          {...checkboxVariants}
        >
          <AnimatePresence>
            {todo.completed && (
              <motion.div
                initial={!prefersReducedMotion ? { scale: 0, rotate: 0 } : { scale: 1 }}
                animate={{ 
                  scale: 1, 
                  rotate: 360,
                  transition: { duration: prefersReducedMotion ? 0 : 0.2 }
                }}
                exit={!prefersReducedMotion ? { 
                  scale: 0, 
                  transition: { duration: 0.1 }
                } : { scale: 0 }}
                className="text-white bg-primary-blue rounded-full w-full h-full flex items-center justify-center text-xs"
              >
                ✓
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Todo Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={!prefersReducedMotion ? { opacity: 0, scale: 0.98 } : { opacity: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={!prefersReducedMotion ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className="flex items-center gap-2"
              >
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                  aria-label="할 일 텍스트 편집"
                />
                <div className="flex items-center gap-1">
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    aria-label="수정 저장"
                    whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
                    whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
                  >
                    저장
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                    aria-label="수정 취소"
                    whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
                    whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
                  >
                    취소
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={!prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className="relative"
              >
                <p
                  className={`break-words ${
                    todo.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-800'
                  }`}
                  data-testid={`todo-text-${todo.id}`}
                >
                  {todo.text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  생성: {formatDate(todo.createdAt)}
                </p>
                
                {/* Completion overlay effect */}
                <AnimatePresence>
                  {todo.completed && (
                    <motion.div
                      initial={!prefersReducedMotion ? { scaleX: 0 } : { scaleX: 1 }}
                      animate={{ scaleX: 1 }}
                      exit={!prefersReducedMotion ? { scaleX: 0 } : { scaleX: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                      className="absolute inset-0 bg-primary-blue/5 rounded"
                      style={{ originX: 0 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <motion.div 
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={!prefersReducedMotion ? { x: 10 } : {}}
            animate={!prefersReducedMotion ? { x: 0 } : {}}
            transition={!prefersReducedMotion ? { 
              staggerChildren: 0.05, 
              delayChildren: 0.1 
            } : {}}
          >
            <motion.button
              type="button"
              onClick={handleEdit}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="할 일 수정"
              whileHover={!prefersReducedMotion ? { 
                scale: 1.1, 
                rotate: 5,
                transition: { duration: 0.1 }
              } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.9 } : {}}
            >
              ✏️
            </motion.button>
            <motion.button
              type="button"
              onClick={handleDelete}
              className={`p-1 rounded focus:outline-none focus:ring-2 transition-colors duration-200 ${
                showDeleteConfirm
                  ? 'text-red-700 bg-red-100 focus:ring-red-500/30'
                  : 'text-red-500 hover:text-red-700 hover:bg-red-50 focus:ring-red-500/30'
              }`}
              aria-label={showDeleteConfirm ? '삭제 확인' : '할 일 삭제'}
              whileHover={!prefersReducedMotion ? { 
                scale: 1.1, 
                rotate: showDeleteConfirm ? 0 : -5,
                transition: { duration: 0.1 }
              } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.9 } : {}}
            >
              {showDeleteConfirm ? '확인' : '🗑️'}
            </motion.button>
            {showDeleteConfirm && (
              <motion.button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                aria-label="삭제 취소"
                initial={!prefersReducedMotion ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={!prefersReducedMotion ? { scale: 1.1 } : {}}
                whileTap={!prefersReducedMotion ? { scale: 0.9 } : {}}
              >
                ❌
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.li>
  );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;