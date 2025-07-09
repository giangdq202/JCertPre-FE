export const BASE_URL = "https://localhost:7014/api";


export const LOGIN_URL = `${BASE_URL}/auth/login`;

export const LOGOUT_URL = `${BASE_URL}/auth/logout`;

export const REGISTER_URL = `${BASE_URL}/auth/register`;

export const REFRESH_TOKEN = `${BASE_URL}/auth/refresh`;

export const GET_COURSE_URL = `${BASE_URL}/course`;

export const GET_COURSE_BY_ID_URL = (courseId: string) =>
  `${BASE_URL}/course/${courseId}`;
export const CREATE_COURSE_URL = `${BASE_URL}/course`;

export const UPDATE_COURSE_URL = (courseId: string) =>
  `${BASE_URL}/course/${courseId}`;

export const UPDATE_COURSE_STATUS_URL = (courseId: string) =>
  `${BASE_URL}/course/${courseId}/status`;

export const ADD_INSTRUCTOR_TO_COURSE_URL = (courseId: string, instructorId: string) =>
  `${BASE_URL}/course/${courseId}/instructors/${instructorId}`;

export const REMOVE_INSTRUCTOR_FROM_COURSE_URL = (courseId: string, instructorId: string) =>
  `${BASE_URL}/course/${courseId}/instructors/${instructorId}`;