import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  feedbackService, 
  FeedbackDto, 
  CreateFeedbackDto, 
  UpdateFeedbackDto,
  PaginatedFeedbackResponse
} from '../services/feedbackService';

export const useFeedback = () => {
  // Create feedback
  const createFeedback = async (createData: CreateFeedbackDto): Promise<FeedbackDto | null> => {
    try {
      console.log('useFeedback: Creating feedback with data:', createData);
      const feedback = await feedbackService.createFeedback(createData);
      return feedback;
    } catch (err: any) {
      console.error('Failed to create feedback:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      return null;
    }
  };

  // Update feedback (now requires userId and courseId instead of feedbackId)
  const updateFeedback = async (userId: string, courseId: string, updateData: UpdateFeedbackDto): Promise<FeedbackDto | null> => {
    try {
      const feedback = await feedbackService.updateFeedback(userId, courseId, updateData);
      return feedback;
    } catch (err: any) {
      console.error('Failed to update feedback:', err);
      return null;
    }
  };

  // Delete feedback (now requires userId and courseId instead of feedbackId)
  const deleteFeedback = async (userId: string, courseId: string): Promise<boolean> => {
    try {
      await feedbackService.deleteFeedback(userId, courseId);
      return true;
    } catch (err: any) {
      console.error('Failed to delete feedback:', err);
      return false;
    }
  };

  return {
    createFeedback,
    updateFeedback,
    deleteFeedback,
    // Direct service access for other operations
    service: feedbackService
  };
};

// Hook for course feedbacks with automatic loading
export const useCourseFeedbacks = (courseId: string, pageIndex: number = 1, pageSize: number = 10) => {
  const [feedbacks, setFeedbacks] = useState<PaginatedFeedbackResponse | null>(null);
  const [averageRating, setAverageRating] = useState<{ averageRating: number; totalFeedbacks: number } | null>(null);
  const [userFeedback, setUserFeedback] = useState<FeedbackDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { userInfo } = useAuth();
  const userId = useMemo(() => userInfo?.id, [userInfo?.id]); // Memoize to prevent unnecessary re-renders

  useEffect(() => {
    const loadCourseFeedbacks = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load course feedbacks and average rating in parallel
        const [feedbacksData, avgRating] = await Promise.all([
          feedbackService.getFeedbacksByCourseId(courseId, pageIndex, pageSize),
          feedbackService.getCourseAverageRating(courseId)
        ]);

        setFeedbacks(feedbacksData);
        setAverageRating(avgRating);

        // Load user's feedback for this course (if user is logged in)
        if (userId) {
          // Find user feedback from current page first
          let userFeedbackData = feedbacksData.items.find(feedback => feedback.userId === userId);
          
          if (!userFeedbackData && feedbacksData.totalCount > pageSize) {
            // Only search in other pages if user feedback not found in current page and there are more pages
            const foundUserFeedback = await feedbackService.getUserFeedbackForCourse(courseId, userId);
            userFeedbackData = foundUserFeedback || undefined;
          }
          
          setUserFeedback(userFeedbackData || null);
        } else {
          setUserFeedback(null);
        }
      } catch (err: any) {
        console.error('Failed to load course feedbacks:', err);
        // Set empty state on error to prevent infinite loading
        setFeedbacks(null);
        setAverageRating(null);
        setUserFeedback(null);
      } finally {
        setLoading(false);
      }
    };

    loadCourseFeedbacks();
  }, [courseId, userId, refreshTrigger, pageIndex, pageSize]); // Use userId instead of userInfo

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    feedbacks,
    averageRating,
    userFeedback,
    loading,
    refresh
  };
};

// Hook for course feedbacks with lazy loading (load only when explicitly called)
export const useLazyCourseFeedbacks = (courseId: string, pageIndex: number = 1, pageSize: number = 10) => {
  const [feedbacks, setFeedbacks] = useState<PaginatedFeedbackResponse | null>(null);
  const [averageRating, setAverageRating] = useState<{ averageRating: number; totalFeedbacks: number } | null>(null);
  const [userFeedback, setUserFeedback] = useState<FeedbackDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { userInfo } = useAuth();
  const userId = useMemo(() => userInfo?.id, [userInfo?.id]); // Memoize to prevent unnecessary re-renders

  const loadFeedbacks = useCallback(async () => {
    if (!courseId) return;

    console.log('🔄 Loading feedbacks for course:', courseId);
    setLoading(true);
    try {
      // Load course feedbacks and average rating in parallel
      const [feedbacksData, avgRating] = await Promise.all([
        feedbackService.getFeedbacksByCourseId(courseId, pageIndex, pageSize),
        feedbackService.getCourseAverageRating(courseId)
      ]);

      setFeedbacks(feedbacksData);
      setAverageRating(avgRating);

      // Load user's feedback for this course (if user is logged in)
      if (userId) {
        // Find user feedback from current page first
        let userFeedbackData = feedbacksData.items.find(feedback => feedback.userId === userId);
        
        if (!userFeedbackData && feedbacksData.totalCount > pageSize) {
          // Only search in other pages if user feedback not found in current page and there are more pages
          const foundUserFeedback = await feedbackService.getUserFeedbackForCourse(courseId, userId);
          userFeedbackData = foundUserFeedback || undefined;
        }
        
        setUserFeedback(userFeedbackData || null);
      } else {
        setUserFeedback(null);
      }
      
      setHasLoaded(true);
    } catch (err: any) {
      console.error('Failed to load course feedbacks:', err);
      // Set empty state on error
      setFeedbacks(null);
      setAverageRating(null);
      setUserFeedback(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, pageIndex, pageSize, userId]); // Dependencies that should trigger recreation

  const refresh = useCallback(() => {
    console.log('🔄 Refreshing feedbacks manually');
    loadFeedbacks();
  }, [loadFeedbacks]);

  return {
    feedbacks,
    averageRating,
    userFeedback,
    loading,
    hasLoaded,
    loadFeedbacks,
    refresh
  };
};
