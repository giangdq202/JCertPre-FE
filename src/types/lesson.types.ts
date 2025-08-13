/**
 * DTOs for Lesson operations
 * These match the backend validation requirements
 */

import { DocumentDto } from "../services/documentService";

export interface LessonDto {
  lessonId: string;
  courseId: string;
  title: string;
  lessonOrder: number;
  content: string;
  documents?: DocumentDto[];
}

/**
 * DTO for creating a new lesson
 * Matches backend CreateLessonDto validation:
 * - Title: Required, MinLength(1), MaxLength(200)
 * - LessonOrder: Required, Range(1, 10000)
 * - Content: Required, MinLength(1), MaxLength(5000)
 */
export interface CreateLessonDto {
  title: string;
  lessonOrder: number;
  content: string;
}

/**
 * DTO for updating an existing lesson
 * Matches backend UpdateLessonDto validation:
 * - Title: Optional, MinLength(1), MaxLength(200) if provided
 * - LessonOrder: Optional, Range(1, 10000) if provided
 * - Content: Optional, MinLength(1), MaxLength(5000) if provided
 */
export interface UpdateLessonDto {
  title?: string;
  lessonOrder?: number;
  content?: string;
}

/**
 * Validation rules for lesson fields
 */
export const LESSON_VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  TITLE_REQUIRED_MESSAGE: "Lesson title is required.",
  TITLE_EMPTY_MESSAGE: "Lesson title cannot be empty.",
  TITLE_TOO_LONG_MESSAGE: "Lesson title cannot exceed 200 characters.",
  
  LESSON_ORDER_MIN: 1,
  LESSON_ORDER_MAX: 10000,
  LESSON_ORDER_REQUIRED_MESSAGE: "Lesson order is required.",
  LESSON_ORDER_RANGE_MESSAGE: "Lesson order must be a positive integer between 1 and 10000.",
  
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 5000,
  CONTENT_REQUIRED_MESSAGE: "Lesson content is required.",
  CONTENT_EMPTY_MESSAGE: "Lesson content cannot be empty.",
  CONTENT_TOO_LONG_MESSAGE: "Lesson content cannot exceed 5000 characters."
} as const;

/**
 * Validate lesson title according to backend rules
 */
export const validateLessonTitle = (title: string): { isValid: boolean; message?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, message: LESSON_VALIDATION_RULES.TITLE_EMPTY_MESSAGE };
  }
  
  if (title.length > LESSON_VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return { isValid: false, message: LESSON_VALIDATION_RULES.TITLE_TOO_LONG_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate lesson order according to backend rules
 */
export const validateLessonOrder = (order: number): { isValid: boolean; message?: string } => {
  if (order < LESSON_VALIDATION_RULES.LESSON_ORDER_MIN || order > LESSON_VALIDATION_RULES.LESSON_ORDER_MAX) {
    return { isValid: false, message: LESSON_VALIDATION_RULES.LESSON_ORDER_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate lesson content according to backend rules
 */
export const validateLessonContent = (content: string): { isValid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, message: LESSON_VALIDATION_RULES.CONTENT_EMPTY_MESSAGE };
  }
  
  if (content.length > LESSON_VALIDATION_RULES.CONTENT_MAX_LENGTH) {
    return { isValid: false, message: LESSON_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate lesson creation DTO according to backend rules
 */
export const validateLessonCreateDto = (dto: CreateLessonDto): { isValid: boolean; message?: string } => {
  // Validate title
  const titleValidation = validateLessonTitle(dto.title);
  if (!titleValidation.isValid) {
    return titleValidation;
  }
  
  // Validate lesson order
  const orderValidation = validateLessonOrder(dto.lessonOrder);
  if (!orderValidation.isValid) {
    return orderValidation;
  }
  
  // Validate content
  const contentValidation = validateLessonContent(dto.content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }
  
  return { isValid: true };
};

/**
 * Validate lesson update DTO according to backend rules
 */
export const validateLessonUpdateDto = (dto: UpdateLessonDto): { isValid: boolean; message?: string } => {
  // Validate title if provided
  if (dto.title !== undefined) {
    const titleValidation = validateLessonTitle(dto.title);
    if (!titleValidation.isValid) {
      return titleValidation;
    }
  }
  
  // Validate lesson order if provided
  if (dto.lessonOrder !== undefined) {
    const orderValidation = validateLessonOrder(dto.lessonOrder);
    if (!orderValidation.isValid) {
      return orderValidation;
    }
  }
  
  // Validate content if provided
  if (dto.content !== undefined) {
    const contentValidation = validateLessonContent(dto.content);
    if (!contentValidation.isValid) {
      return contentValidation;
    }
  }
  
  return { isValid: true };
};

// Note: DocumentDto is imported from documentService.ts
