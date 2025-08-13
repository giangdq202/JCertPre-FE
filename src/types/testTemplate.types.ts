/**
 * DTOs for Test Template operations
 * These match the backend validation requirements
 */

export interface TestTemplateDto {
  testTemplateId: string;
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new test template
 * Matches backend CreateTestTemplateDto validation:
 * - TestTemplateTypeId: Required, NotDefaultGuid (valid GUID format)
 * - TemplateName: Required, MinLength(3), MaxLength(200)
 * - DurationMinutes: Required, Range(1, 1000)
 * - TotalScore: Required, Range(1, 10000)
 * - ToPassPercentage: Required, Range(0, 100)
 * - Sequence: Required, Range(1, 1000)
 */
export interface CreateTestTemplateDto {
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
}

/**
 * DTO for updating an existing test template
 * Matches backend UpdateTestTemplateDto validation:
 * - TemplateName: Optional, MinLength(3), MaxLength(200)
 * - DurationMinutes: Optional, Range(1, 1000)
 * - TotalScore: Optional, Range(1, 10000)
 * - ToPassPercentage: Optional, Range(0, 100)
 * - Sequence: Optional, Range(1, 1000)
 */
export interface UpdateTestTemplateDto {
  templateName?: string;
  durationMinutes?: number;
  totalScore?: number;
  toPassPercentage?: number;
  sequence?: number;
}

/**
 * Validation rules for test template fields
 */
export const TEST_TEMPLATE_VALIDATION_RULES = {
  TEST_TEMPLATE_TYPE_ID_REQUIRED_MESSAGE: "TestTemplateTypeId is required.",
  TEST_TEMPLATE_TYPE_ID_INVALID_GUID_MESSAGE: "TestTemplateTypeId must be a valid GUID.",
  
  TEMPLATE_NAME_REQUIRED_MESSAGE: "Template name is required.",
  TEMPLATE_NAME_MIN_LENGTH: 3,
  TEMPLATE_NAME_MAX_LENGTH: 200,
  TEMPLATE_NAME_TOO_SHORT_MESSAGE: "Template name must be at least 3 characters.",
  TEMPLATE_NAME_TOO_LONG_MESSAGE: "Template name cannot exceed 200 characters.",
  
  DURATION_MINUTES_REQUIRED_MESSAGE: "Duration minutes is required.",
  DURATION_MINUTES_MIN: 1,
  DURATION_MINUTES_MAX: 1000,
  DURATION_MINUTES_RANGE_MESSAGE: "Duration minutes must be between 1 and 1000.",
  
  TOTAL_SCORE_REQUIRED_MESSAGE: "Total score is required.",
  TOTAL_SCORE_MIN: 1,
  TOTAL_SCORE_MAX: 10000,
  TOTAL_SCORE_RANGE_MESSAGE: "Total score must be between 1 and 10000.",
  
  TO_PASS_PERCENTAGE_REQUIRED_MESSAGE: "To pass percentage is required.",
  TO_PASS_PERCENTAGE_MIN: 0,
  TO_PASS_PERCENTAGE_MAX: 100,
  TO_PASS_PERCENTAGE_RANGE_MESSAGE: "To pass percentage must be between 0 and 100.",
  
  SEQUENCE_REQUIRED_MESSAGE: "Sequence is required.",
  SEQUENCE_MIN: 1,
  SEQUENCE_MAX: 1000,
  SEQUENCE_RANGE_MESSAGE: "Sequence must be between 1 and 1000."
} as const;

/**
 * Utility function to validate GUID format
 */
export const isValidGuid = (guid: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

/**
 * Validate template name according to backend rules
 */
export const validateTemplateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_REQUIRED_MESSAGE };
  }
  
  if (name.trim().length < TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_MIN_LENGTH) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_TOO_SHORT_MESSAGE };
  }
  
  if (name.trim().length > TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_TOO_LONG_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate duration minutes according to backend rules
 */
export const validateDurationMinutes = (duration: number): { isValid: boolean; message?: string } => {
  if (typeof duration !== 'number' || isNaN(duration)) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_REQUIRED_MESSAGE };
  }
  
  if (duration < TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_MIN || 
      duration > TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate total score according to backend rules
 */
export const validateTotalScore = (score: number): { isValid: boolean; message?: string } => {
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_REQUIRED_MESSAGE };
  }
  
  if (score < TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_MIN || 
      score > TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate to pass percentage according to backend rules
 */
export const validateToPassPercentage = (percentage: number): { isValid: boolean; message?: string } => {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_REQUIRED_MESSAGE };
  }
  
  if (percentage < TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_MIN || 
      percentage > TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate sequence according to backend rules
 */
export const validateSequence = (sequence: number): { isValid: boolean; message?: string } => {
  if (typeof sequence !== 'number' || isNaN(sequence)) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_REQUIRED_MESSAGE };
  }
  
  if (sequence < TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_MIN || 
      sequence > TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate create test template DTO according to backend rules
 */
export const validateCreateTestTemplateDto = (dto: CreateTestTemplateDto): { isValid: boolean; message?: string } => {
  // Validate TestTemplateTypeId
  if (!dto.testTemplateTypeId || dto.testTemplateTypeId.trim().length === 0) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TEST_TEMPLATE_TYPE_ID_REQUIRED_MESSAGE };
  }
  
  if (!isValidGuid(dto.testTemplateTypeId)) {
    return { isValid: false, message: TEST_TEMPLATE_VALIDATION_RULES.TEST_TEMPLATE_TYPE_ID_INVALID_GUID_MESSAGE };
  }
  
  // Validate template name
  const nameValidation = validateTemplateName(dto.templateName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Validate duration minutes
  const durationValidation = validateDurationMinutes(dto.durationMinutes);
  if (!durationValidation.isValid) {
    return durationValidation;
  }
  
  // Validate total score
  const scoreValidation = validateTotalScore(dto.totalScore);
  if (!scoreValidation.isValid) {
    return scoreValidation;
  }
  
  // Validate to pass percentage
  const percentageValidation = validateToPassPercentage(dto.toPassPercentage);
  if (!percentageValidation.isValid) {
    return percentageValidation;
  }
  
  // Validate sequence
  const sequenceValidation = validateSequence(dto.sequence);
  if (!sequenceValidation.isValid) {
    return sequenceValidation;
  }
  
  return { isValid: true };
};

/**
 * Validate update test template DTO according to backend rules
 */
export const validateUpdateTestTemplateDto = (dto: UpdateTestTemplateDto): { isValid: boolean; message?: string } => {
  // Validate template name if provided
  if (dto.templateName !== undefined) {
    const nameValidation = validateTemplateName(dto.templateName);
    if (!nameValidation.isValid) {
      return nameValidation;
    }
  }
  
  // Validate duration minutes if provided
  if (dto.durationMinutes !== undefined) {
    const durationValidation = validateDurationMinutes(dto.durationMinutes);
    if (!durationValidation.isValid) {
      return durationValidation;
    }
  }
  
  // Validate total score if provided
  if (dto.totalScore !== undefined) {
    const scoreValidation = validateTotalScore(dto.totalScore);
    if (!scoreValidation.isValid) {
      return scoreValidation;
    }
  }
  
  // Validate to pass percentage if provided
  if (dto.toPassPercentage !== undefined) {
    const percentageValidation = validateToPassPercentage(dto.toPassPercentage);
    if (!percentageValidation.isValid) {
      return percentageValidation;
    }
  }
  
  // Validate sequence if provided
  if (dto.sequence !== undefined) {
    const sequenceValidation = validateSequence(dto.sequence);
    if (!sequenceValidation.isValid) {
      return sequenceValidation;
    }
  }
  
  return { isValid: true };
};
