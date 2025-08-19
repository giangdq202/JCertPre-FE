import axiosInstance from "../consts/axios/axiosInstance";
import {
  QUESTION_BASE_URL,
  CHOICE_BASE_URL,
  IMPORT_QUESTIONS_URL,
} from "../consts/apiUrl/baseUrl";
import {
  ChoiceReadDto,
  ChoiceCreateDto,
  ChoiceUpdateDto
} from "../types/choice.types";
import {
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  validateQuestionCreateDto,
  validateQuestionUpdateDto,
  ImportQuestionsResultDto
} from "../types/question.types";

// Import enums from types instead of duplicating them
import {
  ContentName,
  CourseLevel,
  SubContentName
} from "../types/question.types";

export interface QuestionAttachmentDto {
  mediaUrl: string;
  mediaType: string;
}

export interface ImportFailedQuestionsBlob extends Blob {
  importSummary?: {
    totalCount: number;
    successCount: number;
    failedCount: number;
  };
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

// Get all questions (for staff - includes both active and inactive)
export const getAllQuestions = async (): Promise<QuestionDto[]> => {
  // Use the paging endpoint with a large page size to get all questions
  // Backend uses 1-based indexing, so pageIndex=1 is the first page
  const { data } = await axiosInstance.get<Pagination<QuestionDto>>(`${QUESTION_BASE_URL}/paging-details?pageIndex=1&pageSize=1000`);
  return data.items;
};

// Get active questions only (for students)
export const getActiveQuestions = async (): Promise<QuestionDto[]> => {
  // Use the paging endpoint with isActive=true filter to get only active questions
  const { data } = await axiosInstance.get<Pagination<QuestionDto>>(`${QUESTION_BASE_URL}/paging-details?pageIndex=1&pageSize=1000&isActive=true`);
  return data.items;
};

export const getQuestionById = async (id: string): Promise<QuestionDto> => {
  const { data } = await axiosInstance.get<QuestionDto>(`${QUESTION_BASE_URL}/${id}`);
  return data;
};

export const createQuestion = async (dto: CreateQuestionDto): Promise<QuestionDto> => {
  // Validate the DTO before sending to backend
  const validation = validateQuestionCreateDto({
    content: dto.content,
    explanation: dto.explanation,
    points: dto.points,
    difficulty: dto.difficulty,
    isActive: dto.isActive,
    contentName: dto.contentName,
    level: dto.level,
    subContentName: dto.subContentName,
    audioFile: dto.audioFile
  });
  
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.message}`);
  }

  // Create FormData for multipart/form-data request
  const formData = new FormData();
  
  // Add all text fields
  formData.append('content', dto.content);
  if (dto.explanation) {
    formData.append('explanation', dto.explanation);
  }
  formData.append('points', dto.points.toString());
  formData.append('difficulty', dto.difficulty.toString());
  formData.append('isActive', dto.isActive.toString());
  formData.append('contentName', dto.contentName.toString());
  formData.append('level', dto.level.toString());
  formData.append('subContentName', dto.subContentName.toString());
  
  // Add audio file if provided
  if (dto.audioFile) {
    formData.append('audioFile', dto.audioFile);
  }

  const { data } = await axiosInstance.post<QuestionDto>(QUESTION_BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateQuestion = async (id: string, dto: UpdateQuestionDto): Promise<QuestionDto> => {
  // Validate the DTO before sending to backend
  const validation = validateQuestionUpdateDto({
    content: dto.content,
    explanation: dto.explanation,
    points: dto.points,
    difficulty: dto.difficulty,
    isActive: dto.isActive,
    contentName: dto.contentName,
    level: dto.level,
    subContentName: dto.subContentName,
    audioFile: dto.audioFile
  });
  
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.message}`);
  }

  // Create FormData for multipart/form-data request
  const formData = new FormData();
  
  // Add all text fields that are provided
  if (dto.content !== undefined) {
    formData.append('content', dto.content);
  }
  if (dto.explanation !== undefined) {
    formData.append('explanation', dto.explanation);
  }
  if (dto.points !== undefined) {
    formData.append('points', dto.points.toString());
  }
  if (dto.difficulty !== undefined) {
    formData.append('difficulty', dto.difficulty.toString());
  }
  if (dto.isActive !== undefined) {
    formData.append('isActive', dto.isActive.toString());
  }
  if (dto.contentName !== undefined) {
    formData.append('contentName', dto.contentName.toString());
  }
  if (dto.level !== undefined) {
    formData.append('level', dto.level.toString());
  }
  if (dto.subContentName !== undefined) {
    formData.append('subContentName', dto.subContentName.toString());
  }
  
  // Add audio file if provided
  if (dto.audioFile) {
    formData.append('audioFile', dto.audioFile);
  }

  const { data } = await axiosInstance.put<QuestionDto>(`${QUESTION_BASE_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${QUESTION_BASE_URL}/${id}`);
};

// Toggle question active status (staff only) - using update API
export const toggleQuestionActiveStatus = async (questionId: string, isActive: boolean) => {
  try {
    // Use the existing updateQuestion API to change only the isActive status
    const updateDto: UpdateQuestionDto = {
      isActive: isActive
    };
    
    const response = await updateQuestion(questionId, updateDto);
    return response;
  } catch (error: any) {
    console.error(`ToggleQuestionActiveStatus API error for ID ${questionId}:`, error);
    throw error;
  }
};

export interface GetQuestionsPagingDetailsParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  contentName?: ContentName;
  level?: CourseLevel;
  subContentName?: SubContentName;
}

export const getQuestionsPagingDetails = async (params: GetQuestionsPagingDetailsParams = {}): Promise<Pagination<QuestionDto>> => {
  const query = new URLSearchParams();
  // Backend uses 1-based indexing, ensure pageIndex is at least 1
  const pageIndex = params.pageIndex && params.pageIndex > 0 ? params.pageIndex : 1;
  query.append("pageIndex", pageIndex.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  if (params.search) query.append("search", params.search);
  if (params.contentName !== undefined) query.append("contentName", params.contentName.toString());
  if (params.level !== undefined) query.append("level", params.level.toString());
  if (params.subContentName !== undefined) query.append("subContentName", params.subContentName.toString());
  // Note: difficulty and isActive might not be supported by backend based on provided API
  const { data } = await axiosInstance.get<Pagination<QuestionDto>>(`${QUESTION_BASE_URL}/paging-details?${query.toString()}`);
  return data;
};

// Choice APIs
export const getChoicesByQuestionId = async (questionId: string): Promise<ChoiceReadDto[]> => {
  const response = await axiosInstance.get(`${CHOICE_BASE_URL}/question/${questionId}`);
  return response.data;
};

export const createChoice = async (questionId: string, choiceDto: ChoiceCreateDto): Promise<ChoiceReadDto> => {
  const response = await axiosInstance.post(`${CHOICE_BASE_URL}/question/${questionId}`, choiceDto);
  return response.data;
};

export const updateChoice = async (choiceId: string, choiceDto: ChoiceUpdateDto): Promise<void> => {
  await axiosInstance.put(`${CHOICE_BASE_URL}/choice/${choiceId}`, choiceDto);
};

export const deleteChoice = async (choiceId: string): Promise<void> => {
  await axiosInstance.delete(`${CHOICE_BASE_URL}/choice/${choiceId}`);
};

// Import Questions API
export const importQuestions = async (file: File): Promise<ImportQuestionsResultDto | ImportFailedQuestionsBlob> => {
  const formData = new FormData();
  formData.append('File', file);

  try {
    const response = await axiosInstance.post(IMPORT_QUESTIONS_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Check response headers for summary info (indicates failed questions file)
    if (response.headers['x-total-count']) {
      // Response contains failed questions file with summary in headers
      const totalCount = parseInt(response.headers['x-total-count'] || '0');
      const successCount = parseInt(response.headers['x-success-count'] || '0');
      const failedCount = parseInt(response.headers['x-failed-count'] || '0');
      
      // Create a blob from the response data for download
      const blob = new Blob([response.data], { type: 'application/json' }) as ImportFailedQuestionsBlob;
      
      // Add summary info as properties to the blob for UI display
      blob.importSummary = {
        totalCount,
        successCount,
        failedCount
      };
      
      return blob;
    } else {
      // Response is JSON summary (no failed questions)
      return response.data as ImportQuestionsResultDto;
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      // Handle validation errors
      const errorMessage = error.response.data?.message || 'Invalid file or request data';
      throw new Error(errorMessage);
    }
    console.error('Import questions error:', error);
    throw error;
  }
};

// Helper function to check if result is a failed questions blob
export const isImportFailedQuestionsBlob = (result: ImportQuestionsResultDto | ImportFailedQuestionsBlob): result is ImportFailedQuestionsBlob => {
  return result instanceof Blob;
};