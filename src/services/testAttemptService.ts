import axiosInstance from "../consts/axios/axiosInstance";
import {
  START_TEST_ATTEMPT_URL,
  SUBMIT_TEST_ATTEMPT_URL,
  GET_TEST_ATTEMPTS_BY_USER_URL,
  UPDATE_TEST_ATTEMPT_STATUS_URL,
  GET_TEST_ATTEMPT_WITH_SCORE_URL,
  GET_PAGED_ATTEMPTS_BY_TEST_ID_URL,
} from "../consts/apiUrl/baseUrl";
import { Pagination } from "../types/pagination";


export enum TestAttemptStatus {
  InProgress = 0,
  Completed = 1,
  Suspended = 2,
}

export interface StartTestAttemptDto {
  testId: string;
  userId: string;
}

export interface SubmitTestAttemptDto {
  attemptId: string;
}

export interface TestAttemptDto {
  attemptId: string;
  userId: string;
  testId: string;
  attemptNumber: number;
  status: TestAttemptStatus;
  startTime: string;
  endTime: string;
  isPass?: boolean;
}

export interface TestScoreSummary {
  testScoreSummaryId: string;
  testId: string;
  testAttemptId?: string;
  kanji_score: number;
  vocab_score: number;
  grammar_score: number;
  reading_score: number;
  listening_score: number;
  kanji_max_score: number;
  vocab_max_score: number;
  grammar_max_score: number;
  reading_max_score: number;
  listening_max_score: number;
  total_score: number;
  total_max_score: number;
  percentage_score: number;
  passing_percentage: number;
}

export interface TestAttemptWithScoreSummary {
  attempt: TestAttemptDto;
  scoreSummary: TestScoreSummary;
}

/**
 * Start a test attempt for a user.
 * @param dto - The start test attempt data
 * @returns Promise<TestAttemptDto>
 */
export const startTestAttempt = async (dto: StartTestAttemptDto): Promise<TestAttemptDto> => {
  try {
    // Basic validation
    if (!dto.testId || !dto.userId) {
      throw new Error("Validation failed: testId and userId are required");
    }

    const response = await axiosInstance.post(START_TEST_ATTEMPT_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to start test attempt:", error);
    throw error;
  }
};

/**
 * Submit a test attempt and calculate score.
 * @param dto - The submit test attempt data
 * @returns Promise<TestAttemptDto>
 */
export const submitTestAttempt = async (dto: SubmitTestAttemptDto): Promise<TestAttemptDto> => {
  try {
    // Basic validation
    if (!dto.attemptId) {
      throw new Error("Validation failed: attemptId is required");
    }

    const response = await axiosInstance.post(SUBMIT_TEST_ATTEMPT_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to submit test attempt:", error);
    throw error;
  }
};

/**
 * Get all test attempts by user ID.
 * @param userId - The user ID
 * @returns Promise<TestAttemptDto[]>
 */
export const getAllTestAttemptsByUserId = async (userId: string): Promise<TestAttemptDto[]> => {
  try {
    const response = await axiosInstance.get(GET_TEST_ATTEMPTS_BY_USER_URL(userId));
    return response.data;
  } catch (error) {
    console.error("Failed to get test attempts by user ID:", error);
    throw error;
  }
};

/**
 * Update the status of a test attempt.
 * @param attemptId - The attempt ID
 * @param status - The new status
 * @returns Promise<TestAttemptDto>
 */
export const updateTestAttemptStatus = async (
  attemptId: string,
  status: TestAttemptStatus
): Promise<TestAttemptDto> => {
  try {
    const response = await axiosInstance.put(UPDATE_TEST_ATTEMPT_STATUS_URL(attemptId), { status });
    return response.data;
  } catch (error) {
    console.error("Failed to update test attempt status:", error);
    throw error;
  }
};

/**
 * Get a test attempt by ID with its associated score summary.
 * @param attemptId - The attempt ID
 * @returns Promise<TestAttemptWithScoreSummary>
 */
export const getTestAttemptWithScoreSummary = async (
  attemptId: string
): Promise<TestAttemptWithScoreSummary> => {
  try {
    const response = await axiosInstance.get(GET_TEST_ATTEMPT_WITH_SCORE_URL(attemptId));
    return response.data;
  } catch (error) {
    console.error("Failed to get test attempt with score summary:", error);
    throw error;
  }
};

/**
 * Get paged test attempts by test ID with optional isPass filter.
 * @param testId - The test ID
 * @param isPass - Optional filter for pass/fail status (true for passed, false for failed, undefined for all)
 * @param pageIndex - Page number (1-based, default: 1)
 * @param pageSize - Number of items per page (default: 10)
 * @returns Promise<Pagination<TestAttemptDto>>
 */
export const getPagedAttemptsByTestIdAndIsPass = async (
  testId: string,
  isPass?: boolean,
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<Pagination<TestAttemptDto>> => {
  try {
    const params: Record<string, any> = {
      pageIndex,
      pageSize,
    };
    
    if (isPass !== undefined) {
      params.isPass = isPass;
    }

    const response = await axiosInstance.get(GET_PAGED_ATTEMPTS_BY_TEST_ID_URL(testId), {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get paged test attempts by test ID and isPass:", error);
    throw error;
  }
}; 