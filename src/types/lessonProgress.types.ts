/**
 * DTOs for Lesson Progress operations
 * These match the backend validation requirements
 */

export interface LessonProgressDto {
  progressId: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completionRate: number;
  userFullName?: string;
  lessonTitle?: string;
}

/**
 * DTO for creating a new lesson progress
 * Matches backend CreateLessonProgressDto validation:
 * - UserId: Required, NotDefaultGuid
 * - LessonId: Required, NotDefaultGuid
 */
export interface CreateLessonProgressDto {
  userId: string;
  lessonId: string;
}

/**
 * DTO for updating an existing lesson progress
 * Matches backend UpdateLessonProgressDto validation:
 * - CompletionRate: Required, Range(0, 100), decimal type
 */
export interface UpdateLessonProgressDto {
  completionRate: number; // decimal type in backend, number in frontend
}

/**
 * Legacy interface for backward compatibility
 * Used by existing components that need courseId
 */
export interface CreateLessonProgressWithCourseDto {
  userId: string;
  lessonId: string;
  courseId: string;
}

/**
 * Validation rules for lesson progress fields
 */
export const LESSON_PROGRESS_VALIDATION_RULES = {
  COMPLETION_RATE_MIN: 0,
  COMPLETION_RATE_MAX: 100,
  COMPLETION_RATE_RANGE_MESSAGE: "Completion rate must be between 0 and 100.",
  USER_ID_REQUIRED_MESSAGE: "User ID is required.",
  USER_ID_INVALID_MESSAGE: "User ID must be a valid GUID.",
  LESSON_ID_REQUIRED_MESSAGE: "Lesson ID is required.",
  LESSON_ID_INVALID_MESSAGE: "Lesson ID must be a valid GUID."
} as const;

/**
 * Validate GUID format
 */
export const isValidGuid = (guid: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

/**
 * Validate lesson progress creation DTO according to backend rules
 */
export const validateLessonProgressCreateDto = (dto: CreateLessonProgressDto): { isValid: boolean; message?: string } => {
  if (!dto.userId || dto.userId.trim().length === 0) {
    return { isValid: false, message: LESSON_PROGRESS_VALIDATION_RULES.USER_ID_REQUIRED_MESSAGE };
  }

  if (!isValidGuid(dto.userId)) {
    return { isValid: false, message: LESSON_PROGRESS_VALIDATION_RULES.USER_ID_INVALID_MESSAGE };
  }

  if (!dto.lessonId || dto.lessonId.trim().length === 0) {
    return { isValid: false, message: LESSON_PROGRESS_VALIDATION_RULES.LESSON_ID_REQUIRED_MESSAGE };
  }

  if (!isValidGuid(dto.lessonId)) {
    return { isValid: false, message: LESSON_PROGRESS_VALIDATION_RULES.LESSON_ID_INVALID_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate lesson progress update DTO according to backend rules
 * Matches backend validation: [Range(0, 100, ErrorMessage = "Completion rate must be between 0 and 100.")]
 */
export const validateLessonProgressUpdateDto = (dto: UpdateLessonProgressDto): { isValid: boolean; message?: string } => {
  if (typeof dto.completionRate !== 'number' || isNaN(dto.completionRate)) {
    return { isValid: false, message: "Completion rate must be a valid number." };
  }

  // Handle decimal precision (backend uses decimal, frontend uses number)
  const rate = Number(dto.completionRate);
  
  if (rate < LESSON_PROGRESS_VALIDATION_RULES.COMPLETION_RATE_MIN || 
      rate > LESSON_PROGRESS_VALIDATION_RULES.COMPLETION_RATE_MAX) {
    return { isValid: false, message: LESSON_PROGRESS_VALIDATION_RULES.COMPLETION_RATE_RANGE_MESSAGE };
  }

  return { isValid: true };
};
