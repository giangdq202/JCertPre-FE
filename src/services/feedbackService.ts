import axiosInstance from '../consts/axios/axiosInstance';

// Types
export interface CreateFeedbackDto {
  courseId: string;
  rating?: number;
  comment?: string;
}

export interface FeedbackDto {
  feedbackId: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface UpdateFeedbackDto {
  rating?: number;
  comment?: string;
}

export interface FeedbackQueryParams {
  courseId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedFeedbackResponse {
  items: FeedbackDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// API Service Functions
export const feedbackService = {
  // Create new feedback
  createFeedback: async (createFeedbackDto: CreateFeedbackDto): Promise<FeedbackDto> => {
    const response = await axiosInstance.post<FeedbackDto>('/api/feedbacks', createFeedbackDto);
    return response.data;
  },

  // Get all feedbacks with query parameters
  getFeedbacks: async (params?: FeedbackQueryParams): Promise<PaginatedFeedbackResponse> => {
    const response = await axiosInstance.get<PaginatedFeedbackResponse>('/api/feedbacks', { params });
    return response.data;
  },

  // Get feedback by ID
  getFeedbackById: async (feedbackId: string): Promise<FeedbackDto> => {
    const response = await axiosInstance.get<FeedbackDto>(`/api/feedbacks/${feedbackId}`);
    return response.data;
  },

  // Get feedbacks by course ID
  getFeedbacksByCourseId: async (courseId: string, params?: Omit<FeedbackQueryParams, 'courseId'>): Promise<PaginatedFeedbackResponse> => {
    const queryParams = { ...params, courseId };
    const response = await axiosInstance.get<PaginatedFeedbackResponse>('/api/feedbacks', { params: queryParams });
    return response.data;
  },

  // Get feedbacks by user ID
  getFeedbacksByUserId: async (userId: string, params?: Omit<FeedbackQueryParams, 'userId'>): Promise<PaginatedFeedbackResponse> => {
    const queryParams = { ...params, userId };
    const response = await axiosInstance.get<PaginatedFeedbackResponse>('/api/feedbacks', { params: queryParams });
    return response.data;
  },

  // Update feedback
  updateFeedback: async (feedbackId: string, updateFeedbackDto: UpdateFeedbackDto): Promise<FeedbackDto> => {
    const response = await axiosInstance.put<FeedbackDto>(`/api/feedbacks/${feedbackId}`, updateFeedbackDto);
    return response.data;
  },

  // Delete feedback
  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await axiosInstance.delete(`/api/feedbacks/${feedbackId}`);
  },

  // Get average rating for a course
  getCourseAverageRating: async (courseId: string): Promise<{ averageRating: number; totalFeedbacks: number }> => {
    const response = await axiosInstance.get<{ averageRating: number; totalFeedbacks: number }>(`/api/feedbacks/course/${courseId}/average-rating`);
    return response.data;
  },

  // Get user's feedback for a specific course
  getUserFeedbackForCourse: async (courseId: string, userId: string): Promise<FeedbackDto | null> => {
    try {
      const response = await axiosInstance.get<FeedbackDto>(`/api/feedbacks/course/${courseId}/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null; // User hasn't given feedback for this course yet
      }
      throw error;
    }
  }
};

// Individual export functions for backward compatibility
export const createFeedback = feedbackService.createFeedback;
export const getFeedbacks = feedbackService.getFeedbacks;
export const getFeedbackById = feedbackService.getFeedbackById;
export const getFeedbacksByCourseId = feedbackService.getFeedbacksByCourseId;
export const getFeedbacksByUserId = feedbackService.getFeedbacksByUserId;
export const updateFeedback = feedbackService.updateFeedback;
export const deleteFeedback = feedbackService.deleteFeedback;
export const getCourseAverageRating = feedbackService.getCourseAverageRating;
export const getUserFeedbackForCourse = feedbackService.getUserFeedbackForCourse;

export default feedbackService;
