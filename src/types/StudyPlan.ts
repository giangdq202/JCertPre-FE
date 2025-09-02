// ====== ENUMS ======

export enum ItemStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  SKIPPED = 3
}

// ====== MAIN INTERFACES ======

export interface StudyPlanDto {
  planId: string;
  studentId: string;
  createdByStaffId: string;
  planName: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface StudyPlanItemDto {
  itemId: string;
  planId: string;
  sequence: number;
  itemType: string;
  courseId?: string;
  testTemplateTypeId?: string; // Changed from testId to testTemplateTypeId
  status: ItemStatus;
  description?: string; // Added description field
}

// ====== REQUEST INTERFACES ======

export interface CreateStudyPlanRequest {
  studentId: string;
  createdByStaffId: string;
  planName: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface UpdateStudyPlanRequest {
  planName?: string;
  description?: string;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  studentId?: string;
}

export interface CreateStudyPlanItemRequest {
  planId: string;
  sequence: number;
  itemType: string;
  courseId?: string;
  testTemplateTypeId?: string; // Changed from testId to testTemplateTypeId
  status?: ItemStatus;
  description?: string; // Added description field
}

export interface UpdateStudyPlanItemRequest {
  sequence?: number;
  itemType?: string;
  courseId?: string;
  testTemplateTypeId?: string; // Changed from testId to testTemplateTypeId
  status?: ItemStatus;
  description?: string; // Added description field
}

// ====== EXTENDED INTERFACES ======

export interface StudyPlanWithItems extends StudyPlanDto {
  items: StudyPlanItemDto[];
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
}

export interface StudyPlanItemWithDetails extends StudyPlanItemDto {
  courseName?: string;
  testName?: string;
  description?: string;
  estimatedDuration?: number; // in hours
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

// ====== SUMMARY INTERFACES ======

export interface StudyPlanSummary {
  planId: string;
  planName: string;
  studentName: string;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  startDate: string;
  endDate: string;
  isOverdue: boolean;
  daysRemaining: number;
}

export interface StudyPlanStatusSummary {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  skipped: number;
}

// ====== FILTER/QUERY INTERFACES ======

export interface StudyPlanFilters {
  studentId?: string;
  createdByStaffId?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface StudyPlanItemFilters {
  planId?: string;
  itemType?: string;
  status?: ItemStatus;
  courseId?: string;
  testId?: string;
}

// ====== VALIDATION INTERFACES ======

export interface StudyPlanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StudyPlanItemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}