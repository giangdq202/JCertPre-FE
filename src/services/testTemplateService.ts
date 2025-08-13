import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_TEST_TEMPLATES_BY_TYPE_URL,
  CREATE_TEST_TEMPLATE_URL,
  UPDATE_TEST_TEMPLATE_URL,
  DELETE_TEST_TEMPLATE_URL,
} from "../consts/apiUrl/baseUrl";
import {
  validateCreateTestTemplateDto,
  validateUpdateTestTemplateDto
} from "../types/testTemplate.types";

export interface CreateTestTemplateDto {
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
}

export interface TestTemplateDto {
  templateId: string;
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
}

export interface UpdateTestTemplateDto {
  templateName?: string;
  durationMinutes?: number;
  totalScore?: number;
  toPassPercentage?: number;
  sequence?: number;
}

/**
 * Get all test templates by testTemplateTypeId.
 * @param testTemplateTypeId - The test template type ID
 * @returns Promise<TestTemplateDto[]>
 */
export const getAllByTypeId = async (testTemplateTypeId: string): Promise<TestTemplateDto[]> => {
  try {
    const response = await axiosInstance.get(GET_TEST_TEMPLATES_BY_TYPE_URL(testTemplateTypeId));
    return response.data;
  } catch (error) {
    console.error("Failed to get test templates by type ID:", error);
    throw error;
  }
};

/**
 * Create a new test template.
 * @param dto - The create test template data
 * @returns Promise<TestTemplateDto>
 */
export const createTestTemplate = async (dto: CreateTestTemplateDto): Promise<TestTemplateDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateCreateTestTemplateDto(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.post(CREATE_TEST_TEMPLATE_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to create test template:", error);
    throw error;
  }
};

/**
 * Update a test template by templateId.
 * @param templateId - The template ID
 * @param dto - The update test template data
 * @returns Promise<TestTemplateDto>
 */
export const updateTestTemplate = async (
  templateId: string,
  dto: UpdateTestTemplateDto
): Promise<TestTemplateDto> => {
  try {
    // Validate the DTO before sending to backend
    const validation = validateUpdateTestTemplateDto(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.message}`);
    }

    const response = await axiosInstance.put(UPDATE_TEST_TEMPLATE_URL(templateId), dto);
    return response.data;
  } catch (error) {
    console.error("Failed to update test template:", error);
    throw error;
  }
};

/**
 * Delete a test template by templateId.
 * @param templateId - The template ID
 * @returns Promise<void>
 */
export const deleteTestTemplate = async (templateId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(DELETE_TEST_TEMPLATE_URL(templateId));
    return response.data;
  } catch (error) {
    console.error("Failed to delete test template:", error);
    throw error;
  }
}; 