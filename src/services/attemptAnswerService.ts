import axiosInstance from "../consts/axios/axiosInstance";
import {
  ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL,
  GET_ATTEMPT_ANSWERS_URL,
} from "../consts/apiUrl/baseUrl";

export interface AttemptAnswerDto {
  attemptAnswerId: string;
  attemptId: string;
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

export interface AddOrUpdateAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId: string;
}

/**
 * Add or update attempt answers for test questions.
 * @param dto - The attempt answer data
 * @returns Promise<AttemptAnswerDto>
 */
export const addOrUpdateAttemptAnswer = async (
  dto: AddOrUpdateAttemptAnswerDto
): Promise<AttemptAnswerDto> => {
  try {
    // Backend expects array, so wrap single item in array
    const response = await axiosInstance.post(ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL, [dto]);
    return response.data[0]; // Return first item from array response
  } catch (error) {
    console.error("Failed to add or update attempt answer:", error);
    throw error;
  }
};

/**
 * Add or update multiple attempt answers for test questions.
 * @param dto - Array of attempt answer data
 * @returns Promise<AttemptAnswerDto[]>
 */
export const addOrUpdateMultipleAttemptAnswers = async (
  dto: AddOrUpdateAttemptAnswerDto[]
): Promise<AttemptAnswerDto[]> => {
  try {
    const response = await axiosInstance.post(ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to add or update multiple attempt answers:", error);
    throw error;
  }
};

/**
 * Get all attempt answers by attempt ID.
 * @param attemptId - The attempt ID
 * @returns Promise<AttemptAnswerDto[]>
 */
export const getAttemptAnswersByAttemptId = async (attemptId: string): Promise<AttemptAnswerDto[]> => {
  try {
    const response = await axiosInstance.get(GET_ATTEMPT_ANSWERS_URL(attemptId));
    return response.data;
  } catch (error) {
    console.error("Failed to get attempt answers by attempt ID:", error);
    throw error;
  }
};
