const paths = {
  //Authen pages
  home: "/",
  staff_home: "/staff_homepage/*",
  login: "/login",
  callback: "/auth/callback",
  register: "/register",
  logout: "/logout",
  course_management: "/course-management",
  course_detail: "/course-detail/:courseId",
  learn_course: "/learn-course/:courseId",
  create_course: "/course-management/create",
  student_profile: "/student/profile",
  student_home: "/student/home",
  student_course: "/student/courses",
  student_my_courses: "/student/my-courses",
  student_course_detail: "/student/course-detail/:courseId",
  student_livestream: "/student/livestream/:livestreamId",
  student_livestreams: "/student/livestreams",
  student_exam: "/student/exam-simulations",
  student_entry_test: "/student/entry-test/:testId",
  student_schedule: "/student/schedule",
  student_messages: "/student/messages",
  student_vocabulary: "/student/vocabulary",
  student_quiz: "/student/quiz",
  student_study_plans: "/student/study-plans",
  staff_sub_content_management: "/staff/sub-content-management",
  question_management: "/question-management",
  create_question: "/create-question",
  staff_test_template_types: "/staff/test-template-types",
  // Staff chat routes
  staff_inquiries: "/staff/inquiries",
  staff_messages: "/staff/messages/:conversationId",
  // Payment routes
  credit_purchase: "/credit-purchase",
  credit_history: "/credit-history",
  payment_callback: "/payment/callback",
  payment_success: "/payment/success",
  payment_cancelled: "/payment/cancelled",
  payment_error: "/payment/error",
  payment_pending: "/payment/pending",
  // LiveKit routes
  livekit_home: "/livekit",
  livekit_join: "/livekit/join",
  livekit_join_room: "/livekit/join/:roomName",
  livekit_create: "/livekit/create",
  livekit_manage: "/livekit/manage",
  livekit_room: "/livekit/room/:roomName",
  // Instructor routes
  instructor_home: "/instructor/home",
  instructor_schedule: "/instructor/schedule",
  instructor_courses: "/instructor/courses",
  instructor_course_detail: "/instructor/course-detail/:courseId",
  instructor_livestream: "/instructor/livestream/:livestreamId",
  // Admin routes
  admin_home: "/admin/home",
  edit_question: "/edit-question/:questionId",
  // Debug routes (development only)
  signalr_debug: "/debug/signalr",
};

// Admin paths
export const adminPaths = {
  admin_home: "/admin/home",
  admin_users: "/admin/users",
  admin_analytics: "/admin/analytics",
  admin_settings: "/admin/settings",
};

// export const EDIT_QUESTION = "/edit-question/:questionId";
// export const editQuestion = (questionId: string) => `/edit-question/${questionId}`;

export default paths;
