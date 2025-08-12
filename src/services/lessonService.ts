// src/services/lessonService.ts

import axiosInstance from "../consts/axios/axiosInstance";
import { Pagination } from "../types/pagination";
import {
  LessonDto,
  CreateLessonDto,
  UpdateLessonDto
} from "../types/lesson.types";

const BASE_LESSONS_URL = "/lessons"; // Base URL for lesson API

// --- API Functions for Lessons ---

/**
 * Fetches a paginated list of lessons for a specific course.
 * Corresponds to GET /api/lessons/by-course/{courseId}
 * @param courseId The ID of the course.
 * @param searchTerm Optional search term for lesson titles.
 * @param pageIndex Page number (starts from 1).
 * @param pageSize Items per page.
 * @returns A promise that resolves to a Pagination object containing LessonDto items.
 */
export const getLessonsByCourseId = async (
  courseId: string,
  searchTerm?: string,
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<Pagination<LessonDto>> => {
  try {
    const response = await axiosInstance.get<Pagination<LessonDto>>(
      `${BASE_LESSONS_URL}/by-course/${courseId}`,
      {
        params: {
          searchTerm,
          pageIndex,
          pageSize,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Creates a new lesson for a specific course.
 * Corresponds to POST /api/lessons/{courseId}
 * @param courseId The ID of the course to add the lesson to.
 * @param createLessonDto The data for the new lesson.
 * @returns A promise that resolves to the created LessonDto.
 */
export const createLesson = async (
  courseId: string,
  createLessonDto: CreateLessonDto
): Promise<LessonDto> => {
  try {
    const response = await axiosInstance.post<LessonDto>(
      `${BASE_LESSONS_URL}/${courseId}`,
      createLessonDto
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating lesson for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing lesson.
 * Corresponds to PUT /api/lessons/{lessonId}
 * @param lessonId The ID of the lesson to update.
 * @param updateLessonDto The data to update the lesson with.
 * @returns A promise that resolves to the updated LessonDto.
 */
export const updateLesson = async (
  lessonId: string,
  updateLessonDto: UpdateLessonDto
): Promise<LessonDto> => {
  try {
    const response = await axiosInstance.put<LessonDto>(
      `${BASE_LESSONS_URL}/${lessonId}`,
      updateLessonDto
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating lesson ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Deletes a specific lesson by its ID.
 * Corresponds to DELETE /api/lessons/{lessonId}
 * @param lessonId The ID of the lesson to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteLessonById = async (lessonId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_LESSONS_URL}/${lessonId}`);
  } catch (error) {
    console.error(`Error deleting lesson ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Deletes all lessons associated with a specific course.
 * Corresponds to DELETE /api/lessons/by-course/{courseId}
 * @param courseId The ID of the course whose lessons are to be deleted.
 * @returns A promise that resolves when all lessons are deleted.
 */
export const deleteAllLessonsByCourseId = async (
  courseId: string
): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_LESSONS_URL}/by-course/${courseId}`);
  } catch (error) {
    console.error(`Error deleting all lessons for course ${courseId}:`, error);
    throw error;
  }
};
