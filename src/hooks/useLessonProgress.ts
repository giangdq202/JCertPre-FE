import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getLessonProgressByUserAndCourse,
  getLessonProgressByUserAndLesson,
  createLessonProgress,
  createLessonProgressWithCourse,
  updateLessonProgress,
  deleteLessonProgress,
  getUserCourseCompletionRate,
  isLessonCompleted as isLessonCompletedService,
  getLessonCompletionRate as getLessonCompletionRateService,
  markLessonAsCompleted as markLessonAsCompletedService,
  updateLessonProgressRate as updateLessonProgressRateService,
} from '../services/lessonProgressService';
import {
  hasUserPassedTest,
  getUserPassedTestIds,
  canUserProceedToNextLesson,
  getTestCompletionSummary
} from '../services/testCompletionService';
import {
  type LessonProgressDto,
  type CreateLessonProgressDto,
  type UpdateLessonProgressDto,
  type CreateLessonProgressWithCourseDto,
  validateLessonProgressCreateDto,
  validateLessonProgressUpdateDto
} from '../types/lessonProgress.types';

export const useLessonProgress = () => {
  const { userInfo, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to check if user is authenticated
  const checkAuth = useCallback(() => {
    if (authLoading) {
      console.warn('Authentication is still loading');
      return false;
    }
    if (!userInfo?.id) {
      console.warn('User not authenticated or userInfo not loaded yet');
      return false;
    }
    return true;
  }, [userInfo?.id, authLoading]);

  // Get all lesson progress for a user in a course
  const getProgressByUserAndCourse = useCallback(async (
    courseId: string
  ): Promise<LessonProgressDto[]> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await getLessonProgressByUserAndCourse(userInfo!.id, courseId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get lesson progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, checkAuth]);

  // Get lesson progress for a specific lesson
  const getProgressByUserAndLesson = useCallback(async (
    lessonId: string
  ): Promise<LessonProgressDto | null> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await getLessonProgressByUserAndLesson(userInfo!.id, lessonId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get lesson progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, checkAuth]);

  // Create lesson progress
  const createProgress = useCallback(async (
    lessonId: string,
    courseId?: string
  ): Promise<LessonProgressDto> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      if (courseId) {
        // Use legacy function with courseId for backward compatibility
        const createDto: CreateLessonProgressWithCourseDto = {
          userId: userInfo!.id,
          lessonId,
          courseId,
        };
        
        const result = await createLessonProgressWithCourse(createDto);
        return result;
      } else {
        // Use new backend DTO structure
        const createDto: CreateLessonProgressDto = {
          userId: userInfo!.id,
          lessonId,
        };
        
        // Validate before sending
        const validation = validateLessonProgressCreateDto(createDto);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.message}`);
        }
        
        const result = await createLessonProgress(createDto);
        return result;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create lesson progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, checkAuth]);

  // Update lesson progress
  const updateProgress = useCallback(async (
    progressId: string,
    completionRate: number
  ): Promise<LessonProgressDto> => {
    setLoading(true);
    setError(null);
    
    try {
      const updateDto: UpdateLessonProgressDto = {
        completionRate,
      };
      
      // Validate before sending
      const validation = validateLessonProgressUpdateDto(updateDto);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.message}`);
      }
      
      const result = await updateLessonProgress(progressId, updateDto);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update lesson progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete lesson progress
  const deleteProgress = useCallback(async (progressId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteLessonProgress(progressId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete lesson progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get course completion rate
  const getCourseCompletionRate = useCallback(async (
    courseId: string
  ): Promise<number> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserCourseCompletionRate(userInfo!.id, courseId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get course completion rate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, checkAuth]);

  // Check if lesson is completed
  const checkLessonCompleted = useCallback(async (
    lessonId: string
  ): Promise<boolean> => {
    if (!checkAuth()) {
      console.warn('User not authenticated, returning false for lesson completion check');
      return false;
    }

    try {
      const result = await isLessonCompletedService(userInfo!.id, lessonId);
      return result;
    } catch (err: any) {
      console.error('Check lesson completed error:', err);
      return false;
    }
  }, [userInfo?.id, checkAuth]);

  // Get lesson completion rate
  const getLessonCompletionRate = useCallback(async (
    lessonId: string
  ): Promise<number> => {
    if (!checkAuth()) {
      console.warn('User not authenticated, returning 0 for lesson completion rate');
      return 0;
    }

    try {
      const result = await getLessonCompletionRateService(userInfo!.id, lessonId);
      return result;
    } catch (err: any) {
      console.error('Get lesson completion rate error:', err);
      return 0;
    }
  }, [userInfo?.id, checkAuth]);

  // Mark lesson as completed
  const markLessonCompleted = useCallback(async (
    lessonId: string,
    courseId: string
  ): Promise<LessonProgressDto> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await markLessonAsCompletedService(userInfo!.id, lessonId, courseId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark lesson as completed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, checkAuth]);

  // Update lesson progress rate
  const updateLessonProgressRate = useCallback(async (
    lessonId: string,
    courseId: string,
    completionRate: number
  ): Promise<LessonProgressDto> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await updateLessonProgressRateService(userInfo!.id, lessonId, courseId, completionRate);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update lesson progress rate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, checkAuth]);

  // Check if user has passed a specific test
  const checkTestPassed = useCallback(async (testId: string): Promise<boolean> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    try {
      return await hasUserPassedTest(userInfo!.id, testId);
    } catch (err: any) {
      console.error('Failed to check test completion:', err);
      return false;
    }
  }, [userInfo?.id, checkAuth]);

  // Get all passed test IDs for user
  const getPassedTestIds = useCallback(async (): Promise<Set<string>> => {
    if (!checkAuth()) {
      return new Set();
    }

    try {
      return await getUserPassedTestIds(userInfo!.id);
    } catch (err: any) {
      console.error('Failed to get passed test IDs:', err);
      return new Set();
    }
  }, [userInfo?.id, checkAuth]);

  // Check if user can proceed to next lesson
  const checkCanProceedToNextLesson = useCallback(async (testId?: string): Promise<boolean> => {
    if (!checkAuth()) {
      return false;
    }

    try {
      return await canUserProceedToNextLesson(userInfo!.id, testId);
    } catch (err: any) {
      console.error('Failed to check lesson progression:', err);
      return false;
    }
  }, [userInfo?.id, checkAuth]);

  // Get test completion summary for multiple tests
  const getTestCompletionSummaryForUser = useCallback(async (testIds: string[]): Promise<Map<string, boolean>> => {
    if (!checkAuth()) {
      return new Map();
    }

    try {
      return await getTestCompletionSummary(userInfo!.id, testIds);
    } catch (err: any) {
      console.error('Failed to get test completion summary:', err);
      return new Map();
    }
  }, [userInfo?.id, checkAuth]);

  return {
    loading,
    error,
    clearError,
    getProgressByUserAndCourse,
    getProgressByUserAndLesson,
    createProgress,
    updateProgress,
    deleteProgress,
    getCourseCompletionRate,
    checkLessonCompleted,
    getLessonCompletionRate,
    markLessonCompleted,
    updateLessonProgressRate,
    // New test completion functions
    checkTestPassed,
    getPassedTestIds,
    checkCanProceedToNextLesson,
    getTestCompletionSummaryForUser,
  };
}; 