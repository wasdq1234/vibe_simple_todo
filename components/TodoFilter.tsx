'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTodos } from '@/hooks/useTodos';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TodoFilter as TodoFilterType } from '@/lib/types';

const TodoFilter = memo(() => {
  const { filter, setFilter, todoStats, clearCompleted } = useTodos();
  const prefersReducedMotion = useReducedMotion();

  const filters: { 
    key: TodoFilterType; 
    label: string; 
    count?: number;
    color: string;
  }[] = [
    { key: 'all', label: '전체', count: todoStats.total, color: 'blue' },
    { key: 'active', label: '진행 중', count: todoStats.active, color: 'yellow' },
    { key: 'completed', label: '완료', count: todoStats.completed, color: 'green' },
  ];

  // 성능 최적화를 위한 애니메이션 설정
  const containerVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const buttonVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    whileHover: { 
      scale: 1.02,
      transition: { duration: 0.1 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const statsVariants: Variants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.15 }
    }
  };

  return (
    <motion.div 
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      {...(prefersReducedMotion ? {} : containerVariants)}
      data-testid="filter-container"
    >
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((filterOption) => (
          <motion.button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${filter === filterOption.key
                ? `bg-${filterOption.color}-500 text-white shadow-md focus:ring-${filterOption.color}-500`
                : `bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`
              }
            `}
            aria-label={`${filterOption.label} 할 일 보기${filterOption.count !== undefined ? ` (${filterOption.count}개)` : ''}`}
            aria-pressed={filter === filterOption.key}
            {...(prefersReducedMotion ? {} : buttonVariants)}
          >
            <span className="flex items-center gap-2">
              {filterOption.label}
              <AnimatePresence>
                {filterOption.count !== undefined && (
                  <motion.span
                    key={`${filterOption.key}-${filterOption.count}`}
                    className={`
                      inline-flex items-center justify-center w-5 h-5 text-xs rounded-full
                      ${filter === filterOption.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-300 text-gray-600'
                      }
                    `}
                    initial={!prefersReducedMotion ? { scale: 0, opacity: 0 } : { opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={!prefersReducedMotion ? { scale: 0, opacity: 0 } : { opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                  >
                    {filterOption.count}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            
            {/* Active filter indicator */}
            <AnimatePresence>
              {filter === filterOption.key && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  initial={!prefersReducedMotion ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={!prefersReducedMotion ? { opacity: 0, scale: 0.8 } : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Statistics */}
      <motion.div 
        className="space-y-3"
        {...(prefersReducedMotion ? {} : statsVariants)}
      >
        {/* Todo counts */}
        <motion.div 
          className="flex justify-between text-sm text-gray-600"
          variants={prefersReducedMotion ? undefined : itemVariants}
        >
          <motion.span variants={prefersReducedMotion ? undefined : itemVariants}>
            전체: <span className="font-medium text-gray-800">{todoStats.total}</span>
          </motion.span>
          <motion.span variants={prefersReducedMotion ? undefined : itemVariants}>
            진행 중: <span className="font-medium text-yellow-600">{todoStats.active}</span>
          </motion.span>
          <motion.span variants={prefersReducedMotion ? undefined : itemVariants}>
            완료: <span className="font-medium text-green-600">{todoStats.completed}</span>
          </motion.span>
        </motion.div>

        {/* Progress bar */}
        <motion.div 
          className="space-y-2"
          variants={prefersReducedMotion ? undefined : itemVariants}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">완료율</span>
            <motion.span 
              className="text-sm font-medium text-gray-800"
              key={todoStats.completionPercentage}
              animate={!prefersReducedMotion ? {
                scale: [1, 1.1, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              {todoStats.completionPercentage}%
            </motion.span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            {prefersReducedMotion ? (
              <div
                className="h-full bg-gradient-to-r from-primary-blue to-green-500 rounded-full"
                style={{ width: `${todoStats.completionPercentage}%` }}
              />
            ) : (
              <motion.div
                className="h-full bg-gradient-to-r from-primary-blue to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${todoStats.completionPercentage}%` }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Clear completed button */}
        <AnimatePresence>
          {todoStats.completed > 0 && (
            <motion.div
              initial={!prefersReducedMotion ? { opacity: 0, y: 10, height: 0 } : { opacity: 1 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={!prefersReducedMotion ? { opacity: 0, y: -10, height: 0 } : { opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="pt-2 border-t border-gray-100"
            >
              <motion.button
                onClick={clearCompleted}
                className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label={`완료된 할 일 ${todoStats.completed}개 모두 삭제`}
                whileHover={!prefersReducedMotion ? { 
                  scale: 1.02,
                  transition: { duration: 0.1 }
                } : {}}
                whileTap={!prefersReducedMotion ? { 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                } : {}}
              >
                <motion.span
                  animate={!prefersReducedMotion ? {
                    x: [0, 2, -2, 0],
                    transition: { 
                      duration: 0.4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  } : {}}
                  className="flex items-center justify-center gap-2"
                >
                  🗑️ 완료된 할 일 모두 삭제 ({todoStats.completed})
                </motion.span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

TodoFilter.displayName = 'TodoFilter';

export default TodoFilter;