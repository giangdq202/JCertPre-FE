import axiosInstance from "../consts/axios/axiosInstance";
import { ContentName, CourseLevel, SubContentName } from "../types/question.types";

// DTO for API request
export interface GetRandomQuestionsRequestDto {
  numberOfQuestions: number;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
}

// DTO for API response
export interface RandomChoiceDto {
  choiceId: string;
  content: string;
  isCorrect: boolean;
}

export interface RandomQuestionWithChoicesDto {
  questionId: string;
  questionText: string;
  explanation: string;
  choices: RandomChoiceDto[];
}

/**
 * Get random questions with choices for quiz
 * @param requestDto - Parameters for getting random questions
 * @returns Promise<RandomQuestionWithChoicesDto[]>
 */
export const getRandomQuestionsWithChoices = async (
  requestDto: GetRandomQuestionsRequestDto
): Promise<RandomQuestionWithChoicesDto[]> => {
  try {
    const response = await axiosInstance.post('/questions/random', {
      numberOfQuestions: requestDto.numberOfQuestions,
      contentName: requestDto.contentName,
      level: requestDto.level,
      subContentName: requestDto.subContentName
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get random questions:", error);
    throw error;
  }
};
