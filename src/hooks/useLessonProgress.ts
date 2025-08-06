import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getLessonProgressByUserAndCourse,
  getLessonProgressByUserAndLesson,
  createLessonProgress,
  updateLessonProgress,
  deleteLessonProgress,
  getUserCourseCompletionRate,
  isLessonCompleted as isLessonCompletedService,
  getLessonCompletionRate as getLessonCompletionRateService,
  markLessonAsCompleted as markLessonAsCompletedService,
  updateLessonProgressRate as updateLessonProgressRateService,
  type LessonProgressDto,
  type CreateLessonProgressDto,
  type UpdateLessonProgressDto,
} from '../services/lessonProgressService';

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
    courseId: string
  ): Promise<LessonProgressDto> => {
    if (!checkAuth()) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const createDto: CreateLessonProgressDto = {
        userId: userInfo!.id,
        lessonId,
        courseId,
      };
      
      const result = await createLessonProgress(createDto);
      return result;
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
  };
}; 