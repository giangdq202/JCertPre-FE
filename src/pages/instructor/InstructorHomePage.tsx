import React from "react";
import InstructorSidebar from "../../components/sidebar/InstructorSidebar";
import InstructorHeader from "../../components/header/InstructorHeader";
import { useNavigate } from 'react-router-dom';
import paths from "../../routes/path";

// Lottie animation import
import Lottie from "lottie-react";
import studyAnimation from "../../animations/study.json";
import { MdOutlineSchedule } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";

const InstructorDashboardContent = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6">
            {/* Welcome Banner Section */}
            <div className="relative mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:px-8 lg:px-10 pr-28 sm:pr-40 lg:pr-56">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-snug">
                        Chào mừng trở lại, <span className="text-blue-600">Giảng viên!</span>
                    </h2>
                    <p className="text-gray-600 text-base mb-6">
                        Bạn có thể quản lý lịch trình dạy học và các khóa học được giao tại đây.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(paths.instructor_schedule)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-6 rounded-xl shadow-md hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                        >
                            <MdOutlineSchedule className="mr-2 text-base" />
                            Lịch trình dạy học
                        </button>
                        <button
                            onClick={() => navigate(paths.instructor_courses)}
                            className="bg-white text-blue-700 border border-blue-500 py-2.5 px-6 rounded-xl shadow-md hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                        >
                            <FaChalkboardTeacher className="mr-2 text-base" />
                            Quản lý khóa học
                        </button>
                    </div>
                </div>

                {/* Animation at the right corner */}
                <Lottie
                    animationData={studyAnimation}
                    loop
                    autoplay
                    className="hidden sm:block absolute top-0 right-0 w-24 sm:w-32 lg:w-48 pointer-events-none select-none"
                />
            </div>

            {/* Example cards for instructor dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Livestream hôm nay</h3>
                    <p className="text-gray-600">Bạn có <strong>3</strong> buổi livestream hôm nay.</p>
                    <button
                        onClick={() => navigate(paths.instructor_schedule)}
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        Xem lịch trình
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Khóa học được giao</h3>
                    <p className="text-gray-600">Hiện có <strong>5</strong> khóa học bạn đang dạy.</p>
                    <button
                        onClick={() => navigate(paths.instructor_courses)}
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        Quản lý khóa học
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Bài kiểm tra cần tạo</h3>
                    <p className="text-gray-600">Có <strong>7</strong> bài học chưa có bài kiểm tra.</p>
                    <button
                        onClick={() => navigate(paths.instructor_courses)}
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        Tạo bài kiểm tra
                    </button>
                </div>
            </div>
        </div>
    );
};

// InstructorHomePage Component (main layout for instructor)
const InstructorHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-inter flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <InstructorSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with profile button */}
        <InstructorHeader />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <InstructorDashboardContent />
        </main>
      </div>
    </div>
  );
};

export default InstructorHomePage;
