/**
 * DTOs for Attempt Answer operations
 * These match the backend validation requirements
 */

export interface AttemptAnswerDto {
  attemptAnswerId: string;
  attemptId: string;
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

/**
 * DTO for creating a new attempt answer
 * Matches backend CreateAttemptAnswerDto
 */
export interface CreateAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId: string;
}

/**
 * DTO for updating an existing attempt answer
 * Matches backend UpdateAttemptAnswerDto
 */
export interface UpdateAttemptAnswerDto {
  answerId: string;
  choiceId: string;
}

/**
 * Legacy interface for backward compatibility
 * Used by existing components that need to add or update answers
 */
export interface AddOrUpdateAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId: string;
}
