import axiosInstance from "../consts/axios/axiosInstance";
import {
  ADD_CUSTOM_MANUAL_QUESTIONS_URL,
  GET_QUESTIONS_FROM_TEST_URL,
  DELETE_QUESTION_FROM_TEST_URL,
  CALCULATE_MAX_SCORE_URL,
  ADD_QUESTIONS_JLPT_AUTO_URL,
  DELETE_ALL_TEST_QUESTIONS_URL,
} from "../consts/apiUrl/baseUrl";

export interface AddTestQuestionManualDto {
  TestId: string;
  QuestionId: string;
}

export interface TestQuestionDto {
  testQuestionId: string;
  testId: string;
  questionId: string;
  questionNumber: number;
  partNumber?: number;
  partDurationMinutes?: number;
}

/**
 * Add questions to a test using custom manual input.
 * @param testQuestionPairs - Array of test-question pairs to add (using camelCase for ease of use)
 * @returns Promise<void>
 */
export const addQuestionsCustomManual = async (
  testQuestionPairs: { testId: string; questionId: string }[]
): Promise<void> => {
  try {
    // Map camelCase to PascalCase for backend
    const mappedPairs = testQuestionPairs.map(pair => ({
      TestId: pair.testId,
      QuestionId: pair.questionId
    }));
    
    await axiosInstance.post(ADD_CUSTOM_MANUAL_QUESTIONS_URL, mappedPairs);
  } catch (error) {
    console.error("Failed to add custom manual questions:", error);
    throw error;
  }
};

/**
 * Get all questions from a test (no paging).
 * @param testId - The test ID
 * @returns Promise<TestQuestionDto[]>
 */
export const getQuestionsByTestId = async (testId: string): Promise<TestQuestionDto[]> => {
  try {
    const response = await axiosInstance.get(GET_QUESTIONS_FROM_TEST_URL(testId));
    return response.data;
  } catch (error) {
    console.error("Failed to get questions by test ID:", error);
    throw error;
  }
};

/**
 * Delete a question from a test.
 * @param testQuestionId - The test question ID to delete
 * @returns Promise<void>
 */
export const deleteTestQuestion = async (testQuestionId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(DELETE_QUESTION_FROM_TEST_URL(testQuestionId));
    return response.data;
  } catch (error) {
    console.error("Failed to delete test question:", error);
    throw error;
  }
};

/**
 * Calculate and update max scores for test score summary.
 * @param testId - The test ID
 * @returns Promise<void>
 */
export const calculateMaxScore = async (testId: string): Promise<void> => {
  try {
    const response = await axiosInstance.post(CALCULATE_MAX_SCORE_URL(testId));
    return response.data;
  } catch (error) {
    console.error("Failed to calculate max score:", error);
    throw error;
  }
};

/**
 * Add JLPT auto-generated questions to a test.
 * @param testId - The ID of the test to add questions to
 * @returns Promise<{ message: string }>
 */
export const addQuestionsJLPTAuto = async (testId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post(ADD_QUESTIONS_JLPT_AUTO_URL(testId));
    return response.data;
  } catch (error) {
    console.error("Failed to add JLPT auto questions:", error);
    throw error;
  }
};

/**
 * Delete all questions from a test.
 * @param testId - The ID of the test to delete questions from
 * @returns Promise<void>
 */
export const deleteAllTestQuestions = async (testId: string): Promise<void> => {
  try {
    await axiosInstance.delete(DELETE_ALL_TEST_QUESTIONS_URL(testId));
  } catch (error) {
    console.error("Failed to delete all test questions:", error);
    throw error;
  }
}; 