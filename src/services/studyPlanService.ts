import axiosInstance from '../consts/axios/axiosInstance';
import {
  STUDY_PLAN_BASE_URL,
  GET_STUDY_PLAN_BY_ID_URL,
  CREATE_STUDY_PLAN_URL,
  GET_ALL_STUDY_PLANS_URL,
  GET_STUDY_PLANS_BY_STUDENT_URL,
  UPDATE_STUDY_PLAN_URL
} from '../consts/apiUrl/baseUrl';

// ====== IMPORTS ======

export type {
  ItemStatus,
  StudyPlanDto,
  StudyPlanItemDto,
  CreateStudyPlanRequest,
  UpdateStudyPlanRequest,
  UpdateStudyPlanItemRequest,
  StudyPlanWithItems,
  StudyPlanSummary,
  StudyPlanStatusSummary,
  StudyPlanFilters,
  StudyPlanValidationResult
} from '../types/StudyPlan';

import {
  ItemStatus,
  StudyPlanDto,
  CreateStudyPlanRequest,
  UpdateStudyPlanRequest
} from '../types/StudyPlan';

// ====== ADDITIONAL INTERFACES ======

export interface ApiErrorResponse {
  message: string;
  errors?: { [key: string]: string[] };
}

// ====== SERVICE FUNCTIONS ======

/**
 * Creates a new study plan
 */
export const createStudyPlan = async (studyPlanData: CreateStudyPlanRequest): Promise<StudyPlanDto> => {
  try {
    console.log('Creating study plan:', studyPlanData);
    
    const response = await axiosInstance.post<StudyPlanDto>(
      CREATE_STUDY_PLAN_URL,
      studyPlanData
    );
    
    console.log('Study plan created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create study plan API error:', error);
    throw error;
  }
};

/**
 * Gets a study plan by ID
 */
export const getStudyPlanById = async (planId: string): Promise<StudyPlanDto> => {
  try {
    console.log('Getting study plan by ID:', planId);
    
    const response = await axiosInstance.get<StudyPlanDto>(
      GET_STUDY_PLAN_BY_ID_URL(planId)
    );
    
    console.log('Study plan retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get study plan by ID API error:', error);
    throw error;
  }
};

/**
 * Gets all study plans
 */
export const getAllStudyPlans = async (): Promise<StudyPlanDto[]> => {
  try {
    console.log('Getting all study plans');
    
    const response = await axiosInstance.get<StudyPlanDto[]>(
      GET_ALL_STUDY_PLANS_URL
    );
    
    console.log('All study plans retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get all study plans API error:', error);
    throw error;
  }
};

/**
 * Gets study plans for a specific student
 */
export const getStudyPlansByStudentId = async (studentId: string): Promise<StudyPlanDto[]> => {
  try {
    console.log('Getting study plans by student ID:', studentId);
    
    const response = await axiosInstance.get<StudyPlanDto[]>(
      GET_STUDY_PLANS_BY_STUDENT_URL(studentId)
    );
    
    console.log('Student study plans retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get study plans by student ID API error:', error);
    throw error;
  }
};

/**
 * Updates an existing study plan
 */
export const updateStudyPlan = async (
  planId: string, 
  updateData: UpdateStudyPlanRequest
): Promise<StudyPlanDto> => {
  try {
    console.log('Updating study plan:', planId, updateData);
    
    const response = await axiosInstance.put<StudyPlanDto>(
      UPDATE_STUDY_PLAN_URL(planId),
      updateData
    );
    
    console.log('Study plan updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update study plan API error:', error);
    throw error;
  }
};

/**
 * Deletes a study plan (if supported by backend)
 */
export const deleteStudyPlan = async (planId: string): Promise<void> => {
  try {
    console.log('Deleting study plan:', planId);
    
    await axiosInstance.delete(`${STUDY_PLAN_BASE_URL}/${planId}`);
    
    console.log('Study plan deleted successfully');
  } catch (error) {
    console.error('Delete study plan API error:', error);
    throw error;
  }
};

// ====== UTILITY FUNCTIONS ======

/**
 * Formats date for API (ISO string)
 */
export const formatDateForApi = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parses date from API response
 */
export const parseDateFromApi = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Validates study plan dates
 */
export const validateStudyPlanDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

/**
 * Gets status display text
 */
export const getItemStatusText = (status: ItemStatus): string => {
  switch (status) {
    case ItemStatus.NOT_STARTED:
      return 'Chưa bắt đầu';
    case ItemStatus.IN_PROGRESS:
      return 'Đang thực hiện';
    case ItemStatus.COMPLETED:
      return 'Hoàn thành';
    case ItemStatus.SKIPPED:
      return 'Bỏ qua';
    default:
      return 'Không xác định';
  }
};

/**
 * Gets status color class
 */
export const getItemStatusColor = (status: ItemStatus): string => {
  switch (status) {
    case ItemStatus.NOT_STARTED:
      return 'text-gray-500 bg-gray-100';
    case ItemStatus.IN_PROGRESS:
      return 'text-blue-600 bg-blue-100';
    case ItemStatus.COMPLETED:
      return 'text-green-600 bg-green-100';
    case ItemStatus.SKIPPED:
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
};

// ====== DEBUG/TESTING FUNCTIONS ======

/**
 * Debug function to test all study plan APIs
 */
export const debugStudyPlanAPI = async () => {
  console.group('=== STUDY PLAN API DEBUG ===');
  
  try {
    // Test get all study plans
    console.log('1. Testing getAllStudyPlans...');
    const allPlans = await getAllStudyPlans();
    console.log('All plans:', allPlans);
    
    if (allPlans.length > 0) {
      // Test get by ID
      console.log('2. Testing getStudyPlanById...');
      const firstPlan = await getStudyPlanById(allPlans[0].planId);
      console.log('First plan:', firstPlan);
      
      // Test get by student ID
      console.log('3. Testing getStudyPlansByStudentId...');
      const studentPlans = await getStudyPlansByStudentId(allPlans[0].studentId);
      console.log('Student plans:', studentPlans);
    }
    
  } catch (error) {
    console.error('Study plan API debug error:', error);
  }
  
  console.groupEnd();
};

/**
 * Example usage of study plan service
 */
export const studyPlanServiceExamples = () => {
  console.group('=== STUDY PLAN SERVICE EXAMPLES ===');
  
  console.log(`
// Create a new study plan
const newPlan = await createStudyPlan({
  studentId: "student-guid-here",
  createdByStaffId: "staff-guid-here",
  planName: "Khóa học N1 - Học viên A",
  description: "Kế hoạch học tập 6 tháng cho kỳ thi JLPT N1",
  startDate: "2024-01-01T00:00:00.000Z",
  endDate: "2024-06-30T23:59:59.000Z"
});

// Get study plan by ID
const plan = await getStudyPlanById("plan-guid-here");

// Get all study plans
const allPlans = await getAllStudyPlans();

// Get student's study plans
const studentPlans = await getStudyPlansByStudentId("student-guid-here");

// Update study plan
const updatedPlan = await updateStudyPlan("plan-guid-here", {
  planName: "Khóa học N1 - Cập nhật",
  description: "Mô tả đã được cập nhật"
});

// Utility functions
const isValidDates = validateStudyPlanDates(startDate, endDate);
const statusText = getItemStatusText(ItemStatus.IN_PROGRESS);
const statusColor = getItemStatusColor(ItemStatus.COMPLETED);
  `);
  
  console.groupEnd();
};
