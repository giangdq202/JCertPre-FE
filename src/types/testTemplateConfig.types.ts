/**
 * DTOs for Test Template Config operations
 * These match the backend validation requirements
 */

export interface TestTemplateConfigDto {
  configId: string;
  templateId: string;
  subContentId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new test template config
 * Matches backend CreateTestTemplateConfigDto validation:
 * - SubContentId: Required, NotDefaultGuid (valid GUID format)
 * - QuestionCount: Required, Range(1, 1000)
 * - PointPerQuestion: Required, Range(1, 100)
 * - TotalPoints: Required, Range(1, 10000)
 * - Sequence: Required, Range(1, 1000)
 */
export interface CreateTestTemplateConfigDto {
  subContentId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
}

/**
 * DTO for updating an existing test template config
 * Matches backend UpdateTestTemplateConfigDto validation:
 * - QuestionCount: Optional, Range(1, 1000)
 * - PointPerQuestion: Optional, Range(1, 100)
 * - TotalPoints: Optional, Range(1, 10000)
 * - Sequence: Optional, Range(1, 1000)
 */
export interface UpdateTestTemplateConfigDto {
  questionCount?: number;
  pointPerQuestion?: number;
  totalPoints?: number;
  sequence?: number;
}

/**
 * Validation rules for test template config fields
 */
export const TEST_TEMPLATE_CONFIG_VALIDATION_RULES = {
  SUB_CONTENT_ID_REQUIRED_MESSAGE: "SubContentId is required.",
  SUB_CONTENT_ID_INVALID_GUID_MESSAGE: "SubContentId must be a valid GUID.",
  
  QUESTION_COUNT_REQUIRED_MESSAGE: "Question count is required.",
  QUESTION_COUNT_MIN: 1,
  QUESTION_COUNT_MAX: 1000,
  QUESTION_COUNT_RANGE_MESSAGE: "Question count must be between 1 and 1000.",
  
  POINT_PER_QUESTION_REQUIRED_MESSAGE: "Point per question is required.",
  POINT_PER_QUESTION_MIN: 1,
  POINT_PER_QUESTION_MAX: 100,
  POINT_PER_QUESTION_RANGE_MESSAGE: "Point per question must be between 1 and 100.",
  
  TOTAL_POINTS_REQUIRED_MESSAGE: "Total points is required.",
  TOTAL_POINTS_MIN: 1,
  TOTAL_POINTS_MAX: 10000,
  TOTAL_POINTS_RANGE_MESSAGE: "Total points must be between 1 and 10000.",
  
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
 * Validate question count according to backend rules
 */
export const validateQuestionCount = (count: number): { isValid: boolean; message?: string } => {
  if (typeof count !== 'number' || isNaN(count)) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_REQUIRED_MESSAGE };
  }
  
  if (count < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_MIN || 
      count > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate point per question according to backend rules
 */
export const validatePointPerQuestion = (points: number): { isValid: boolean; message?: string } => {
  if (typeof points !== 'number' || isNaN(points)) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_REQUIRED_MESSAGE };
  }
  
  if (points < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_MIN || 
      points > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate total points according to backend rules
 */
export const validateTotalPoints = (points: number): { isValid: boolean; message?: string } => {
  if (typeof points !== 'number' || isNaN(points)) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_REQUIRED_MESSAGE };
  }
  
  if (points < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_MIN || 
      points > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate sequence according to backend rules
 */
export const validateSequence = (sequence: number): { isValid: boolean; message?: string } => {
  if (typeof sequence !== 'number' || isNaN(sequence)) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_REQUIRED_MESSAGE };
  }
  
  if (sequence < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_MIN || 
      sequence > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_MAX) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_RANGE_MESSAGE };
  }
  
  return { isValid: true };
};

/**
 * Validate create test template config DTO according to backend rules
 */
export const validateCreateTestTemplateConfigDto = (dto: CreateTestTemplateConfigDto): { isValid: boolean; message?: string } => {
  // Validate SubContentId
  if (!dto.subContentId || dto.subContentId.trim().length === 0) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SUB_CONTENT_ID_REQUIRED_MESSAGE };
  }
  
  if (!isValidGuid(dto.subContentId)) {
    return { isValid: false, message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SUB_CONTENT_ID_INVALID_GUID_MESSAGE };
  }
  
  // Validate question count
  const questionCountValidation = validateQuestionCount(dto.questionCount);
  if (!questionCountValidation.isValid) {
    return questionCountValidation;
  }
  
  // Validate point per question
  const pointPerQuestionValidation = validatePointPerQuestion(dto.pointPerQuestion);
  if (!pointPerQuestionValidation.isValid) {
    return pointPerQuestionValidation;
  }
  
  // Validate total points
  const totalPointsValidation = validateTotalPoints(dto.totalPoints);
  if (!totalPointsValidation.isValid) {
    return totalPointsValidation;
  }
  
  // Validate sequence
  const sequenceValidation = validateSequence(dto.sequence);
  if (!sequenceValidation.isValid) {
    return sequenceValidation;
  }
  
  return { isValid: true };
};

/**
 * Validate update test template config DTO according to backend rules
 */
export const validateUpdateTestTemplateConfigDto = (dto: UpdateTestTemplateConfigDto): { isValid: boolean; message?: string } => {
  // Validate question count if provided
  if (dto.questionCount !== undefined) {
    const questionCountValidation = validateQuestionCount(dto.questionCount);
    if (!questionCountValidation.isValid) {
      return questionCountValidation;
    }
  }
  
  // Validate point per question if provided
  if (dto.pointPerQuestion !== undefined) {
    const pointPerQuestionValidation = validatePointPerQuestion(dto.pointPerQuestion);
    if (!pointPerQuestionValidation.isValid) {
      return pointPerQuestionValidation;
    }
  }
  
  // Validate total points if provided
  if (dto.totalPoints !== undefined) {
    const totalPointsValidation = validateTotalPoints(dto.totalPoints);
    if (!totalPointsValidation.isValid) {
      return totalPointsValidation;
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
