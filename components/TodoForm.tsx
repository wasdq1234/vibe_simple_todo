'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTodos } from '@/hooks/useTodos';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TodoFormProps, TodoFormData } from '@/lib/types';

// Validation schema using zod
const todoFormSchema = z.object({
  text: z
    .string()
    .min(1, '할 일을 입력해주세요')
    .max(500, '500자 이하로 입력해주세요')
    .refine(
      (text) => text.trim().length > 0,
      '빈 공간만으로는 할 일을 추가할 수 없습니다'
    ),
});

const TodoForm = memo<TodoFormProps>(({ 
  placeholder = "What needs to be done?",
  className = ""
}) => {
  const { addTodo, error, clearError, isLoading } = useTodos();
  const prefersReducedMotion = useReducedMotion();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setFocus,
    formState: { errors, isSubmitting }
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      text: ''
    }
  });

  const watchedText = watch('text', '');
  const textLength = watchedText.length;
  
  const onSubmit = async (data: TodoFormData) => {
    try {
      // Clear any existing errors
      clearError();
      
      // Add the todo
      addTodo(data.text.trim());
      
      // Reset the form
      reset();
      
      // Keep focus on the input for continuous adding
      setTimeout(() => setFocus('text'), 0);
    } catch (err) {
      // Error is handled by the useTodos hook
      console.error('Error adding todo:', err);
      // Focus back to input on error
      setTimeout(() => setFocus('text'), 0);
    }
  };

  // Focus on input when there are form validation errors
  React.useEffect(() => {
    if (errors.text) {
      setFocus('text');
    }
  }, [errors.text, setFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  // 성능 최적화를 위한 애니메이션 설정
  const formVariants = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  };

  const buttonVariants = prefersReducedMotion ? {} : {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  };

  return (
    <motion.div 
      className={`mb-6 ${className}`}
      {...formVariants}
    >
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-4"
        role="form"
        aria-label="새로운 할 일 추가 폼"
        aria-describedby="form-description"
      >
        <p id="form-description" className="sr-only">
          할 일을 입력하고 Enter 키를 누르거나 추가 버튼을 클릭하여 새로운 할 일을 추가할 수 있습니다. 최대 500자까지 입력 가능합니다.
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <motion.input
              {...register('text')}
              type="text"
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className={`todo-input w-full ${
                errors.text ? 'border-red-500 focus:border-red-500' : ''
              }`}
              autoFocus
              aria-label="새로운 할 일 입력"
              aria-describedby={`form-description ${errors.text ? 'text-error' : textLength > 450 ? 'text-help' : ''}`}
              disabled={isLoading || isSubmitting}
              animate={!prefersReducedMotion && errors.text ? { 
                x: [-2, 2, -2, 2, 0], 
                transition: { duration: 0.3 }
              } : {}}
              whileFocus={!prefersReducedMotion ? { 
                scale: 1.01,
                transition: { duration: 0.1 }
              } : {}}
            />
            
            {/* Character count indicator */}
            <AnimatePresence>
              {textLength > 450 && (
                <motion.p 
                  id="text-help" 
                  className="text-sm text-warning-orange mt-1"
                  aria-live="polite"
                  initial={!prefersReducedMotion ? { opacity: 0, height: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={!prefersReducedMotion ? { opacity: 0, height: 0 } : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                >
                  {500 - textLength}자 남음
                </motion.p>
              )}
            </AnimatePresence>
            
            {/* Error message */}
            <AnimatePresence>
              {errors.text && (
                <motion.p 
                  id="text-error" 
                  className="text-sm text-red-500 mt-1" 
                  role="alert"
                  aria-live="assertive"
                  initial={!prefersReducedMotion ? { opacity: 0, y: -5 } : { opacity: 1 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={!prefersReducedMotion ? { opacity: 0, y: -5 } : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                >
                  {errors.text.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            type="submit"
            disabled={isLoading || isSubmitting || textLength === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
            aria-label="할 일 추가"
            {...buttonVariants}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="submitting"
                  initial={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
                  className="flex items-center"
                >
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={!prefersReducedMotion ? { rotate: 360 } : {}}
                    transition={!prefersReducedMotion ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  />
                  추가 중...
                </motion.div>
              ) : (
                <motion.span
                  key="normal"
                  initial={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
                >
                  추가
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Global error message from useTodos */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200" 
              role="alert"
              aria-live="assertive"
              initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={!prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            >
              <div className="flex items-start">
                <motion.div
                  initial={!prefersReducedMotion ? { rotate: 0 } : {}}
                  animate={!prefersReducedMotion ? { rotate: [0, -3, 3, -3, 0] } : {}}
                  transition={!prefersReducedMotion ? { duration: 0.4, delay: 0.1 } : {}}
                  className="flex-shrink-0 mr-2"
                >
                  ⚠️
                </motion.div>
                <div className="flex-1">
                  {error}
                  <motion.button
                    type="button"
                    onClick={clearError}
                    className="ml-2 text-red-700 hover:text-red-800 underline"
                    aria-label="오류 메시지 닫기"
                    whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
                    whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
                  >
                    닫기
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
});

TodoForm.displayName = 'TodoForm';

export default TodoForm;