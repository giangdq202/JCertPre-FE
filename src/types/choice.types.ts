/**
 * DTOs for Choice operations
 * These match the backend validation requirements
 */

export interface ChoiceReadDto {
  choiceId: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
}

/**
 * DTO for creating a new choice
 * Matches backend ChoiceCreateDto validation:
 * - Content: Required, MinLength(1), MaxLength(500)
 * - IsCorrect: Required
 */
export interface ChoiceCreateDto {
  content: string;
  isCorrect: boolean;
}

/**
 * DTO for updating an existing choice
 * Matches backend ChoiceUpdateDto validation:
 * - Content: Optional, MinLength(1), MaxLength(500) if provided
 * - IsCorrect: Optional
 */
export interface ChoiceUpdateDto {
  content?: string;
  isCorrect?: boolean;
}

/**
 * Validation rules for choice content
 */
export const CHOICE_VALIDATION_RULES = {
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 500,
  CONTENT_REQUIRED_MESSAGE: "Choice content is required.",
  CONTENT_EMPTY_MESSAGE: "Choice content cannot be empty.",
  CONTENT_TOO_LONG_MESSAGE: "Choice content cannot exceed 500 characters.",
  IS_CORRECT_REQUIRED_MESSAGE: "IsCorrect is required."
} as const;

/**
 * Validate choice content according to backend rules
 */
export const validateChoiceContent = (content: string): { isValid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, message: CHOICE_VALIDATION_RULES.CONTENT_EMPTY_MESSAGE };
  }
  
  if (content.length > CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH) {
    return { isValid: false, message: CHOICE_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate choice creation DTO according to backend rules
 */
export const validateChoiceCreateDto = (dto: ChoiceCreateDto): { isValid: boolean; message?: string } => {
  if (!dto.content || dto.content.trim().length === 0) {
    return { isValid: false, message: CHOICE_VALIDATION_RULES.CONTENT_REQUIRED_MESSAGE };
  }
  
  const contentValidation = validateChoiceContent(dto.content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }
  
  return { isValid: true };
};

/**
 * Validate choice update DTO according to backend rules
 */
export const validateChoiceUpdateDto = (dto: ChoiceUpdateDto): { isValid: boolean; message?: string } => {
  if (dto.content !== undefined) {
    const contentValidation = validateChoiceContent(dto.content);
    if (!contentValidation.isValid) {
      return contentValidation;
    }
  }
  
  return { isValid: true };
};
