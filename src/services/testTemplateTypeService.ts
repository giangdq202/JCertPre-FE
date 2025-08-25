import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_TEST_TEMPLATE_TYPES_URL,
  CREATE_TEST_TEMPLATE_TYPE_URL,
  UPDATE_TEST_TEMPLATE_TYPE_URL,
  DELETE_TEST_TEMPLATE_TYPE_URL,
  UPDATE_TEST_TEMPLATE_TYPE_ACTIVE_URL,
  VERIFY_TEST_TEMPLATE_TYPE_URL,
} from "../consts/apiUrl/baseUrl";
import {
  validateCreateTestTemplateTypeDto,
  validateUpdateTestTemplateTypeDto
} from "../types/testTemplateType.types";

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum TestType {
  JLPTAuto = 0,
  EntryAuto = 1,
  CustomManual = 2,
}

export interface CreateTestTemplateTypeDto {
  userId: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  totalTestScore: number;
  totalPassPercentage: number;
}

export interface TestTemplateTypeDto {
  testTemplateTypeId: string;
  userId: string;
  createdByUserName?: string;
  verifiedUserId?: string;
  verifiedByUserName?: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  isActive: boolean;
  createdAt: string;
  totalTestScore: number;
  totalPassPercentage: number;
}

export interface UpdateTestTemplateTypeDto {
  typeName?: string;
  courseLevel?: CourseLevel;
  testType?: TestType;
  description?: string;
  isActive?: boolean;
  totalTestScore?: number;
  totalPassPercentage?: number;
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

export interface GetAllTestTemplateTypesParams {
  search?: string;
  level?: CourseLevel;
  type?: TestType;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * Get all test template types with search, filter, and paging.
 * @param params - Parameters for getting test template types
 * @returns Promise<Pagination<TestTemplateTypeDto>>
 */
export const getAllTestTemplateTypes = async (params: GetAllTestTemplateTypesParams = {}): Promise<Pagination<TestTemplateTypeDto>> => {
  try {
    const { search, level, type, isActive, pageIndex = 1, pageSize = 10 } = params;
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (level !== undefined) queryParams.append('level', level.toString());
    if (type !== undefined) queryParams.append('type', type.toString());
    if (isActive !== undefined) queryParams.append('isActive', isActive.toString());
    if (pageIndex) queryParams.append('pageIndex', pageIndex.toString());
    if (pageSize) queryParams.append('pageSize', pageSize.toString());

    const url = `${GET_TEST_TEMPLATE_TYPES_URL}?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to get test template types:", error);
    throw error;
  }
};

/**
 * Create a new test template type.
 * @param dto - The create test template type data
 * @returns Promise<TestTemplateTypeDto>
 */
export const createTestTemplateType = async (dto: CreateTestTemplateTypeDto): Promise<TestTemplateTypeDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateCreateTestTemplateTypeDto(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.post(CREATE_TEST_TEMPLATE_TYPE_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to create test template type:", error);
    throw error;
  }
};

/**
 * Update a test template type by id.
 * @param testTemplateTypeId - The test template type ID
 * @param dto - The update test template type data
 * @returns Promise<TestTemplateTypeDto>
 */
export const updateTestTemplateType = async (
  testTemplateTypeId: string,
  dto: UpdateTestTemplateTypeDto
): Promise<TestTemplateTypeDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateUpdateTestTemplateTypeDto(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.put(UPDATE_TEST_TEMPLATE_TYPE_URL(testTemplateTypeId), dto);
    return response.data;
  } catch (error) {
    console.error("Failed to update test template type:", error);
    throw error;
  }
};

/**
 * Delete a test template type by id.
 * @param testTemplateTypeId - The test template type ID
 * @returns Promise<void>
 */
export const deleteTestTemplateType = async (testTemplateTypeId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(DELETE_TEST_TEMPLATE_TYPE_URL(testTemplateTypeId));
    return response.data;
  } catch (error) {
    console.error("Failed to delete test template type:", error);
    throw error;
  }
};

/**
 * Update only the isActive field of a test template type by id.
 * @param testTemplateTypeId - The test template type ID
 * @param isActive - The new active status
 * @returns Promise<TestTemplateTypeDto>
 */
export const updateTestTemplateTypeIsActive = async (
  testTemplateTypeId: string,
  isActive: boolean
): Promise<TestTemplateTypeDto> => {
  try {
    const response = await axiosInstance.patch(UPDATE_TEST_TEMPLATE_TYPE_ACTIVE_URL(testTemplateTypeId), null, {
      params: { isActive }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update test template type isActive:", error);
    throw error;
  }
};

/**
 * Verify a test template type by id.
 * @param testTemplateTypeId - The test template type ID
 * @param userId - The user ID who is verifying
 * @returns Promise<TestTemplateTypeDto>
 */
export const verifyTestTemplateType = async (
  testTemplateTypeId: string,
  userId: string
): Promise<TestTemplateTypeDto> => {
  try {
    const response = await axiosInstance.post(VERIFY_TEST_TEMPLATE_TYPE_URL(testTemplateTypeId), null, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to verify test template type:", error);
    throw error;
  }
}; 