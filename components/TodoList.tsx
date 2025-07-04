'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodos } from '@/hooks/useTodos';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import TodoItem from './TodoItem';

interface TodoListProps {
  className?: string;
}

const TodoList = memo<TodoListProps>(({ 
  className = ""
}) => {
  const { filteredTodos, isLoading, error, filter, todoStats } = useTodos();
  const prefersReducedMotion = useReducedMotion();
  
  // 성능 최적화를 위한 애니메이션 설정
  const containerVariants = prefersReducedMotion ? {} : {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const listVariants = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = prefersReducedMotion ? {} : {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      x: 10,
      transition: { duration: 0.15 }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div 
        className={`space-y-4 ${className}`}
        initial={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        data-testid="loading-indicator"
        role="status"
        aria-label="할 일 목록을 불러오는 중..."
      >
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            className={`bg-gray-100 h-16 rounded-lg ${prefersReducedMotion ? 'motion-reduce:animate-none' : ''}`}
            animate={!prefersReducedMotion ? {
              opacity: [0.5, 1, 0.5],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }
            } : {}}
            data-testid="loading-skeleton"
          />
        ))}
        <span className="sr-only">할 일 목록을 불러오고 있습니다...</span>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        className={`text-center py-8 ${className}`}
        initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: !prefersReducedMotion ? [0, -2, 2, -2, 0] : 0
        }}
        transition={{ 
          opacity: { duration: prefersReducedMotion ? 0 : 0.3 },
          x: { 
            duration: prefersReducedMotion ? 0 : 0.4, 
            delay: prefersReducedMotion ? 0 : 0.1 
          }
        }}
        role="alert"
        data-testid="error-state"
      >
        <p className="text-red-500 text-lg font-medium">⚠️ 오류가 발생했습니다</p>
        <p className="text-gray-600 mt-2">{error}</p>
      </motion.div>
    );
  }

  // Empty state
  if (filteredTodos.length === 0) {
    const getEmptyMessage = () => {
      switch (filter) {
        case 'active':
          return todoStats.total === 0 
            ? "아직 할 일이 없습니다. 새로운 할 일을 추가해보세요!"
            : "모든 할 일을 완료했습니다! 🎉";
        case 'completed':
          return "완료된 할 일이 없습니다.";
        default:
          return "아직 할 일이 없습니다. 새로운 할 일을 추가해보세요!";
      }
    };

    return (
      <motion.div 
        className={`text-center py-12 ${className}`}
        initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : { opacity: 1 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: !prefersReducedMotion ? [1, 1.02, 1] : 1,
          rotate: !prefersReducedMotion ? [0, 1, -1, 0] : 0
        }}
        transition={{ 
          opacity: { duration: prefersReducedMotion ? 0 : 0.4 },
          y: { duration: prefersReducedMotion ? 0 : 0.4 },
          scale: { 
            duration: prefersReducedMotion ? 0 : 2, 
            repeat: Infinity, 
            repeatType: "reverse" 
          },
          rotate: { 
            duration: prefersReducedMotion ? 0 : 3, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }
        }}
        data-testid="empty-state"
      >
        <motion.div
          animate={!prefersReducedMotion ? {
            y: [-2, 2, -2],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          } : {}}
          className="text-6xl mb-4"
        >
          {filter === 'completed' ? '📝' : todoStats.total === 0 ? '✨' : '🎉'}
        </motion.div>
        <p className="text-gray-500 text-lg">
          {getEmptyMessage()}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`space-y-2 ${className}`}
      {...containerVariants}
    >
      {/* Statistics */}
      <motion.div 
        className="mb-6 p-4 bg-gray-50 rounded-lg"
        initial={!prefersReducedMotion ? { opacity: 0, y: -10 } : { opacity: 1 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">진행률</span>
          <span className="text-sm font-medium text-gray-800">
            {todoStats.completed}/{todoStats.total} 완료
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary-blue rounded-full"
            initial={!prefersReducedMotion ? { width: 0 } : { width: `${todoStats.completionPercentage}%` }}
            animate={{ width: `${todoStats.completionPercentage}%` }}
            transition={{ 
              duration: prefersReducedMotion ? 0 : 0.6, 
              ease: "easeOut" 
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {todoStats.completionPercentage}% 완료
        </p>
      </motion.div>

      {/* Todo list */}
      <motion.ul 
        className="space-y-2" 
        role="list"
        aria-label="할 일 목록"
        {...listVariants}
      >
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              {...itemVariants}
              layout={!prefersReducedMotion}
            >
              <TodoItem todo={todo} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Filter status message */}
      {filter !== 'all' && (
        <motion.p 
          className="text-center text-sm text-gray-500 mt-4"
          initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotate: !prefersReducedMotion ? [0, 0.5, -0.5, 0] : 0
          }}
          transition={{ 
            opacity: { duration: prefersReducedMotion ? 0 : 0.3 },
            rotate: { 
              duration: prefersReducedMotion ? 0 : 1, 
              delay: prefersReducedMotion ? 0 : 0.2 
            }
          }}
        >
          {filter === 'active' ? '진행 중인' : '완료된'} 할 일 {filteredTodos.length}개를 표시 중입니다.
        </motion.p>
      )}
    </motion.div>
  );
});

TodoList.displayName = 'TodoList';

export default TodoList;