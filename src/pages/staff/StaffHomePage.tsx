import React, { useState, useEffect } from "react";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import { Routes, Route, useNavigate } from 'react-router-dom'; // Removed useLocation as it's not directly used here
import StaffCourseManagementPage from "./StaffCourseManagementPage";
import CreateCoursePage from "./CreateCoursePage"; // Import CreateCoursePage
import CourseDetailPage from "./CourseDetailPage"; // Import CourseDetailPage
import paths from "../../routes/path";
import { useAuth } from "../../auth/AuthContext";

// Lottie animation import
import Lottie from "lottie-react";
import studyAnimation from "../../animations/study.json"; // Assuming this path is correct and animation exists
import { MdOutlineQuestionAnswer } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";

// Import services
import { getMyConversations } from "../../services/conversationService";
import { getCourses } from "../../services/courseService";

// Placeholder components for other staff pages
const InquiriesPage = () => <div className="p-6 text-gray-700">Nội dung trang Yêu cầu tư vấn (Staff)</div>;
const StaffStudyPlanPage = () => <div className="p-6 text-gray-700">Nội dung trang Kế hoạch học tập (Staff)</div>;
const ReportsPage = () => <div className="p-6 text-gray-700">Nội dung trang Quản lý khiếu nại (Staff)</div>;
const TagsPage = () => <div className="p-6 text-gray-700">Nội dung trang Cấu trúc đề thi (Staff)</div>;
const QuestionsPage = () => <div className="p-6 text-gray-700">Nội dung trang Ngân hàng câu hỏi (Staff)</div>;
const StaffProfilePage = () => <div className="p-6 text-gray-700">Nội dung trang Hồ sơ nhân viên (Staff)</div>;
const StaffSettingsPage = () => <div className="p-6 text-gray-700">Nội dung trang Cài đặt (Staff)</div>; // New settings page for staff

const StaffDashboardContent = () => {
    const navigate = useNavigate(); // Use useNavigate hook inside the component
    const { userInfo } = useAuth();
    
    // State for real data
    const [inquiriesCount, setInquiriesCount] = useState<number>(0);
    const [activeCoursesCount, setActiveCoursesCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // Load real data
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!userInfo?.id) return;
            
            setLoading(true);
            try {
                // Load inquiries count
                const conversations = await getMyConversations(userInfo.id);
                setInquiriesCount(conversations.length);

                // Load courses count (simplified - no filters)
                const coursesResponse = await getCourses({
                    pageNumber: 1,
                    pageSize: 10, // Small page size is enough, we only need totalItemsCount
                });
                setActiveCoursesCount(coursesResponse.totalItemsCount);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [userInfo?.id]);

    return (
        <div className="p-6">
            {/* Welcome Banner Section */}
            <div className="relative mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:px-8 lg:px-10 pr-28 sm:pr-40 lg:pr-56">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-snug">
                        Chào mừng trở lại, <span className="text-orange-600">Quản lý!</span>
                    </h2>
                    <p className="text-gray-600 text-base mb-6">
                        Bạn có thể quản lý các khóa học, yêu cầu tư vấn, và nhiều hơn nữa tại đây.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(paths.course_management)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 px-6 rounded-xl shadow-md hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                        >
                            <FaChalkboardTeacher className="mr-2 text-base" />
                            Quản lý khóa học
                        </button>
                        <button
                            onClick={() => navigate(paths.home)}
                            className="bg-white text-orange-700 border border-orange-500 py-2.5 px-6 rounded-xl shadow-md hover:bg-orange-50 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                        >
                            <MdOutlineQuestionAnswer className="mr-2 text-base" />
                            Xem yêu cầu tư vấn
                        </button>
                    </div>
                </div>

                {/* Animation at the right corner */}
                <Lottie
                    animationData={studyAnimation} // Using the same study animation for consistency
                    loop
                    autoplay
                    className="hidden sm:block absolute top-0 right-0 w-24 sm:w-32 lg:w-48 pointer-events-none select-none"
                />
            </div>

            {/* Example cards for staff dashboard - can be expanded */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng quan yêu cầu tư vấn</h3>
                    <p className="text-gray-600">
                        Bạn có <strong>{loading ? '...' : inquiriesCount}</strong> yêu cầu tư vấn.
                    </p>
                    <button
                        onClick={() => navigate(paths.staff_home)}
                        className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                        Xem yêu cầu
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng số khóa học</h3>
                    <p className="text-gray-600">
                        Hiện có <strong>{loading ? '...' : activeCoursesCount}</strong> khóa học trong hệ thống.
                    </p>
                    <button
                        onClick={() => navigate(paths.course_management)}
                        className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                        Quản lý khóa học
                    </button>
                </div>
                {/* <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Khiếu nại mới</h3>
                    <p className="text-gray-600">Có <strong>2</strong> khiếu nại chưa được xử lý.</p>
                    <button
                        onClick={() => navigate(paths.home)}
                        className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                        Xem khiếu nại
                    </button>
                </div> */}
            </div>
        </div>
    );
};


// StaffHomePage Component (main layout for staff)
const StaffHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 font-inter flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <StaffSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with profile button */}
        <StaffHeader />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/nhan-vien/bang-dieu-khien" element={<StaffDashboardContent />} />
            <Route path="/staff/inquiries" element={<InquiriesPage />} />
            <Route path="/staff/study-plan" element={<StaffStudyPlanPage />} />
            <Route path="/course-management" element={<StaffCourseManagementPage />} />
            <Route path="/course-management/create" element={<CreateCoursePage />} /> {/* Add route for CreateCoursePage */}
            <Route path="/course-detail/:courseId" element={<CourseDetailPage />} /> {/* Add route for CourseDetailPage */}
            <Route path="/staff/reports" element={<ReportsPage />} />
            <Route path="/staff/tags" element={<TagsPage />} />
            <Route path="/staff/questions" element={<QuestionsPage />} />
            <Route path="/nhan-vien/ho-so" element={<StaffProfilePage />} />
            <Route path="/staff/settings" element={<StaffSettingsPage />} /> {/* Add route for StaffSettingsPage */}
            {/* Default route for staff, redirects to dashboard */}
            <Route path="/" element={<StaffDashboardContent />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
export default StaffHomePage;
