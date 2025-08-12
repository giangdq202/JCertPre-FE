import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_TESTS_BY_USER_URL,
  GET_TEST_BY_LESSON_URL,
  CREATE_TEST_BY_LESSON_URL,
  AUTO_CREATE_TEST_URL,
  UPDATE_TEST_URL,
  DELETE_TEST_URL,
  UPDATE_TEST_STATUS_URL,
  GET_TEST_BY_ID_URL,
} from "../consts/apiUrl/baseUrl";
import {
  validateTestCreateDto,
  validateTestUpdateDto,
  validateCreateAutoTestInput
} from "../types/test.types";

export enum TestType {
  JLPTAuto = 0,
  EntryAuto = 1,
  CustomManual = 2,
  CustomAuto = 3,
}

export enum TestStatus {
  Open = 0,
  Close = 1,
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export interface CreateTestDto {
  title: string;
  description?: string; // Made optional to match backend
  testType: TestType;
  courseLevel: CourseLevel;
  durationMinutes: number;
  availableFrom?: string;
  availableTo?: string;
  maxAttempts: number;
  passingPercentage: number;
}

export interface TestDto {
  testId: string;
  title: string;
  description?: string; // Made optional to match backend
  testType: TestType;
  courseLevel: CourseLevel;
  durationMinutes: number;
  lessonId?: string;
  createdByUserId: string;
  availableFrom?: string;
  availableTo?: string;
  maxAttempts: number;
  status: TestStatus;
  testTemplateTypeId?: string;
  testTemplateTypeName?: string;
}

export interface CreateAutoTestInput {
  testType: TestType;
  courseLevel: CourseLevel;
}

export interface CreateAutoTestResult {
  testId: string;
  title: string;
  description: string;
  durationMinutes: number;
  testTemplateTypeId: string;
  passingPercentage: number;
  status: TestStatus;
}

export interface UpdateTestDto {
  title?: string;
  description?: string;
  testType?: TestType;
  courseLevel?: CourseLevel;
  durationMinutes?: number;
  availableFrom?: string;
  availableTo?: string;
  maxAttempts?: number;
  passingPercentage?: number;
}

export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  totalItemsCount: number;
  totalPagesCount: number;
  next: boolean;
  previous: boolean;
  items: T[];
}

export interface GetTestsByUserIdParams {
  userId: string;
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
  testType?: TestType;
  courseLevel?: CourseLevel;
}

/**
 * Get all tests for a user with pagination.
 * @param params - Parameters for getting tests by user ID
 * @returns Promise<Pagination<TestDto>>
 */
export const getAllByUserId = async (params: GetTestsByUserIdParams): Promise<Pagination<TestDto>> => {
  try {
    const { userId, searchTerm, pageIndex = 1, pageSize = 10, testType, courseLevel } = params;
    
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    if (pageIndex) queryParams.append('pageIndex', pageIndex.toString());
    if (pageSize) queryParams.append('pageSize', pageSize.toString());
    if (testType !== undefined) queryParams.append('testType', testType.toString());
    if (courseLevel !== undefined) queryParams.append('courseLevel', courseLevel.toString());

    const url = `${GET_TESTS_BY_USER_URL(userId)}?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Failed to get tests by user ID:", error);
    throw error;
  }
};

/**
 * Get a test by lesson ID.
 * @param lessonId - The lesson ID
 * @returns Promise<TestDto | null>
 */
export const getByLessonId = async (lessonId: string): Promise<TestDto | null> => {
  try {
    const response = await axiosInstance.get(GET_TEST_BY_LESSON_URL(lessonId));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No test found for this lesson
    }
    console.error("Failed to get test by lesson ID:", error);
    throw error;
  }
};

/**
 * Create a test for a lesson.
 * @param userId - The user ID
 * @param lessonId - The lesson ID
 * @param createTestDto - Test details
 * @returns Promise<TestDto>
 */
export const createByLessonId = async (
  userId: string,
  lessonId: string,
  createTestDto: CreateTestDto
): Promise<TestDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateTestCreateDto({
      title: createTestDto.title,
      description: createTestDto.description,
      testType: createTestDto.testType as any, // Type conversion for legacy enum
      courseLevel: createTestDto.courseLevel as any, // Type conversion for legacy enum
      durationMinutes: createTestDto.durationMinutes,
      availableFrom: createTestDto.availableFrom ? new Date(createTestDto.availableFrom) : undefined,
      availableTo: createTestDto.availableTo ? new Date(createTestDto.availableTo) : undefined,
      maxAttempts: createTestDto.maxAttempts,
      passingPercentage: createTestDto.passingPercentage
    });
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    // Ensure all required fields are present and properly formatted
    const requestData = {
      title: createTestDto.title,
      description: createTestDto.description,
      testType: createTestDto.testType,
      courseLevel: createTestDto.courseLevel,
      durationMinutes: createTestDto.durationMinutes || 0,
      maxAttempts: createTestDto.maxAttempts || 3,
      passingPercentage: createTestDto.passingPercentage || 70,
      availableFrom: createTestDto.availableFrom || new Date().toISOString(),
      availableTo: createTestDto.availableTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log("Creating test with data:", requestData);
    console.log("User ID:", userId);
    console.log("Lesson ID:", lessonId);

    // Send userId as query parameter
    const url = `${CREATE_TEST_BY_LESSON_URL(lessonId)}?userId=${userId}`;
    const response = await axiosInstance.post(url, requestData);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create test by lesson ID:", error);
    throw error;
  }
};

/**
 * Update a test.
 * @param testId - The test ID
 * @param updateTestDto - Updated test details
 * @returns Promise<TestDto>
 */
export const updateTest = async (testId: string, updateTestDto: UpdateTestDto): Promise<TestDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateTestUpdateDto({
      title: updateTestDto.title,
      description: updateTestDto.description,
      testType: updateTestDto.testType as any, // Type conversion for legacy enum
      courseLevel: updateTestDto.courseLevel as any, // Type conversion for legacy enum
      durationMinutes: updateTestDto.durationMinutes,
      availableFrom: updateTestDto.availableFrom ? new Date(updateTestDto.availableFrom) : undefined,
      availableTo: updateTestDto.availableTo ? new Date(updateTestDto.availableTo) : undefined,
      maxAttempts: updateTestDto.maxAttempts,
      passingPercentage: updateTestDto.passingPercentage
    });
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.put(UPDATE_TEST_URL(testId), updateTestDto);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update test:", error);
    throw error;
  }
};

/**
 * Delete a test.
 * @param testId - The test ID
 * @returns Promise<void>
 */
export const deleteTest = async (testId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(DELETE_TEST_URL(testId));
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete test:", error);
    throw error;
  }
};

/**
 * Update the status of a test.
 * @param testId - The test ID
 * @param status - New status
 * @returns Promise<TestDto>
 */
export const updateTestStatus = async (testId: string, status: TestStatus): Promise<TestDto> => {
  try {
    console.log("Updating test status:", {
      testId,
      status,
      statusType: typeof status,
      statusValue: status
    });
    
    // Backend expects direct value, not object
    console.log("Request data (direct value):", status);
    
    const response = await axiosInstance.patch(UPDATE_TEST_STATUS_URL(testId), status, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update test status:", error);
    console.error("Error response:", error?.response?.data);
    
    // Log detailed error information
    if (error?.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }
    
    throw error;
  }
};

/**
 * Creates an auto test (JLPTAuto or EntryAuto) and adds questions automatically
 */
export const createAutoTest = async (
  input: CreateAutoTestInput,
  userId: string
): Promise<CreateAutoTestResult> => {
  try {
    // Validate the input before sending to backend
    const validation = validateCreateAutoTestInput({
      testType: input.testType as any, // Type conversion for legacy enum
      courseLevel: input.courseLevel as any // Type conversion for legacy enum
    });
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    console.log("Creating auto test:", input);
    const response = await axiosInstance.post(AUTO_CREATE_TEST_URL(userId), input);
    console.log("Auto test created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create auto test:", error);
    
    // Log detailed error information
    if (error?.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }
    
    throw error;
  }
};

/**
 * Get a test by test ID.
 * @param testId - The test ID
 * @returns Promise<TestDto | null>
 */
export const getByTestId = async (testId: string): Promise<TestDto | null> => {
  try {
    const response = await axiosInstance.get(GET_TEST_BY_ID_URL(testId));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Failed to get test by test ID:", error);
    throw error;
  }
}; 