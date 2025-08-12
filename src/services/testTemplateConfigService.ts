import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_TEST_TEMPLATE_CONFIGS_BY_TEMPLATE_URL,
  GET_TEST_TEMPLATE_CONFIG_URL,
  CREATE_TEST_TEMPLATE_CONFIG_URL,
  UPDATE_TEST_TEMPLATE_CONFIG_URL,
  DELETE_TEST_TEMPLATE_CONFIG_URL,
} from "../consts/apiUrl/baseUrl";
import {
  validateCreateTestTemplateConfigDto,
  validateUpdateTestTemplateConfigDto
} from "../types/testTemplateConfig.types";

export interface CreateTestTemplateConfigDto {
  subContentId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
}

export interface TestTemplateConfigDto {
  configId: string;
  templateId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
  subContent?: SubContentDto;
}

export interface UpdateTestTemplateConfigDto {
  questionCount?: number;
  pointPerQuestion?: number;
  totalPoints?: number;
  sequence?: number;
}

export interface SubContentDto {
  subContentId: string;
  subContentName: string;
  subContentNameDescription: string;
  level: string;
  levelDescription: string;
  contentName: string;
  contentNameDescription: string;
}

/**
 * Get all test template configs by templateId.
 * @param templateId - The template ID
 * @returns Promise<TestTemplateConfigDto[]>
 */
export const getAllByTemplateId = async (templateId: string): Promise<TestTemplateConfigDto[]> => {
  try {
    const response = await axiosInstance.get(GET_TEST_TEMPLATE_CONFIGS_BY_TEMPLATE_URL(templateId));
    return response.data;
  } catch (error) {
    console.error("Failed to get test template configs by template ID:", error);
    throw error;
  }
};

/**
 * Get a test template config by configId.
 * @param configId - The config ID
 * @returns Promise<TestTemplateConfigDto | null>
 */
export const getByConfigId = async (configId: string): Promise<TestTemplateConfigDto | null> => {
  try {
    const response = await axiosInstance.get(GET_TEST_TEMPLATE_CONFIG_URL(configId));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Failed to get test template config by config ID:", error);
    throw error;
  }
};

/**
 * Create a test template config by templateId.
 * @param templateId - The template ID
 * @param dto - The create test template config data
 * @returns Promise<TestTemplateConfigDto>
 */
export const createTestTemplateConfig = async (
  templateId: string,
  dto: CreateTestTemplateConfigDto
): Promise<TestTemplateConfigDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateCreateTestTemplateConfigDto(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.post(CREATE_TEST_TEMPLATE_CONFIG_URL(templateId), dto);
    return response.data;
  } catch (error) {
    console.error("Failed to create test template config:", error);
    throw error;
  }
};

/**
 * Update a test template config by configId.
 * @param configId - The config ID
 * @param dto - The update test template config data
 * @returns Promise<TestTemplateConfigDto>
 */
export const updateTestTemplateConfig = async (
  configId: string,
  dto: UpdateTestTemplateConfigDto
): Promise<TestTemplateConfigDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateUpdateTestTemplateConfigDto(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.put(UPDATE_TEST_TEMPLATE_CONFIG_URL(configId), dto);
    return response.data;
  } catch (error) {
    console.error("Failed to update test template config:", error);
    throw error;
  }
};

/**
 * Delete a test template config by configId.
 * @param configId - The config ID
 * @returns Promise<void>
 */
export const deleteTestTemplateConfig = async (configId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(DELETE_TEST_TEMPLATE_CONFIG_URL(configId));
    return response.data;
  } catch (error) {
    console.error("Failed to delete test template config:", error);
    throw error;
  }
}; 