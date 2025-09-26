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

/**
 * DTO for creating or updating writing answers
 * Matches backend CreateWritingAttemptAnswerDto
 */
export interface CreateWritingAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  writtenAnswer: string; // Updated to match backend: WrittenAnswer
}

/**
 * DTO for written answer response
 * Used when retrieving written answers by attempt ID
 * Matches backend WrittenAttemptAnswerDetailDto
 */
export interface WrittenAnswerDto {
  answerId: string; // Updated to match backend: AnswerId
  attemptId: string;
  questionId: string;
  writtenAnswer: string; // Updated to match backend: WrittenAnswer
  graderComment?: string; // Updated to match backend: GraderComment
  score: number; // Updated to match backend: Score
}

/**
 * DTO for scoring writing answers
 * Matches backend ScoringWritingRequestDto
 */
export interface ScoringWritingRequestDto {
  score: number; // Updated to match backend: Score
  graderComment: string; // Updated to match backend: GraderComment
}

/**
 * DTO for scoring writing response
 */
export interface ScoringWritingResponseDto {
  success: boolean;
  message: string;
  data?: any;
}
