import axiosInstance from "../consts/axios/axiosInstance";
import {
  CREATE_LESSON_PROGRESS_URL,
  UPDATE_LESSON_PROGRESS_URL,
  DELETE_LESSON_PROGRESS_URL,
  GET_LESSON_PROGRESS_BY_USER_COURSE_URL,
  GET_LESSON_PROGRESS_BY_USER_LESSON_URL,
  GET_COMPLETION_RATE_URL,
} from "../consts/apiUrl/baseUrl";
import {
  LessonProgressDto,
  CreateLessonProgressDto,
  UpdateLessonProgressDto,
  CreateLessonProgressWithCourseDto,
  validateLessonProgressCreateDto,
  validateLessonProgressUpdateDto
} from "../types/lessonProgress.types";

// ===== API Functions =====

/**
 * Get all lesson progress records for a user in a course.
 * GET /api/lesson-progress/by-user-course?userId={userId}&courseId={courseId}
 */
export const getLessonProgressByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<LessonProgressDto[]> => {
  try {
    const response = await axiosInstance.get<LessonProgressDto[]>(
      GET_LESSON_PROGRESS_BY_USER_COURSE_URL,
      {
        params: {
          userId,
          courseId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("GetLessonProgressByUserAndCourse API error:", error);
    throw error;
  }
};

/**
 * Get a lesson progress record by user and lesson.
 * GET /api/lesson-progress/by-user-lesson?userId={userId}&lessonId={lessonId}
 */
export const getLessonProgressByUserAndLesson = async (
  userId: string,
  lessonId: string
): Promise<LessonProgressDto | null> => {
  try {
    const response = await axiosInstance.get<LessonProgressDto>(
      GET_LESSON_PROGRESS_BY_USER_LESSON_URL,
      {
        params: {
          userId,
          lessonId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("GetLessonProgressByUserAndLesson API error:", error);
    throw error;
  }
};

/**
 * Create a new lesson progress record.
 * POST /api/lesson-progress
 */
export const createLessonProgress = async (
  createDto: CreateLessonProgressDto
): Promise<LessonProgressDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateLessonProgressCreateDto(createDto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.post<LessonProgressDto>(
      CREATE_LESSON_PROGRESS_URL,
      createDto
    );
    return response.data;
  } catch (error) {
    console.error("CreateLessonProgress API error:", error);
    throw error;
  }
};

/**
 * Create a new lesson progress record with courseId (legacy support).
 * POST /api/lesson-progress
 */
export const createLessonProgressWithCourse = async (
  createDto: CreateLessonProgressWithCourseDto
): Promise<LessonProgressDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateLessonProgressCreateDto({
      userId: createDto.userId,
      lessonId: createDto.lessonId
    });
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.post<LessonProgressDto>(
      CREATE_LESSON_PROGRESS_URL,
      createDto
    );
    return response.data;
  } catch (error) {
    console.error("CreateLessonProgressWithCourse API error:", error);
    throw error;
  }
};

/**
 * Update a lesson progress record.
 * PUT /api/lesson-progress/{progressId}
 */
export const updateLessonProgress = async (
  progressId: string,
  updateDto: UpdateLessonProgressDto
): Promise<LessonProgressDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateLessonProgressUpdateDto(updateDto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.put<LessonProgressDto>(
      UPDATE_LESSON_PROGRESS_URL(progressId),
      updateDto
    );
    return response.data;
  } catch (error) {
    console.error(`UpdateLessonProgress API error for ID ${progressId}:`, error);
    throw error;
  }
};

/**
 * Delete a lesson progress record.
 * DELETE /api/lesson-progress/{progressId}
 */
export const deleteLessonProgress = async (progressId: string): Promise<void> => {
  try {
    await axiosInstance.delete(DELETE_LESSON_PROGRESS_URL(progressId));
  } catch (error) {
    console.error(`DeleteLessonProgress API error for ID ${progressId}:`, error);
    throw error;
  }
};

/**
 * Get the current user's overall completion rate for a course.
 * GET /api/lesson-progress/completion-rate?userId={userId}&courseId={courseId}
 */
export const getUserCourseCompletionRate = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const response = await axiosInstance.get<number>(
      GET_COMPLETION_RATE_URL,
      {
        params: {
          userId,
          courseId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("GetUserCourseCompletionRate API error:", error);
    throw error;
  }
};

// ===== Helper Functions =====

/**
 * Check if user has completed a specific lesson
 */
export const isLessonCompleted = async (
  userId: string,
  lessonId: string
): Promise<boolean> => {
  try {
    const progress = await getLessonProgressByUserAndLesson(userId, lessonId);
    return progress !== null && progress.completionRate >= 100;
  } catch (error) {
    console.error("IsLessonCompleted error:", error);
    return false;
  }
};

/**
 * Get completion rate for a specific lesson
 */
export const getLessonCompletionRate = async (
  userId: string,
  lessonId: string
): Promise<number> => {
  try {
    const progress = await getLessonProgressByUserAndLesson(userId, lessonId);
    return progress?.completionRate || 0;
  } catch (error) {
    console.error("GetLessonCompletionRate error:", error);
    return 0;
  }
};

/**
 * Mark lesson as completed (100% completion rate)
 */
export const markLessonAsCompleted = async (
  userId: string,
  lessonId: string,
  courseId: string
): Promise<LessonProgressDto> => {
  try {
    // Check if progress already exists
    const existingProgress = await getLessonProgressByUserAndLesson(userId, lessonId);
    
    if (existingProgress) {
      // Update existing progress to 100%
      return await updateLessonProgress(existingProgress.progressId, {
        completionRate: 100,
      });
    } else {
      // Create new progress with 100% completion
      return await createLessonProgressWithCourse({
        userId,
        lessonId,
        courseId,
      });
    }
  } catch (error) {
    console.error("MarkLessonAsCompleted error:", error);
    throw error;
  }
};

/**
 * Update lesson progress to a specific percentage
 */
export const updateLessonProgressRate = async (
  userId: string,
  lessonId: string,
  courseId: string,
  completionRate: number
): Promise<LessonProgressDto> => {
  try {
    // Ensure completion rate is between 0 and 100
    const rate = Math.max(0, Math.min(100, completionRate));
    
    // Check if progress already exists
    const existingProgress = await getLessonProgressByUserAndLesson(userId, lessonId);
    
    if (existingProgress) {
      // Update existing progress
      return await updateLessonProgress(existingProgress.progressId, {
        completionRate: rate,
      });
    } else {
      // Create new progress
      const newProgress = await createLessonProgressWithCourse({
        userId,
        lessonId,
        courseId,
      });
      
      // Update the completion rate if it's not already 100%
      if (rate !== 100) {
        return await updateLessonProgress(newProgress.progressId, {
          completionRate: rate,
        });
      }
      
      return newProgress;
    }
  } catch (error) {
    console.error("UpdateLessonProgressRate error:", error);
    throw error;
  }
}; 