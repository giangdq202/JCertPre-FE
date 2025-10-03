 //export const BASE_URL = "http://localhost:5001/api";

 export const BASE_URL = "https://be.zd-dev.xyz/api";

// ===== AUTH ENDPOINTS =====
export const AUTH_BASE_URL = `${BASE_URL}/auth`;
export const LOGIN_URL = `${AUTH_BASE_URL}/login`;
export const LOGOUT_URL = `${AUTH_BASE_URL}/logout`;
export const REGISTER_URL = `${AUTH_BASE_URL}/register`;
export const REFRESH_TOKEN = `${AUTH_BASE_URL}/refresh`;
export const FORGOT_PASSWORD_URL = `${AUTH_BASE_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${AUTH_BASE_URL}/reset-password`;
export const VALIDATE_ACCESS_TOKEN_URL = `${AUTH_BASE_URL}/validate-access-token`;
export const VALIDATE_REFRESH_TOKEN_URL = `${AUTH_BASE_URL}/validate-refresh-token`;
export const VALIDATE_RESET_TOKEN_URL = (token: string) => `${AUTH_BASE_URL}/validate-reset-token/${token}`;
export const FIREBASE_LOGIN_URL = `${AUTH_BASE_URL}/firebase-login`;

// ===== COURSE ENDPOINTS =====
export const COURSE_BASE_URL = `${BASE_URL}/course`;
export const GET_COURSE_URL = COURSE_BASE_URL;
export const CREATE_COURSE_URL = COURSE_BASE_URL;
export const GET_COURSE_BY_ID_URL = (courseId: string) => `${COURSE_BASE_URL}/${courseId}`;
export const UPDATE_COURSE_URL = (courseId: string) => `${COURSE_BASE_URL}/${courseId}`;
export const DELETE_COURSE_URL = (courseId: string) => `${COURSE_BASE_URL}/${courseId}`;
export const UPDATE_COURSE_STATUS_URL = (courseId: string) => `${COURSE_BASE_URL}/${courseId}/status`;
export const GET_COURSE_INSTRUCTORS_URL = (courseId: string) => `${COURSE_BASE_URL}/${courseId}/instructors`;
export const ADD_INSTRUCTOR_TO_COURSE_URL = (courseId: string, instructorId: string) => 
  `${COURSE_BASE_URL}/${courseId}/instructors/${instructorId}`;
export const REMOVE_INSTRUCTOR_FROM_COURSE_URL = (courseId: string, instructorId: string) => 
  `${COURSE_BASE_URL}/${courseId}/instructors/${instructorId}`;
export const GET_COURSE_INSTRUCTOR_HISTORY_URL = (courseId: string) => 
  `${COURSE_BASE_URL}/${courseId}/instructors/history`;
export const GET_COURSES_BY_INSTRUCTOR_URL = (instructorId: string) => 
  `${COURSE_BASE_URL}/instructor/${instructorId}`;
export const GET_COURSES_BY_STUDENT_URL = (studentId: string) => 
  `${COURSE_BASE_URL}/student/${studentId}`;
export const CREATE_PERSONAL_COURSE_URL = (userPersonalId: string) => 
  `${COURSE_BASE_URL}/personal/${userPersonalId}`;
export const GET_PERSONAL_COURSE_DETAIL_URL = (courseId: string) => 
  `${COURSE_BASE_URL}/personal/detail/${courseId}`;
export const GET_PERSONAL_COURSES_LIST_URL = (userPersonalId: string) => 
  `${COURSE_BASE_URL}/personal/list/${userPersonalId}`;

// ===== ENROLLMENT ENDPOINTS =====
export const ENROLLMENT_BASE_URL = `${BASE_URL}/enrollments`;
export const CHECK_ENROLLMENT_URL = (courseId: string) => `${ENROLLMENT_BASE_URL}/check/${courseId}`;
export const ENROLL_URL = `${ENROLLMENT_BASE_URL}/enroll`;
export const ENROLL_SELF_URL = `${ENROLLMENT_BASE_URL}/enroll-self`;
export const GET_MY_ENROLLMENTS_URL = `${ENROLLMENT_BASE_URL}/my-enrollments`;
export const UNENROLL_URL = (courseId: string) => `${ENROLLMENT_BASE_URL}/unenroll/${courseId}`;

// ===== LESSON ENDPOINTS =====
export const LESSON_BASE_URL = `${BASE_URL}/lessons`;
export const CREATE_LESSON_URL = (courseId: string) => `${LESSON_BASE_URL}/${courseId}`;
export const UPDATE_LESSON_URL = (lessonId: string) => `${LESSON_BASE_URL}/${lessonId}`;
export const DELETE_LESSON_URL = (lessonId: string) => `${LESSON_BASE_URL}/${lessonId}`;
export const GET_LESSONS_BY_COURSE_URL = (courseId: string) => `${LESSON_BASE_URL}/by-course/${courseId}`;
export const DELETE_ALL_LESSONS_BY_COURSE_URL = (courseId: string) => `${LESSON_BASE_URL}/by-course/${courseId}`;

// ===== LESSON PROGRESS ENDPOINTS =====
export const LESSON_PROGRESS_BASE_URL = `${BASE_URL}/lesson-progress`;
export const CREATE_LESSON_PROGRESS_URL = LESSON_PROGRESS_BASE_URL;
export const UPDATE_LESSON_PROGRESS_URL = (progressId: string) => `${LESSON_PROGRESS_BASE_URL}/${progressId}`;
export const DELETE_LESSON_PROGRESS_URL = (progressId: string) => `${LESSON_PROGRESS_BASE_URL}/${progressId}`;
export const GET_LESSON_PROGRESS_BY_USER_COURSE_URL = `${LESSON_PROGRESS_BASE_URL}/by-user-course`;
export const GET_LESSON_PROGRESS_BY_USER_LESSON_URL = `${LESSON_PROGRESS_BASE_URL}/by-user-lesson`;
export const GET_COMPLETION_RATE_URL = `${LESSON_PROGRESS_BASE_URL}/completion-rate`;

// ===== DOCUMENT ENDPOINTS =====
export const DOCUMENT_BASE_URL = `${BASE_URL}/documents`;
export const GET_DOCUMENT_BY_ID_URL = (id: string) => `${DOCUMENT_BASE_URL}/${id}`;
export const DELETE_DOCUMENT_URL = (id: string) => `${DOCUMENT_BASE_URL}/${id}`;
export const GET_DOCUMENTS_BY_LESSON_URL = (lessonId: string) => `${DOCUMENT_BASE_URL}/lesson/${lessonId}`;
export const UPLOAD_DOCUMENT_URL = `${DOCUMENT_BASE_URL}/upload/document`;
export const UPLOAD_IMAGE_URL = `${DOCUMENT_BASE_URL}/upload/image`;
export const UPLOAD_VIDEO_URL = `${DOCUMENT_BASE_URL}/upload/video`;

// ===== FILE ENDPOINTS =====
export const FILE_BASE_URL = `${BASE_URL}/files`;
export const FILE_HEALTH_URL = `${FILE_BASE_URL}/health`;
export const GET_FILE_RESOURCES_URL = `${FILE_BASE_URL}/resources`;
export const UPLOAD_FILE_URL = `${FILE_BASE_URL}/upload/file`;
export const UPLOAD_FILE_IMAGE_URL = `${FILE_BASE_URL}/upload/image`;
export const UPLOAD_FILE_VIDEO_URL = `${FILE_BASE_URL}/upload/video`;
export const DELETE_FILE_URL = `${FILE_BASE_URL}/delete/file`;
export const DELETE_FILE_IMAGE_URL = `${FILE_BASE_URL}/delete/image`;
export const DELETE_FILE_VIDEO_URL = `${FILE_BASE_URL}/delete/video`;

// ===== STUDENT PROFILE ENDPOINTS =====
export const STUDENT_PROFILE_BASE_URL = `${BASE_URL}/student-profile`;
export const GET_STUDENT_PROFILE_URL = (userId: string) => `${STUDENT_PROFILE_BASE_URL}/${userId}`;
export const CREATE_STUDENT_PROFILE_URL = `${STUDENT_PROFILE_BASE_URL}/create`;
export const UPDATE_STUDENT_PROFILE_URL = (userId: string) => `${STUDENT_PROFILE_BASE_URL}/update/${userId}`;
export const DELETE_STUDENT_PROFILE_URL = (userId: string) => `${STUDENT_PROFILE_BASE_URL}/delete/${userId}`;

// ===== INSTRUCTOR PROFILE ENDPOINTS =====
export const INSTRUCTOR_PROFILE_BASE_URL = `${BASE_URL}/instructor-profile`;
export const GET_INSTRUCTOR_PROFILE_URL = (userId: string) => `${INSTRUCTOR_PROFILE_BASE_URL}/${userId}`;
export const CREATE_INSTRUCTOR_PROFILE_URL = `${INSTRUCTOR_PROFILE_BASE_URL}/create`;
export const UPDATE_INSTRUCTOR_PROFILE_URL = (userId: string) => `${INSTRUCTOR_PROFILE_BASE_URL}/update/${userId}`;
export const DELETE_INSTRUCTOR_PROFILE_URL = (userId: string) => `${INSTRUCTOR_PROFILE_BASE_URL}/delete/${userId}`;

// ===== USER ENDPOINTS =====
export const USER_BASE_URL = `${BASE_URL}/users`;
export const GET_USERS_URL = USER_BASE_URL;
export const GET_USER_BY_ID_URL = (userId: string) => `${USER_BASE_URL}/${userId}`;
export const UPDATE_USER_URL = (userId: string) => `${USER_BASE_URL}/${userId}`;
export const DELETE_USER_URL = (userId: string) => `${USER_BASE_URL}/${userId}`;
export const CHECK_USER_EXISTS_URL = (userId: string) => `${USER_BASE_URL}/${userId}`;
export const UPDATE_USER_AVATAR_URL = (userId: string) => `${USER_BASE_URL}/${userId}/avatar`;

// ===== QUESTION ENDPOINTS =====
export const QUESTION_BASE_URL = `${BASE_URL}/questions`;
export const CREATE_QUESTION_URL = QUESTION_BASE_URL;
export const GET_QUESTION_BY_ID_URL = (id: string) => `${QUESTION_BASE_URL}/${id}`;
export const UPDATE_QUESTION_URL = (id: string) => `${QUESTION_BASE_URL}/${id}`;
export const DELETE_QUESTION_URL = (id: string) => `${QUESTION_BASE_URL}/${id}`;
export const GET_QUESTIONS_PAGING_DETAILS_URL = `${QUESTION_BASE_URL}/paging-details`;
export const GET_ACTIVE_QUESTIONS_PAGING_DETAILS_URL = `${QUESTION_BASE_URL}/paging-details/active`;
export const GET_QUESTION_FOR_TEST_URL = (id: string) => `${QUESTION_BASE_URL}/test/${id}`;
export const IMPORT_QUESTIONS_URL = `${QUESTION_BASE_URL}/import`;

// ===== CHOICE ENDPOINTS =====
export const CHOICE_BASE_URL = `${BASE_URL}/choices`;
export const UPDATE_CHOICE_URL = (choiceId: string) => `${CHOICE_BASE_URL}/choice/${choiceId}`;
export const DELETE_CHOICE_URL = (choiceId: string) => `${CHOICE_BASE_URL}/choice/${choiceId}`;
export const GET_CHOICES_BY_QUESTION_URL = (questionId: string) => `${CHOICE_BASE_URL}/question/${questionId}`;
export const CREATE_CHOICE_URL = (questionId: string) => `${CHOICE_BASE_URL}/question/${questionId}`;

// ===== TEST ENDPOINTS =====
export const TEST_BASE_URL = `${BASE_URL}/tests`;
export const GET_TEST_BY_ID_URL = (testId: string) => `${TEST_BASE_URL}/${testId}`;
export const UPDATE_TEST_URL = (testId: string) => `${TEST_BASE_URL}/${testId}`;
export const DELETE_TEST_URL = (testId: string) => `${TEST_BASE_URL}/${testId}`;
export const UPDATE_TEST_STATUS_URL = (testId: string) => `${TEST_BASE_URL}/${testId}/status`;
export const GET_TEST_BY_LESSON_URL = (lessonId: string) => `${TEST_BASE_URL}/by-lesson/${lessonId}`;
export const GET_WRITING_BY_LESSON_URL = (lessonId: string) => `${TEST_BASE_URL}/by-lesson/${lessonId}/writing/get`;
export const CREATE_TEST_BY_LESSON_URL = (lessonId: string) => `${TEST_BASE_URL}/by-lesson/${lessonId}`;
export const CREATE_WRITING_BY_LESSON_URL = (lessonId: string) => `${TEST_BASE_URL}/by-lesson/${lessonId}/writing`;
export const AUTO_CREATE_TEST_URL = (userId: string) => `${TEST_BASE_URL}/auto-create?userId=${userId}`;
export const GET_TESTS_BY_USER_URL = (userId: string) => `${TEST_BASE_URL}/user/${userId}`;

// ===== TEST ATTEMPT ENDPOINTS =====
export const TEST_ATTEMPT_BASE_URL = `${BASE_URL}/test-attempts`;
export const GET_TEST_ATTEMPT_WITH_SCORE_URL = (attemptId: string) => `${TEST_ATTEMPT_BASE_URL}/${attemptId}/with-score-summary`;
export const GET_TEST_ATTEMPTS_BY_USER_URL = (userId: string) => `${TEST_ATTEMPT_BASE_URL}/by-user/${userId}`;
export const START_TEST_ATTEMPT_URL = `${TEST_ATTEMPT_BASE_URL}/start`;
export const SUBMIT_TEST_ATTEMPT_URL = `${TEST_ATTEMPT_BASE_URL}/submit`;
export const UPDATE_TEST_ATTEMPT_STATUS_URL = (attemptId: string) => `${TEST_ATTEMPT_BASE_URL}/update-status/${attemptId}`;
export const GET_PAGED_ATTEMPTS_BY_TEST_ID_URL = (testId: string) => `${TEST_ATTEMPT_BASE_URL}/by-test/${testId}/paged`;

// ===== TEST QUESTION ENDPOINTS =====
export const TEST_QUESTION_BASE_URL = `${BASE_URL}/test-questions`;
export const CALCULATE_MAX_SCORE_URL = (testId: string) => `${TEST_QUESTION_BASE_URL}/${testId}/calculate-max-score`;
export const GET_QUESTIONS_FROM_TEST_URL = (testId: string) => `${TEST_QUESTION_BASE_URL}/${testId}/questions`;
export const DELETE_QUESTION_FROM_TEST_URL = (testQuestionId: string) => `${TEST_QUESTION_BASE_URL}/${testQuestionId}`;
export const ADD_CUSTOM_MANUAL_QUESTIONS_URL = `${TEST_QUESTION_BASE_URL}/custom-manual/add`;
export const ADD_QUESTIONS_JLPT_AUTO_URL = (testId: string) => `${TEST_QUESTION_BASE_URL}/jlpt-auto/${testId}`;
export const DELETE_ALL_TEST_QUESTIONS_URL = (testId: string) => `${TEST_QUESTION_BASE_URL}/all/${testId}`;

// ===== ATTEMPT ANSWER ENDPOINTS =====
export const ATTEMPT_ANSWER_BASE_URL = `${BASE_URL}/attempt-answers`;
export const ADD_OR_UPDATE_ATTEMPT_ANSWERS_URL = `${ATTEMPT_ANSWER_BASE_URL}/add-or-update`;
export const CREATE_ATTEMPT_ANSWER_URL = `${ATTEMPT_ANSWER_BASE_URL}/create`;
export const UPDATE_ATTEMPT_ANSWER_URL = `${ATTEMPT_ANSWER_BASE_URL}/update`;
export const GET_ATTEMPT_ANSWERS_URL = (attemptId: string) => `${ATTEMPT_ANSWER_BASE_URL}/by-attempt/${attemptId}`;
export const ADD_OR_UPDATE_WRITING_ANSWERS_URL = `${ATTEMPT_ANSWER_BASE_URL}/writing`;
export const GET_ALL_WRITTEN_BY_ATTEMPT_ID_URL = (attemptId: string) => `${ATTEMPT_ANSWER_BASE_URL}/written/${attemptId}`;
export const SCORE_WRITING_URL = (answerId: string) => `${ATTEMPT_ANSWER_BASE_URL}/score-writing/${answerId}`;

// ===== CONVERSATION ENDPOINTS =====
export const CONVERSATION_BASE_URL = `${BASE_URL}/conversations`;
export const GET_CONVERSATION_BY_ID_URL = (id: string) => `${CONVERSATION_BASE_URL}/${id}`;
export const ASSIGN_INSTRUCTOR_URL = (conversationId: string) => `${CONVERSATION_BASE_URL}/assign-instructor/${conversationId}`;
export const CREATE_CONVERSATION_URL = `${CONVERSATION_BASE_URL}/create`;
export const GET_MY_CONVERSATIONS_URL = `${CONVERSATION_BASE_URL}/my-conversations`;
export const SEND_MESSAGE_URL = (conversationId: string) => `${CONVERSATION_BASE_URL}/send-messages/${conversationId}`;

// ===== STUDY PLAN ENDPOINTS =====
export const STUDY_PLAN_BASE_URL = `${BASE_URL}/study-plans`;
export const GET_STUDY_PLAN_BY_ID_URL = (planId: string) => `${STUDY_PLAN_BASE_URL}/${planId}`;
export const CREATE_STUDY_PLAN_URL = `${STUDY_PLAN_BASE_URL}/create`;
export const GET_ALL_STUDY_PLANS_URL = `${STUDY_PLAN_BASE_URL}/get-all`;
export const GET_STUDY_PLANS_BY_STUDENT_URL = (studentId: string) => `${STUDY_PLAN_BASE_URL}/get-by-studentid/${studentId}`;
export const UPDATE_STUDY_PLAN_URL = (planId: string) => `${STUDY_PLAN_BASE_URL}/update/${planId}`;

// ===== STUDY PLAN ITEM ENDPOINTS =====
export const STUDY_PLAN_ITEM_BASE_URL = `${BASE_URL}/study-plan-items`;
export const CREATE_STUDY_PLAN_ITEM_URL = `${STUDY_PLAN_ITEM_BASE_URL}/create`;
export const DELETE_STUDY_PLAN_ITEM_URL = (itemId: string) => `${STUDY_PLAN_ITEM_BASE_URL}/delete/${itemId}`;
export const GET_STUDY_PLAN_ITEM_BY_ID_URL = (itemId: string) => `${STUDY_PLAN_ITEM_BASE_URL}/get-by-id/${itemId}`;
export const GET_STUDY_PLAN_ITEMS_BY_PLAN_URL = (planId: string) => `${STUDY_PLAN_ITEM_BASE_URL}/get-by-plan/${planId}`;
export const UPDATE_STUDY_PLAN_ITEM_URL = (itemId: string) => `${STUDY_PLAN_ITEM_BASE_URL}/update/${itemId}`;

// ===== SUB CONTENT ENDPOINTS =====
export const SUB_CONTENT_BASE_URL = `${BASE_URL}/subcontents`;
export const GET_SUB_CONTENTS_URL = SUB_CONTENT_BASE_URL;
export const CREATE_SUB_CONTENT_URL = SUB_CONTENT_BASE_URL;
export const UPDATE_SUB_CONTENT_URL = (subContentId: string) => `${SUB_CONTENT_BASE_URL}/${subContentId}`;
export const DELETE_SUB_CONTENT_URL = (subContentId: string) => `${SUB_CONTENT_BASE_URL}/${subContentId}`;
export const GET_CONTENT_NAME_ENUM_VALUES_URL = `${SUB_CONTENT_BASE_URL}/enum-values/content-name`;
export const GET_LEVEL_ENUM_VALUES_URL = `${SUB_CONTENT_BASE_URL}/enum-values/level`;
export const GET_SUB_CONTENT_NAME_ENUM_VALUES_URL = `${SUB_CONTENT_BASE_URL}/enum-values/subcontent-name`;

// ===== TEST TEMPLATE ENDPOINTS =====
export const TEST_TEMPLATE_BASE_URL = `${BASE_URL}/test-templates`;
export const CREATE_TEST_TEMPLATE_URL = TEST_TEMPLATE_BASE_URL;
export const UPDATE_TEST_TEMPLATE_URL = (templateId: string) => `${TEST_TEMPLATE_BASE_URL}/${templateId}`;
export const DELETE_TEST_TEMPLATE_URL = (templateId: string) => `${TEST_TEMPLATE_BASE_URL}/${templateId}`;
export const GET_TEST_TEMPLATES_BY_TYPE_URL = (testTemplateTypeId: string) => `${TEST_TEMPLATE_BASE_URL}/by-type/${testTemplateTypeId}`;

// ===== TEST TEMPLATE TYPE ENDPOINTS =====
export const TEST_TEMPLATE_TYPE_BASE_URL = `${BASE_URL}/test-template-types`;
export const GET_TEST_TEMPLATE_TYPES_URL = TEST_TEMPLATE_TYPE_BASE_URL;
export const CREATE_TEST_TEMPLATE_TYPE_URL = TEST_TEMPLATE_TYPE_BASE_URL;
export const UPDATE_TEST_TEMPLATE_TYPE_URL = (testTemplateTypeId: string) => `${TEST_TEMPLATE_TYPE_BASE_URL}/${testTemplateTypeId}`;
export const DELETE_TEST_TEMPLATE_TYPE_URL = (testTemplateTypeId: string) => `${TEST_TEMPLATE_TYPE_BASE_URL}/${testTemplateTypeId}`;
export const UPDATE_TEST_TEMPLATE_TYPE_ACTIVE_URL = (testTemplateTypeId: string) => `${TEST_TEMPLATE_TYPE_BASE_URL}/${testTemplateTypeId}/is-active`;
export const VERIFY_TEST_TEMPLATE_TYPE_URL = (testTemplateTypeId: string) => `${TEST_TEMPLATE_TYPE_BASE_URL}/${testTemplateTypeId}/verify`;

// ===== TEST TEMPLATE CONFIG ENDPOINTS =====
export const TEST_TEMPLATE_CONFIG_BASE_URL = `${BASE_URL}/test-template-configs`;
export const GET_TEST_TEMPLATE_CONFIG_URL = (configId: string) => `${TEST_TEMPLATE_CONFIG_BASE_URL}/${configId}`;
export const UPDATE_TEST_TEMPLATE_CONFIG_URL = (configId: string) => `${TEST_TEMPLATE_CONFIG_BASE_URL}/${configId}`;
export const DELETE_TEST_TEMPLATE_CONFIG_URL = (configId: string) => `${TEST_TEMPLATE_CONFIG_BASE_URL}/${configId}`;
export const CREATE_TEST_TEMPLATE_CONFIG_URL = (templateId: string) => `${TEST_TEMPLATE_CONFIG_BASE_URL}/${templateId}`;
export const GET_TEST_TEMPLATE_CONFIGS_BY_TEMPLATE_URL = (templateId: string) => `${TEST_TEMPLATE_CONFIG_BASE_URL}/by-template/${templateId}`;

// ===== LIVESTREAM ENDPOINTS =====
export const LIVESTREAM_BASE_URL = `${BASE_URL}/livestreams`;
export const CREATE_LIVESTREAM_URL = LIVESTREAM_BASE_URL;
export const GET_LIVESTREAMS_URL = LIVESTREAM_BASE_URL;
export const GET_LIVESTREAM_BY_ID_URL = (id: string) => `${LIVESTREAM_BASE_URL}/${id}`;
export const UPDATE_LIVESTREAM_URL = (id: string) => `${LIVESTREAM_BASE_URL}/${id}`;
export const DELETE_LIVESTREAM_URL = (id: string) => `${LIVESTREAM_BASE_URL}/${id}`;
export const CHECK_CAN_JOIN_LIVESTREAM_URL = (id: string) => `${LIVESTREAM_BASE_URL}/${id}/can-join`;
export const GET_LIVESTREAM_JOIN_TOKEN_URL = (id: string) => `${LIVESTREAM_BASE_URL}/${id}/join-token`;


// ===== CACHE ENDPOINTS =====
export const CACHE_BASE_URL = `${BASE_URL}/cache`;
export const GET_CACHE_BY_ID_URL = (id: string) => `${CACHE_BASE_URL}/${id}`;

// ===== PAYMENT ENDPOINTS =====
export const PAYMENT_BASE_URL = `${BASE_URL}/payment`;
export const GET_PAYMENT_HISTORY_URL = (userId: string) => `${PAYMENT_BASE_URL}/history/${userId}`;
export const GET_CREDIT_HISTORY_URL = (userId: string) => `${PAYMENT_BASE_URL}/credit-history/${userId}`;
export const CHECK_CREDIT_URL = (userId: string, amount: number) => `${PAYMENT_BASE_URL}/check-credit/${userId}/${amount}`;
export const CREATE_CREDIT_PURCHASE_URL = `${PAYMENT_BASE_URL}/create-credit-purchase`;
export const PAYOS_WEBHOOK_URL = `${PAYMENT_BASE_URL}/payos-webhook`;
export const CONFIRM_WEBHOOK_URL = `${PAYMENT_BASE_URL}/confirm-webhook`;
export const PAYMENT_RETURN_URL = `${PAYMENT_BASE_URL}/return`;
export const PAYMENT_CANCEL_URL = `${PAYMENT_BASE_URL}/cancel`;

// // ===== LEGACY CLOUDINARY ENDPOINTS (for backward compatibility) =====
// const CLOUDINARY_BASE_URL = "https://be.zd-dev.xyz/api/cloudinary-test";
// export const CLOUDINARY_UPLOAD_IMAGE_URL = `${CLOUDINARY_BASE_URL}/upload-image`;
// export const CLOUDINARY_UPLOAD_VIDEO_URL = `${CLOUDINARY_BASE_URL}/upload-video`;
// export const CLOUDINARY_UPLOAD_DOCUMENT_URL = `${CLOUDINARY_BASE_URL}/upload-document`;
// export const CLOUDINARY_DELETE_IMAGE_URL = `${CLOUDINARY_BASE_URL}/delete-image`;
// export const CLOUDINARY_DELETE_VIDEO_URL = `${CLOUDINARY_BASE_URL}/delete-video`;
// export const CLOUDINARY_DELETE_DOCUMENT_URL = `${CLOUDINARY_BASE_URL}/delete-document`;

// WebSocket server URL for LiveKit
export const LIVEKIT_WS_URL = "wss://livekit.zd-dev.xyz";

// Admin Dashboard URLs
export const GET_ADMIN_DASHBOARD_TOTAL_REVENUE_URL = `${BASE_URL}/admin-dashboard/revenue/total`;
export const GET_ADMIN_DASHBOARD_TOTAL_ENROLLMENTS_URL = `${BASE_URL}/admin-dashboard/enrollments/total`;
export const GET_ADMIN_DASHBOARD_ENROLLMENTS_BY_MONTH_URL = `${BASE_URL}/admin-dashboard/enrollments/by-month`;
export const GET_ADMIN_DASHBOARD_CURRENT_MONTH_ENROLLMENTS_URL = `${BASE_URL}/admin-dashboard/enrollments/current-month`;
export const GET_ADMIN_DASHBOARD_CURRENT_MONTH_REVENUE_URL = `${BASE_URL}/admin-dashboard/revenue/current-month`;
export const GET_ADMIN_DASHBOARD_REVENUE_BY_MONTH_URL = `${BASE_URL}/admin-dashboard/revenue/by-month`;
