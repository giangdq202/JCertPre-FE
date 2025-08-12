import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import ProtectedRoute from "../routes/ProtectRoute";
import Layout from "../layouts/Layout";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import Home from "../pages/home/Home";
import StudentHomePage from "../pages/student/StudentHomePage";
import StudentCoursesPage from "../pages/student/StudentCoursesPage";
import MyCoursePage from "../pages/student/MyCoursePage";
import StudentExamPage from "../pages/student/StudentExamPage";
import StudentSchedulePage from "../pages/student/StudentSchedulePage";
import StaffHomePage from "../pages/staff/StaffHomePage";
import StaffCourseManagementPage from "../pages/staff/StaffCourseManagementPage";
import CourseDetailPage from "../pages/staff/CourseDetailPage";
import CreateCoursePage from "../pages/staff/CreateCoursePage";
import TestTemplateTypeManagementPage from "../pages/staff/TestTemplateTypeManagementPage";
import ProfilePage from "../pages/student/ProfilePage";
import StaffSub from "../pages/staff/SubContentManagementPage"; // Assuming this is the correct import for your sub-content management page
// import GoogleAuthCallback from "../components/Auth/GoogleAuthCallback";
import paths from "./path";
import StudentCourseDetailPage from "../pages/student/StudentCourseDetailPage";
import StudentLivestreamPage from "../pages/student/StudentLivestreamPage";
import StudentLearnCoursePage from "../pages/student/StudentLearnCoursePage";
import QuestionManagementPage from "../pages/QuestionManagementPage";
import CreateQuestionPage from "../pages/CreateQuestionPage";
import StaffInquiriesPage from "../pages/staff/StaffInquiriesPage";
import StaffMessagesPage from "../pages/staff/StaffMessagesPage";
import CreditPurchasePage from "../pages/student/CreditPurchasePage";
import CreditHistoryPage from "../pages/student/CreditHistoryPage";
import PaymentCallbackPage from "../pages/PaymentCallbackPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentCancelledPage from "../pages/PaymentCancelledPage";
import PaymentErrorPage from "../pages/PaymentErrorPage";
import PaymentPendingPage from "../pages/PaymentPendingPage";
import MessagesPage from "../pages/student/MessagesPage";
import VocabularyPage from "../pages/student/VocabularyPage";
// Instructor imports
import InstructorHomePage from "../pages/instructor/InstructorHomePage";
import InstructorSchedulePage from "../pages/instructor/InstructorSchedulePage";
import InstructorCoursesPage from "../pages/instructor/InstructorCoursesPage";
import InstructorCourseDetailPage from "../pages/instructor/InstructorCourseDetailPage";
// Admin imports
import AdminHomePage from "../pages/admin/AdminHomePage";
import AdminUserManagementPage from "../pages/admin/AdminUserManagementPage";
// LiveKit imports
import LiveKitHomePage from "../pages/livekit/LiveKitHomePage";
import PreJoin from "../components/livekit/PreJoin";
import VideoConference from "../components/livekit/VideoConference";
import RoomManager from "../components/livekit/RoomManager";
import { adminPaths } from "./path";
import EditQuestionPage from "../pages/EditQuestionPage";

const AppRoutes: React.FC = () => {
  console.log("AppRoutes: Rendering routes");
  return (
    <div className="w-full">
      <Routes>
        {/* Route công khai */}
        <Route element={<Layout />}>
          <Route path={paths.home} element={<Home />} />
        </Route>
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        {/* <Route path={paths.callback} element={<GoogleAuthCallback />} /> */}

        {/* Route được bảo vệ */}
        <Route
          path={paths.student_home}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_course}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_my_courses}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_course_detail}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentCourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_livestream}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentLivestreamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.learn_course}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentLearnCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_exam}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_schedule}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_messages}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_vocabulary}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <VocabularyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.student_profile}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.staff_home + "/*"}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.question_management}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <QuestionManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.create_question}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <CreateQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.edit_question}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <EditQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.course_management}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffCourseManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.course_detail}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.create_course}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.staff_sub_content_management}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffSub />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.staff_test_template_types}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <TestTemplateTypeManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Staff chat routes */}
        <Route
          path={paths.staff_inquiries}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffInquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.staff_messages}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <StaffMessagesPage />
            </ProtectedRoute>
          }
        />
        {/* Payment routes */}
        <Route
          path={paths.credit_purchase}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <CreditPurchasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.credit_history}
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <CreditHistoryPage />
            </ProtectedRoute>
          }
        />
        {/* Payment callback route (public) */}
        <Route
          path={paths.payment_callback}
          element={<PaymentCallbackPage />}
        />
        {/* Payment success/cancelled/error/pending routes (public) */}
        <Route
          path={paths.payment_success}
          element={<PaymentSuccessPage />}
        />
        <Route
          path={paths.payment_cancelled}
          element={<PaymentCancelledPage />}
        />
        <Route
          path={paths.payment_error}
          element={<PaymentErrorPage />}
        />
        <Route
          path={paths.payment_pending}
          element={<PaymentPendingPage />}
        />
        {/* LiveKit routes */}
        <Route
          path={paths.livekit_home}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <LiveKitHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.livekit_join}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <PreJoin />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.livekit_join_room}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <PreJoin />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.livekit_create}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <RoomManager />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.livekit_manage}
          element={
            <ProtectedRoute allowedRoles={["ACADEMIC_MANAGER"]}>
              <RoomManager />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.livekit_room}
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ACADEMIC_MANAGER"]}>
              <VideoConference />
            </ProtectedRoute>
          }
        />
        {/* Instructor routes */}
        <Route
          path={paths.instructor_home}
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.instructor_schedule}
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.instructor_courses}
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.instructor_course_detail}
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorCourseDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Admin routes */}
        <Route
          path={paths.admin_home}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={adminPaths.admin_users}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUserManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Route 404 */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </div>
  );
};

export default AppRoutes;
