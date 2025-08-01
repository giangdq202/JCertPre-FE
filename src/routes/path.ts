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
  student_exam: "/student/exam-simulations",
  student_schedule: "/student/schedule",
  staff_sub_content_management: "/staff/sub-content-management",
  question_management: "/question-management",
  create_question: "/create-question",
};

export default paths;
