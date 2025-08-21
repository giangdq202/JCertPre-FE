import axiosInstance from '../consts/axios/axiosInstance';

// Types
export interface CreateFeedbackDto {
  userId: string;
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
  userFullName?: string;     // Add this
  userAvatarUrl?: string;    // Add this
}

export interface UpdateFeedbackDto {
  rating?: number;
  comment?: string;
}

export interface PaginatedFeedbackResponse {
  items: FeedbackDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

// API Service Functions
export const feedbackService = {
  // Create new feedback
  createFeedback: async (createFeedbackDto: CreateFeedbackDto): Promise<FeedbackDto> => {
    console.log('Creating feedback with data:', createFeedbackDto);
    const response = await axiosInstance.post<FeedbackDto>('/feedbacks', createFeedbackDto);
    return response.data;
  },

  // Get feedbacks by course ID with pagination (matches backend API)
  getFeedbacksByCourseId: async (
    courseId: string, 
    pageIndex: number = 1, 
    pageSize: number = 10
  ): Promise<PaginatedFeedbackResponse> => {
    const response = await axiosInstance.get<PaginatedFeedbackResponse>(
      `/feedbacks/course/${courseId}`,
      { params: { pageIndex, pageSize } }
    );
    return response.data;
  },

  // Update feedback by userId and courseId (matches backend API)
  updateFeedback: async (
    userId: string, 
    courseId: string, 
    updateFeedbackDto: UpdateFeedbackDto
  ): Promise<FeedbackDto> => {
    const response = await axiosInstance.put<FeedbackDto>(
      `/feedbacks/${userId}/${courseId}`, 
      updateFeedbackDto
    );
    return response.data;
  },

  // Delete feedback by userId and courseId (matches backend API)
  deleteFeedback: async (userId: string, courseId: string): Promise<void> => {
    await axiosInstance.delete(`/feedbacks/${userId}/${courseId}`);
  },

  // Get average rating for a course
  getCourseAverageRating: async (courseId: string): Promise<{ averageRating: number; totalFeedbacks: number } | number> => {
    const response = await axiosInstance.get(`/feedbacks/course/${courseId}/average-rating`);
    return response.data;
  },

  // Get user's feedback for a specific course (optimized - search in smaller chunks)
  getUserFeedbackForCourse: async (courseId: string, userId: string): Promise<FeedbackDto | null> => {
    try {
      // Search through pages of feedbacks to find user's feedback
      // Start with recent feedbacks (page 1) and search in smaller chunks
      let pageIndex = 1;
      const pageSize = 20; // Smaller page size for efficiency
      let foundFeedback: FeedbackDto | null = null;
      
      while (!foundFeedback && pageIndex <= 5) { // Limit search to first 5 pages (100 feedbacks)
        const feedbacks = await feedbackService.getFeedbacksByCourseId(courseId, pageIndex, pageSize);
        foundFeedback = feedbacks.items.find(feedback => feedback.userId === userId) || null;
        
        if (foundFeedback || feedbacks.items.length < pageSize) {
          // Found feedback or reached last page
          break;
        }
        
        pageIndex++;
      }
      
      return foundFeedback;
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
export const getFeedbacksByCourseId = feedbackService.getFeedbacksByCourseId;
export const updateFeedback = feedbackService.updateFeedback;
export const deleteFeedback = feedbackService.deleteFeedback;
export const getCourseAverageRating = feedbackService.getCourseAverageRating;
export const getUserFeedbackForCourse = feedbackService.getUserFeedbackForCourse;

export default feedbackService;
