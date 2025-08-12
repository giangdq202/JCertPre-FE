/**
 * DTOs for Test Template Type operations
 * These match the backend validation requirements
 */

import { isValidGuid } from './validationUtils';

export interface TestTemplateTypeDto {
  testTemplateTypeId: string;
  userId: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  totalTestScore: number;
  totalPassPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new test template type
 * Matches backend CreateTestTemplateTypeDto validation:
 * - UserId: Required, NotDefaultGuid (valid GUID format)
 * - TypeName: Required, MinLength(3), MaxLength(200)
 * - CourseLevel: Required
 * - TestType: Required
 * - Description: Required, MaxLength(1000)
 * - TotalTestScore: Required, Range(1, 1000)
 * - TotalPassPercentage: Required, Range(0, 100)
 */
export interface CreateTestTemplateTypeDto {
  userId: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  totalTestScore: number;
  totalPassPercentage: number;
}

/**
 * DTO for updating an existing test template type
 * Matches backend UpdateTestTemplateTypeDto validation:
 * - TypeName: Optional, MinLength(3), MaxLength(200)
 * - CourseLevel: Optional
 * - TestType: Optional
 * - Description: Optional, MaxLength(1000)
 * - IsActive: Optional
 * - TotalTestScore: Optional, Range(1, 1000)
 * - TotalPassPercentage: Optional, Range(0, 100)
 */
export interface UpdateTestTemplateTypeDto {
  typeName?: string;
  courseLevel?: CourseLevel;
  testType?: TestType;
  description?: string;
  isActive?: boolean;
  totalTestScore?: number;
  totalPassPercentage?: number;
}

/**
 * Course level enum - matches backend CourseLevel enum
 */
export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4
}

/**
 * Test type enum - matches backend TestType enum
 */
export enum TestType {
  JLPTAuto = 0,
  EntryAuto = 1,
  CustomManual = 2,
  CustomAuto = 3
}

/**
 * Validation rules for test template type fields
 */
export const TEST_TEMPLATE_TYPE_VALIDATION_RULES = {
  USER_ID_REQUIRED_MESSAGE: "UserId is required.",
  USER_ID_INVALID_GUID_MESSAGE: "UserId must be a valid GUID.",
  
  TYPE_NAME_REQUIRED_MESSAGE: "Type name is required.",
  TYPE_NAME_MIN_LENGTH: 3,
  TYPE_NAME_MAX_LENGTH: 200,
  TYPE_NAME_TOO_SHORT_MESSAGE: "Type name must be at least 3 characters.",
  TYPE_NAME_TOO_LONG_MESSAGE: "Type name cannot exceed 200 characters.",
  
  COURSE_LEVEL_REQUIRED_MESSAGE: "Course level is required.",
  TEST_TYPE_REQUIRED_MESSAGE: "Test type is required.",
  
  DESCRIPTION_REQUIRED_MESSAGE: "Description is required.",
  DESCRIPTION_MAX_LENGTH: 1000,
  DESCRIPTION_TOO_LONG_MESSAGE: "Description cannot exceed 1000 characters.",
  
  TOTAL_TEST_SCORE_REQUIRED_MESSAGE: "Total test score is required.",
  TOTAL_TEST_SCORE_MIN: 1,
  TOTAL_TEST_SCORE_MAX: 1000,
  TOTAL_TEST_SCORE_RANGE_MESSAGE: "Total test score must be between 1 and 1000.",
  
  TOTAL_PASS_PERCENTAGE_REQUIRED_MESSAGE: "Total pass percentage is required.",
  TOTAL_PASS_PERCENTAGE_MIN: 0,
  TOTAL_PASS_PERCENTAGE_MAX: 100,
  TOTAL_PASS_PERCENTAGE_RANGE_MESSAGE: "Total pass percentage must be between 0 and 100."
} as const;

/**
 * Validate type name according to backend rules
 */
export const validateTypeName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_REQUIRED_MESSAGE };
  }
  
  if (name.trim().length < TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_MIN_LENGTH) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_TOO_SHORT_MESSAGE };
  }
  
  if (name.trim().length > TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_MAX_LENGTH) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_TOO_LONG_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate description according to backend rules
 */
export const validateDescription = (description: string): { isValid: boolean; message?: string } => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.DESCRIPTION_REQUIRED_MESSAGE };
  }
  
  if (description.trim().length > TEST_TEMPLATE_TYPE_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.DESCRIPTION_TOO_LONG_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate total test score according to backend rules
 */
export const validateTotalTestScore = (score: number): { isValid: boolean; message?: string } => {
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_REQUIRED_MESSAGE };
  }
  
  if (score < TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_MIN || 
      score > TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate total pass percentage according to backend rules
 */
export const validateTotalPassPercentage = (percentage: number): { isValid: boolean; message?: string } => {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_REQUIRED_MESSAGE };
  }
  
  if (percentage < TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_MIN || 
      percentage > TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate create test template type DTO according to backend rules
 */
export const validateCreateTestTemplateTypeDto = (dto: CreateTestTemplateTypeDto): { isValid: boolean; message?: string } => {
  // Validate UserId
  if (!dto.userId || dto.userId.trim().length === 0) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.USER_ID_REQUIRED_MESSAGE };
  }
  
  if (!isValidGuid(dto.userId)) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.USER_ID_INVALID_GUID_MESSAGE };
  }
  
  // Validate type name
  const nameValidation = validateTypeName(dto.typeName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Validate course level
  if (!dto.courseLevel) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.COURSE_LEVEL_REQUIRED_MESSAGE };
  }
  
  // Validate test type
  if (!dto.testType) {
    return { isValid: false, message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TEST_TYPE_REQUIRED_MESSAGE };
  }
  
  // Validate description
  const descriptionValidation = validateDescription(dto.description);
  if (!descriptionValidation.isValid) {
    return descriptionValidation;
  }
  
  // Validate total test score
  const scoreValidation = validateTotalTestScore(dto.totalTestScore);
  if (!scoreValidation.isValid) {
    return scoreValidation;
  }
  
  // Validate total pass percentage
  const percentageValidation = validateTotalPassPercentage(dto.totalPassPercentage);
  if (!percentageValidation.isValid) {
    return percentageValidation;
  }
  
  return { isValid: true };
};

/**
 * Validate update test template type DTO according to backend rules
 */
export const validateUpdateTestTemplateTypeDto = (dto: UpdateTestTemplateTypeDto): { isValid: boolean; message?: string } => {
  // Validate type name if provided
  if (dto.typeName !== undefined) {
    const nameValidation = validateTypeName(dto.typeName);
    if (!nameValidation.isValid) {
      return nameValidation;
    }
  }
  
  // Validate description if provided
  if (dto.description !== undefined) {
    const descriptionValidation = validateDescription(dto.description);
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }
  
  // Validate total test score if provided
  if (dto.totalTestScore !== undefined) {
    const scoreValidation = validateTotalTestScore(dto.totalTestScore);
    if (!scoreValidation.isValid) {
      return scoreValidation;
    }
  }
  
  // Validate total pass percentage if provided
  if (dto.totalPassPercentage !== undefined) {
    const percentageValidation = validateTotalPassPercentage(dto.totalPassPercentage);
    if (!percentageValidation.isValid) {
      return percentageValidation;
    }
  }
  
  return { isValid: true };
};
