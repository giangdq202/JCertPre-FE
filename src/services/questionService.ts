import axiosInstance from "../consts/axios/axiosInstance";
import { BASE_URL } from "../consts/apiUrl/baseUrl";

export enum QuestionDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export enum ContentName {
  Kanji = 0,
  Vocabulary = 1,
  Grammar = 2,
  Reading = 3,
  Listening = 4,
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum SubContentName {
  Mondai1 = 0, // Đọc chữ Hán
  Mondai2 = 1, // Nhớ chữ Hán
  Mondai3 = 2, // Chọn từ phù hợp với câu
  Mondai4 = 3, // Tìm câu có cách diễn đạt giống
  Mondai5 = 4, // Chọn ngữ pháp phù hợp với câu
  Mondai6 = 5, // Sắp xếp câu
  Mondai7 = 6, // Tìm đáp án đúng để hoàn thành đoạn văn
  Mondai8 = 7, // Đoạn văn ngắn
  Mondai9 = 8, // Trung văn
  Mondai10 = 9, // Tìm kiếm thông tin
  Mondai11 = 10, // Hiểu đề bài
  Mondai12 = 11, // Hiểu điểm chính
  Mondai13 = 12, // Diễn đạt bằng lời nói
  Mondai14 = 13, // Phản hồi tức thời
}

export interface ChoiceReadDto {
  choiceId: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
}

export interface ChoiceCreateDto {
  content: string;
  isCorrect: boolean;
}

export interface ChoiceUpdateDto {
  content?: string;
  isCorrect?: boolean;
}

export interface QuestionAttachmentDto {
  mediaUrl: string;
  mediaType: string;
}

export interface QuestionDto {
  id: string;
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  choices?: ChoiceReadDto[];
  questionAttachments?: QuestionAttachmentDto[];
  contentName: string;
  contentNameDescription: string;
  level: string;
  levelDescription: string;
  subContentName: string;
  subContentNameDescription: string;
}

export interface CreateQuestionDto {
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
}

export interface UpdateQuestionDto {
  content?: string;
  explanation?: string;
  points?: number;
  difficulty?: QuestionDifficulty;
  isActive?: boolean;
  contentName?: ContentName;
  level?: CourseLevel;
  subContentName?: SubContentName;
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

const QUESTION_BASE_URL = `${BASE_URL}/Question`;

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
  const { data } = await axiosInstance.post<QuestionDto>(QUESTION_BASE_URL, dto);
  return data;
};

export const updateQuestion = async (id: string, dto: UpdateQuestionDto): Promise<QuestionDto> => {
  const { data } = await axiosInstance.put<QuestionDto>(`${QUESTION_BASE_URL}/${id}`, dto);
  return data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${QUESTION_BASE_URL}/${id}`);
};

// Toggle question active status (staff only) - using update API instead of toggle-active
export const toggleQuestionActiveStatus = async (id: string, isActive: boolean): Promise<QuestionDto> => {
  const { data } = await axiosInstance.put<QuestionDto>(`${QUESTION_BASE_URL}/${id}`, { isActive });
  return data;
};

export interface GetQuestionsPagingDetailsParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  contentName?: string;
  level?: string;
  subContentName?: string;
  isActive?: boolean; // Add filter for active status
}

export const getQuestionsPagingDetails = async (params: GetQuestionsPagingDetailsParams = {}): Promise<Pagination<QuestionDto>> => {
  const query = new URLSearchParams();
  // Backend uses 1-based indexing, ensure pageIndex is at least 1
  const pageIndex = params.pageIndex && params.pageIndex > 0 ? params.pageIndex : 1;
  query.append("pageIndex", pageIndex.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  if (params.search) query.append("search", params.search);
  if (params.contentName) query.append("contentName", params.contentName);
  if (params.level) query.append("level", params.level);
  if (params.subContentName) query.append("subContentName", params.subContentName);
  if (params.isActive !== undefined) query.append("isActive", params.isActive.toString());
  const { data } = await axiosInstance.get<Pagination<QuestionDto>>(`${QUESTION_BASE_URL}/paging-details?${query.toString()}`);
  return data;
};

// Choice APIs
export const getChoicesByQuestionId = async (questionId: string): Promise<ChoiceReadDto[]> => {
  const response = await axiosInstance.get(`/choice/question/${questionId}`);
  return response.data;
};

export const createChoice = async (questionId: string, choiceDto: ChoiceCreateDto): Promise<ChoiceReadDto> => {
  const response = await axiosInstance.post(`/choice/question/${questionId}`, choiceDto);
  return response.data;
};

export const updateChoice = async (choiceId: string, choiceDto: ChoiceUpdateDto): Promise<void> => {
  await axiosInstance.put(`/choice/choice/${choiceId}`, choiceDto);
};

export const deleteChoice = async (choiceId: string): Promise<void> => {
  await axiosInstance.delete(`/choice/choice/${choiceId}`);
}; 