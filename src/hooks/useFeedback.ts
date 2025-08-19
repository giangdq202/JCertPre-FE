import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  feedbackService, 
  FeedbackDto, 
  CreateFeedbackDto, 
  UpdateFeedbackDto,
  PaginatedFeedbackResponse,
  FeedbackQueryParams
} from '../services/feedbackService';

export const useFeedback = () => {
  // Create feedback
  const createFeedback = async (createData: CreateFeedbackDto): Promise<FeedbackDto | null> => {
    try {
      const feedback = await feedbackService.createFeedback(createData);
      return feedback;
    } catch (err: any) {
      console.error('Failed to create feedback:', err);
      return null;
    }
  };

  // Update feedback
  const updateFeedback = async (feedbackId: string, updateData: UpdateFeedbackDto): Promise<FeedbackDto | null> => {
    try {
      const feedback = await feedbackService.updateFeedback(feedbackId, updateData);
      return feedback;
    } catch (err: any) {
      console.error('Failed to update feedback:', err);
      return null;
    }
  };

  // Delete feedback
  const deleteFeedback = async (feedbackId: string): Promise<boolean> => {
    try {
      await feedbackService.deleteFeedback(feedbackId);
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

// Hook for course feedbacks
export const useCourseFeedbacks = (courseId: string, params?: Omit<FeedbackQueryParams, 'courseId'>) => {
  const [feedbacks, setFeedbacks] = useState<PaginatedFeedbackResponse | null>(null);
  const [averageRating, setAverageRating] = useState<{ averageRating: number; totalFeedbacks: number } | null>(null);
  const [userFeedback, setUserFeedback] = useState<FeedbackDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { userInfo } = useAuth();

  useEffect(() => {
    const loadCourseFeedbacks = async () => {
      if (!courseId) return;

      setLoading(true);
      try {
        // Load course feedbacks
        const feedbacksData = await feedbackService.getFeedbacksByCourseId(courseId, params);
        setFeedbacks(feedbacksData);

        // Load average rating
        const avgRating = await feedbackService.getCourseAverageRating(courseId);
        setAverageRating(avgRating);

        // Load user's feedback for this course (if user is logged in)
        if (userInfo?.id) {
          const userFeedbackData = await feedbackService.getUserFeedbackForCourse(courseId, userInfo.id);
          setUserFeedback(userFeedbackData);
        }
      } catch (err: any) {
        console.error('Failed to load course feedbacks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseFeedbacks();
  }, [courseId, userInfo?.id, refreshTrigger, JSON.stringify(params)]);

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

// Hook for user feedbacks
export const useUserFeedbacks = (userId?: string, params?: Omit<FeedbackQueryParams, 'userId'>) => {
  const [feedbacks, setFeedbacks] = useState<PaginatedFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { userInfo } = useAuth();

  const targetUserId = userId || userInfo?.id;

  useEffect(() => {
    const loadUserFeedbacks = async () => {
      if (!targetUserId) return;

      setLoading(true);
      try {
        const feedbacksData = await feedbackService.getFeedbacksByUserId(targetUserId, params);
        setFeedbacks(feedbacksData);
      } catch (err: any) {
        console.error('Failed to load user feedbacks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserFeedbacks();
  }, [targetUserId, refreshTrigger, JSON.stringify(params)]);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    feedbacks,
    loading,
    refresh
  };
};
