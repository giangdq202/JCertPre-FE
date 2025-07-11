import React from "react";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import StaffCourseManagementPage from "./StaffCourseManagementPage";
import paths from "../../routes/path";
const InquiriesPage = () => <div className="p-6">Nội dung trang Yêu cầu tư vấn</div>;
const StaffStudyPlanPage = () => <div className="p-6">Nội dung trang Kế hoạch học tập (Staff)</div>;
const ReportsPage = () => <div className="p-6">Nội dung trang Quản lý khiếu nại</div>;
const TagsPage = () => <div className="p-6">Nội dung trang Cấu trúc đề thi</div>;
const QuestionsPage = () => <div className="p-6">Nội dung trang Ngân hàng câu hỏi</div>;
const StaffProfilePage = () => <div className="p-6">Nội dung trang Hồ sơ nhân viên</div>; // New staff profile page

const StaffDashboardContent = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-red-700 mb-2">Chào mừng, Quản lý!</h1>
        <p className="mt-2 text-gray-600">
            Chọn chức năng ở menu bên trái để quản lý hệ thống.
        </p>
        {/* Example cards for staff dashboard - can be expanded */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng quan yêu cầu tư vấn</h3>
                <p className="text-gray-600">Bạn có <strong>5</strong> yêu cầu tư vấn mới.</p>
                <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200">
                    Xem yêu cầu
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Khóa học đang hoạt động</h3>
                <p className="text-gray-600">Hiện có <strong>15</strong> khóa học đang hoạt động.</p>
                <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200">
                    Quản lý khóa học
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Khiếu nại mới</h3>
                <p className="text-gray-600">Có <strong>2</strong> khiếu nại chưa được xử lý.</p>
                <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200">
                    Xem khiếu nại
                </button>
            </div>
        </div>
    </div>
);


// StaffHomePage Component (main layout for staff)
const StaffHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-inter flex flex-col lg:flex-row">
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
            <Route path="/staff/reports" element={<ReportsPage />} />
            <Route path="/staff/tags" element={<TagsPage />} />
            <Route path="/staff/questions" element={<QuestionsPage />} />
            <Route path="/nhan-vien/ho-so" element={<StaffProfilePage />} />
            {/* Default route for staff */}
            {/* <Route path="/" element={<StaffDashboardContent />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
};
export default StaffHomePage;