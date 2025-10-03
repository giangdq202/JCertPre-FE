/**
 * DTOs for Question operations
 * These match the backend validation requirements
 */

export interface QuestionDto {
  id: string;
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
  audioFile?: string;
  choices?: ChoiceReadDto[];
  questionAttachments?: Array<{
    mediaUrl: string;
    mediaType: string;
  }>;
}

/**
 * DTO for creating a new question
 * Matches backend CreateQuestionDto validation:
 * - Content: Required, MinLength(10), MaxLength(1000)
 * - Explanation: Optional, MaxLength(1000)
 * - Points: Required, Range(1, 100)
 * - Difficulty: Required
 * - IsActive: Required
 * - ContentName: Required
 * - Level: Required
 * - SubContentName: Required
 * - AudioFile: Optional
 */
export interface CreateQuestionDto {
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
  audioFile?: File;
}

/**
 * DTO for generating question with AI
 */
export interface GenerateQuestionRequestDto {
  level: string; // N5, N4, N3, N2, N1
  contentName: string; // Kanji, Vocabulary, Grammar, Reading
  description: string; // Description from valid list
}

export interface GeneratedChoiceDto {
  choiceText: string;
  isCorrect: boolean;
}

export interface GeneratedQuestionResponseDto {
  questionText: string;
  explanation: string;          // ← NEW!
  choices: GeneratedChoiceDto[];
}

export interface ExplanationRequestDto {
  questionText: string;
  choices: GeneratedChoiceDto[];
}

export interface ExplanationResponseDto {
  explanation: string;
}

/**
 * DTO for updating an existing question
 * Matches backend UpdateQuestionDto validation:
 * - Content: Optional, MinLength(10) if provided
 * - Explanation: Optional, MaxLength(1000) if provided
 * - Points: Optional, Range(1, 100) if provided
 * - Difficulty: Optional
 * - IsActive: Optional
 * - ContentName: Optional
 * - Level: Optional
 * - SubContentName: Optional
 * - AudioFile: Optional
 */
export interface UpdateQuestionDto {
  content?: string;
  explanation?: string;
  points?: number;
  difficulty?: QuestionDifficulty;
  isActive?: boolean;
  contentName?: ContentName;
  level?: CourseLevel;
  subContentName?: SubContentName;
  audioFile?: File;
}

/**
 * Question difficulty levels
 */
export enum QuestionDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2
}

/**
 * Content names for questions
 */
export enum ContentName {
  Kanji = 0,
  Vocabulary = 1,
  Grammar = 2,
  Reading = 3,
  Listening = 4,
  Writing = 5
}

/**
 * Question types
 */
export enum QuestionType {
  MultipleChoice = 0,
  Writing = 1
}

/**
 * Course levels
 */
export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4
}

/**
 * Sub-content names for questions
 */
export enum SubContentName {
  Mondai1 = 0, // Đọc chữ Hán
  Mondai2 = 1, // Nhớ chữ Hán
  Mondai3 = 2, // Chọn từ phù hợp với câu
  Mondai4 = 3, // Tìm câu có cách diễn đạt giống
  Mondai5 = 4, // Chọn ngữ pháp phù hợp với câu
  Mondai6 = 5, // Sắp xếp câu
  Mondai7 = 6, // Tìm đáp án đúng để hoàn thành đoạn văn
  Mondai8 = 7, // Đoạn văn ngắn
  Mondai9 = 8, // Trung văn
  Mondai10 = 9, // Tìm kiếm thông tin
  Mondai11 = 10, // Hiểu đề bài
  Mondai12 = 11, // Hiểu điểm chính
  Mondai13 = 12, // Diễn đạt bằng lời nói
  Mondai14 = 13, // Phản hồi tức thời
  Mondai15 = 14, // Viết đoạn văn ngắn
}

/**
 * Import ChoiceReadDto from choice types
 */
import { ChoiceReadDto } from './choice.types';

/**
 * DTOs for importing questions
 */
export interface ImportQuestionJsonDto {
  Content: string;
  Explanation?: string;
  Points: number;
  Difficulty: QuestionDifficulty;
  IsActive: boolean;
  ContentName: ContentName;
  Level: CourseLevel;
  SubContentName: SubContentName;
  Choices: ImportChoiceJsonDto[];
}

export interface ImportChoiceJsonDto {
  Content: string;
  IsCorrect: boolean;
}

export interface ImportQuestionsRequestDto {
  File: File;
}

export interface ImportQuestionsResultDto {
  totalCount: number;    // lowercase để match backend response khi thành công
  successCount: number;  // lowercase để match backend response khi thành công  
  failedCount: number;   // lowercase để match backend response khi thành công
}

export interface ImportQuestionErrorDto {
  QuestionText: string;
  Error: string;
}

/**
 * Validation rules for question fields
 */
export const QUESTION_VALIDATION_RULES = {
  CONTENT_MIN_LENGTH: 10,
  CONTENT_MAX_LENGTH: 1000,
  CONTENT_REQUIRED_MESSAGE: "Question content is required.",
  CONTENT_TOO_SHORT_MESSAGE: "Question content must be at least 10 characters.",
  CONTENT_TOO_LONG_MESSAGE: "Question content cannot exceed 1000 characters.",
  
  EXPLANATION_MAX_LENGTH: 1000,
  EXPLANATION_TOO_LONG_MESSAGE: "Explanation cannot exceed 1000 characters.",
  
  POINTS_MIN: 1,
  POINTS_MAX: 100,
  POINTS_REQUIRED_MESSAGE: "Points are required.",
  POINTS_RANGE_MESSAGE: "Points must be between 1 and 100.",
  
  DIFFICULTY_REQUIRED_MESSAGE: "Difficulty is required.",
  IS_ACTIVE_REQUIRED_MESSAGE: "IsActive is required.",
  CONTENT_NAME_REQUIRED_MESSAGE: "ContentName is required.",
  LEVEL_REQUIRED_MESSAGE: "Level is required.",
  SUB_CONTENT_NAME_REQUIRED_MESSAGE: "SubContentName is required."
} as const;

/**
 * Validate question content according to backend rules
 */
export const validateQuestionContent = (content: string): { isValid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.CONTENT_REQUIRED_MESSAGE };
  }

  if (content.trim().length < QUESTION_VALIDATION_RULES.CONTENT_MIN_LENGTH) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.CONTENT_TOO_SHORT_MESSAGE };
  }

  if (content.length > QUESTION_VALIDATION_RULES.CONTENT_MAX_LENGTH) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate question explanation according to backend rules
 */
export const validateQuestionExplanation = (explanation?: string): { isValid: boolean; message?: string } => {
  if (explanation && explanation.length > QUESTION_VALIDATION_RULES.EXPLANATION_MAX_LENGTH) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.EXPLANATION_TOO_LONG_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate question points according to backend rules
 */
export const validateQuestionPoints = (points: number): { isValid: boolean; message?: string } => {
  if (typeof points !== 'number' || isNaN(points)) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.POINTS_REQUIRED_MESSAGE };
  }

  if (points < QUESTION_VALIDATION_RULES.POINTS_MIN || points > QUESTION_VALIDATION_RULES.POINTS_MAX) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.POINTS_RANGE_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate question creation DTO according to backend rules
 */
export const validateQuestionCreateDto = (dto: CreateQuestionDto): { isValid: boolean; message?: string } => {
  // Validate content
  const contentValidation = validateQuestionContent(dto.content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }

  // Validate explanation
  const explanationValidation = validateQuestionExplanation(dto.explanation);
  if (!explanationValidation.isValid) {
    return explanationValidation;
  }

  // Validate points
  const pointsValidation = validateQuestionPoints(dto.points);
  if (!pointsValidation.isValid) {
    return pointsValidation;
  }

  // Validate required fields - check for null/undefined instead of falsy values
  if (dto.difficulty === null || dto.difficulty === undefined) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.DIFFICULTY_REQUIRED_MESSAGE };
  }

  if (typeof dto.isActive !== 'boolean') {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.IS_ACTIVE_REQUIRED_MESSAGE };
  }

  if (dto.contentName === null || dto.contentName === undefined) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.CONTENT_NAME_REQUIRED_MESSAGE };
  }

  if (dto.level === null || dto.level === undefined) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.LEVEL_REQUIRED_MESSAGE };
  }

  if (dto.subContentName === null || dto.subContentName === undefined) {
    return { isValid: false, message: QUESTION_VALIDATION_RULES.SUB_CONTENT_NAME_REQUIRED_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate question update DTO according to backend rules
 */
export const validateQuestionUpdateDto = (dto: UpdateQuestionDto): { isValid: boolean; message?: string } => {
  // Validate content if provided
  if (dto.content !== undefined) {
    const contentValidation = validateQuestionContent(dto.content);
    if (!contentValidation.isValid) {
      return contentValidation;
    }
  }

  // Validate explanation if provided
  if (dto.explanation !== undefined) {
    const explanationValidation = validateQuestionExplanation(dto.explanation);
    if (!explanationValidation.isValid) {
      return explanationValidation;
    }
  }

  // Validate points if provided
  if (dto.points !== undefined) {
    const pointsValidation = validateQuestionPoints(dto.points);
    if (!pointsValidation.isValid) {
      return pointsValidation;
    }
  }

  return { isValid: true };
};
