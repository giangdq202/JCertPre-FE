import axiosInstance from "../consts/axios/axiosInstance";
import {
  ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL,
  CREATE_ATTEMPT_ANSWER_URL,
  UPDATE_ATTEMPT_ANSWER_URL,
  GET_ATTEMPT_ANSWERS_URL,
  ADD_OR_UPDATE_WRITING_ANSWERS_URL,
  GET_ALL_WRITTEN_BY_ATTEMPT_ID_URL,
  SCORE_WRITING_URL,
} from "../consts/apiUrl/baseUrl";
import {
  AttemptAnswerDto,
  CreateAttemptAnswerDto,
  UpdateAttemptAnswerDto,
  AddOrUpdateAttemptAnswerDto,
  CreateWritingAttemptAnswerDto,
  WrittenAnswerDto,
  ScoringWritingRequestDto,
  ScoringWritingResponseDto,
} from "../types/attemptAnswer.types";

/**
 * Create a new attempt answer.
 * @param dto - The attempt answer data
 * @returns Promise<AttemptAnswerDto>
 */
export const createAttemptAnswer = async (
  dto: CreateAttemptAnswerDto
): Promise<AttemptAnswerDto> => {
  try {
    const response = await axiosInstance.post(CREATE_ATTEMPT_ANSWER_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to create attempt answer:", error);
    throw error;
  }
};

/**
 * Update an existing attempt answer.
 * @param dto - The attempt answer update data
 * @returns Promise<AttemptAnswerDto>
 */
export const updateAttemptAnswer = async (
  dto: UpdateAttemptAnswerDto
): Promise<AttemptAnswerDto> => {
  try {
    const response = await axiosInstance.put(UPDATE_ATTEMPT_ANSWER_URL, dto);
    return response.data;
  } catch (error) {
    console.error("Failed to update attempt answer:", error);
    throw error;
  }
};

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

/**
 * Add or update writing answers for a student.
 * @param dtos - Array of writing attempt answer data
 * @returns Promise<WrittenAnswerDto[]>
 */
export const addOrUpdateWritingAnswers = async (
  dtos: CreateWritingAttemptAnswerDto[]
): Promise<WrittenAnswerDto[]> => {
  try {
    const response = await axiosInstance.post(ADD_OR_UPDATE_WRITING_ANSWERS_URL, dtos);
    return response.data;
  } catch (error) {
    console.error("Failed to add or update writing answers:", error);
    throw error;
  }
};

/**
 * Get all written answers for a test attempt.
 * @param attemptId - The attempt ID
 * @returns Promise<WrittenAnswerDto[]>
 */
export const getAllWrittenByAttemptId = async (attemptId: string): Promise<WrittenAnswerDto[]> => {
  try {
    const response = await axiosInstance.get(GET_ALL_WRITTEN_BY_ATTEMPT_ID_URL(attemptId));
    return response.data;
  } catch (error) {
    console.error("Failed to get all written answers by attempt ID:", error);
    throw error;
  }
};

/**
 * Score a writing answer by answerId.
 * Updates GraderComment, sets isCorrect to true, and sets score.
 * Also updates TestAttempt.isPass based on passing percentage.
 * @param answerId - The answer ID to score
 * @param dto - The scoring data (Score and GraderComment)
 * @returns Promise<ScoringWritingResponseDto>
 */
export const scoringWriting = async (
  answerId: string,
  dto: ScoringWritingRequestDto
): Promise<ScoringWritingResponseDto> => {
  try {
    const response = await axiosInstance.patch(SCORE_WRITING_URL(answerId), dto);
    return response.data;
  } catch (error) {
    console.error("Failed to score writing answer:", error);
    throw error;
  }
};
