/**
 * DTOs for Test operations
 * These match the backend validation requirements
 */

export interface TestDto {
  testId: string;
  title: string;
  description?: string;
  testType: TestType;
  courseLevel: CourseLevel;
  durationMinutes: number;
  availableFrom?: Date;
  availableTo?: Date;
  maxAttempts: number;
  passingPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new test
 * Matches backend CreateTestDto validation:
 * - Title: Required, MinLength(3), MaxLength(200)
 * - Description: Optional, MaxLength(1000)
 * - TestType: Required
 * - CourseLevel: Required
 * - DurationMinutes: Required, Range(1, 1000)
 * - AvailableFrom: Optional
 * - AvailableTo: Optional
 * - MaxAttempts: Required, Range(1, 100)
 * - PassingPercentage: Required, Range(0, 100)
 */
export interface CreateTestDto {
  title: string;
  description?: string;
  testType: TestType;
  courseLevel: CourseLevel;
  durationMinutes: number;
  availableFrom?: Date;
  availableTo?: Date;
  maxAttempts: number;
  passingPercentage: number;
}

/**
 * DTO for updating an existing test
 * Matches backend UpdateTestDto validation:
 * - Title: Optional, MinLength(3) if provided, MaxLength(200) if provided
 * - Description: Optional, MaxLength(1000) if provided
 * - TestType: Optional
 * - CourseLevel: Optional
 * - DurationMinutes: Optional, Range(1, 1000) if provided
 * - AvailableFrom: Optional
 * - AvailableTo: Optional
 * - MaxAttempts: Optional, Range(1, 100) if provided
 * - PassingPercentage: Optional, Range(0, 100) if provided
 */
export interface UpdateTestDto {
  title?: string;
  description?: string;
  testType?: TestType;
  courseLevel?: CourseLevel;
  durationMinutes?: number;
  availableFrom?: Date;
  availableTo?: Date;
  maxAttempts?: number;
  passingPercentage?: number;
}

/**
 * DTO for creating an auto test
 * Matches backend CreateAutoTestInput validation:
 * - TestType: Required
 * - CourseLevel: Required
 */
export interface CreateAutoTestInput {
  testType: TestType;
  courseLevel: CourseLevel;
}

/**
 * Test types
 */
export enum TestType {
  PRACTICE = "Practice",
  QUIZ = "Quiz",
  EXAM = "Exam",
  FINAL = "Final"
}

/**
 * Course levels
 */
export enum CourseLevel {
  N5 = "N5",
  N4 = "N4",
  N3 = "N3",
  N2 = "N2",
  N1 = "N1"
}

/**
 * Validation rules for test fields
 */
export const TEST_VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  TITLE_REQUIRED_MESSAGE: "Title is required.",
  TITLE_TOO_SHORT_MESSAGE: "Title must be at least 3 characters.",
  TITLE_TOO_LONG_MESSAGE: "Title cannot exceed 200 characters.",

  DESCRIPTION_MAX_LENGTH: 1000,
  DESCRIPTION_TOO_LONG_MESSAGE: "Description cannot exceed 1000 characters.",

  TEST_TYPE_REQUIRED_MESSAGE: "TestType is required.",
  COURSE_LEVEL_REQUIRED_MESSAGE: "CourseLevel is required.",

  DURATION_MINUTES_MIN: 1,
  DURATION_MINUTES_MAX: 1000,
  DURATION_MINUTES_REQUIRED_MESSAGE: "DurationMinutes is required.",
  DURATION_MINUTES_RANGE_MESSAGE: "DurationMinutes must be between 1 and 1000.",

  MAX_ATTEMPTS_MIN: 1,
  MAX_ATTEMPTS_MAX: 100,
  MAX_ATTEMPTS_REQUIRED_MESSAGE: "MaxAttempts is required.",
  MAX_ATTEMPTS_RANGE_MESSAGE: "MaxAttempts must be between 1 and 100.",

  PASSING_PERCENTAGE_MIN: 0,
  PASSING_PERCENTAGE_MAX: 100,
  PASSING_PERCENTAGE_REQUIRED_MESSAGE: "PassingPercentage is required.",
  PASSING_PERCENTAGE_RANGE_MESSAGE: "PassingPercentage must be between 0 and 100."
} as const;

/**
 * Validate test title according to backend rules
 */
export const validateTestTitle = (title: string): { isValid: boolean; message?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, message: TEST_VALIDATION_RULES.TITLE_REQUIRED_MESSAGE };
  }

  if (title.trim().length < TEST_VALIDATION_RULES.TITLE_MIN_LENGTH) {
    return { isValid: false, message: TEST_VALIDATION_RULES.TITLE_TOO_SHORT_MESSAGE };
  }

  if (title.length > TEST_VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return { isValid: false, message: TEST_VALIDATION_RULES.TITLE_TOO_LONG_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate test description according to backend rules
 */
export const validateTestDescription = (description?: string): { isValid: boolean; message?: string } => {
  if (description && description.length > TEST_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    return { isValid: false, message: TEST_VALIDATION_RULES.DESCRIPTION_TOO_LONG_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate test duration minutes according to backend rules
 */
export const validateTestDurationMinutes = (durationMinutes: number): { isValid: boolean; message?: string } => {
  if (typeof durationMinutes !== 'number' || isNaN(durationMinutes)) {
    return { isValid: false, message: TEST_VALIDATION_RULES.DURATION_MINUTES_REQUIRED_MESSAGE };
  }

  if (durationMinutes < TEST_VALIDATION_RULES.DURATION_MINUTES_MIN || 
      durationMinutes > TEST_VALIDATION_RULES.DURATION_MINUTES_MAX) {
    return { isValid: false, message: TEST_VALIDATION_RULES.DURATION_MINUTES_RANGE_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate test max attempts according to backend rules
 */
export const validateTestMaxAttempts = (maxAttempts: number): { isValid: boolean; message?: string } => {
  if (typeof maxAttempts !== 'number' || isNaN(maxAttempts)) {
    return { isValid: false, message: TEST_VALIDATION_RULES.MAX_ATTEMPTS_REQUIRED_MESSAGE };
  }

  if (maxAttempts < TEST_VALIDATION_RULES.MAX_ATTEMPTS_MIN || 
      maxAttempts > TEST_VALIDATION_RULES.MAX_ATTEMPTS_MAX) {
    return { isValid: false, message: TEST_VALIDATION_RULES.MAX_ATTEMPTS_RANGE_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate test passing percentage according to backend rules
 */
export const validateTestPassingPercentage = (passingPercentage: number): { isValid: boolean; message?: string } => {
  if (typeof passingPercentage !== 'number' || isNaN(passingPercentage)) {
    return { isValid: false, message: TEST_VALIDATION_RULES.PASSING_PERCENTAGE_REQUIRED_MESSAGE };
  }

  if (passingPercentage < TEST_VALIDATION_RULES.PASSING_PERCENTAGE_MIN || 
      passingPercentage > TEST_VALIDATION_RULES.PASSING_PERCENTAGE_MAX) {
    return { isValid: false, message: TEST_VALIDATION_RULES.PASSING_PERCENTAGE_RANGE_MESSAGE };
  }

  return { isValid: true };
};

/**
 * Validate test creation DTO according to backend rules
 */
export const validateTestCreateDto = (dto: CreateTestDto): { isValid: boolean; message?: string } => {
  // Validate title
  const titleValidation = validateTestTitle(dto.title);
  if (!titleValidation.isValid) {
    return titleValidation;
  }

  // Validate description
  const descriptionValidation = validateTestDescription(dto.description);
  if (!descriptionValidation.isValid) {
    return descriptionValidation;
  }

  // Validate test type
  if (!dto.testType) {
    return { isValid: false, message: TEST_VALIDATION_RULES.TEST_TYPE_REQUIRED_MESSAGE };
  }

  // Validate course level
  if (!dto.courseLevel) {
    return { isValid: false, message: TEST_VALIDATION_RULES.COURSE_LEVEL_REQUIRED_MESSAGE };
  }

  // Validate duration minutes
  const durationValidation = validateTestDurationMinutes(dto.durationMinutes);
  if (!durationValidation.isValid) {
    return durationValidation;
  }

  // Validate max attempts
  const maxAttemptsValidation = validateTestMaxAttempts(dto.maxAttempts);
  if (!maxAttemptsValidation.isValid) {
    return maxAttemptsValidation;
  }

  // Validate passing percentage
  const passingPercentageValidation = validateTestPassingPercentage(dto.passingPercentage);
  if (!passingPercentageValidation.isValid) {
    return passingPercentageValidation;
  }

  return { isValid: true };
};

/**
 * Validate test update DTO according to backend rules
 */
export const validateTestUpdateDto = (dto: UpdateTestDto): { isValid: boolean; message?: string } => {
  // Validate title if provided
  if (dto.title !== undefined) {
    const titleValidation = validateTestTitle(dto.title);
    if (!titleValidation.isValid) {
      return titleValidation;
    }
  }

  // Validate description if provided
  if (dto.description !== undefined) {
    const descriptionValidation = validateTestDescription(dto.description);
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  // Validate duration minutes if provided
  if (dto.durationMinutes !== undefined) {
    const durationValidation = validateTestDurationMinutes(dto.durationMinutes);
    if (!durationValidation.isValid) {
      return durationValidation;
    }
  }

  // Validate max attempts if provided
  if (dto.maxAttempts !== undefined) {
    const maxAttemptsValidation = validateTestMaxAttempts(dto.maxAttempts);
    if (!maxAttemptsValidation.isValid) {
      return maxAttemptsValidation;
    }
  }

  // Validate passing percentage if provided
  if (dto.passingPercentage !== undefined) {
    const passingPercentageValidation = validateTestPassingPercentage(dto.passingPercentage);
    if (!passingPercentageValidation.isValid) {
      return passingPercentageValidation;
    }
  }

  return { isValid: true };
};

/**
 * Validate auto test input according to backend rules
 */
export const validateCreateAutoTestInput = (dto: CreateAutoTestInput): { isValid: boolean; message?: string } => {
  if (!dto.testType) {
    return { isValid: false, message: TEST_VALIDATION_RULES.TEST_TYPE_REQUIRED_MESSAGE };
  }

  if (!dto.courseLevel) {
    return { isValid: false, message: TEST_VALIDATION_RULES.COURSE_LEVEL_REQUIRED_MESSAGE };
  }

  return { isValid: true };
};
