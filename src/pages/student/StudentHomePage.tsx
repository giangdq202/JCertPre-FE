import React, { useState, useEffect, useRef } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar'; // Assuming you have a sidebar component for students
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/logo.png";
import paths from "../../routes/path";

const CoursesPage = () => <div className="p-6">Nội dung trang Khóa học</div>;
const ExamSimulationsPage = () => <div className="p-6">Nội dung trang Mô phỏng kỳ thi</div>;
const StudyPlanPage = () => <div className="p-6">Nội dung trang Kế hoạch học tập</div>;
const ProgressPage = () => <div className="p-6">Nội dung trang Theo dõi tiến độ</div>;
const MessagesPage = () => <div className="p-6">Nội dung trang Tin nhắn</div>;
const SchedulePage = () => <div className="p-6">Nội dung trang Lịch trình</div>;
const SettingsPage = () => <div className="p-6">Nội dung trang Cài đặt</div>;
const ProfilePage = () => <div className="p-6">Nội dung trang Hồ sơ người dùng</div>;


// StudentHomePage Component
const StudentHomePage = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null); 
  const { userInfo, handleLogout } = useAuth(); const navigate = useNavigate(); 
  useEffect(() => { 
    const handleClickOutside = (event: MouseEvent) => { 
      if ( profileDropdownRef.current && event.target && !profileDropdownRef.current.contains(event.target as HTMLElement) ) {
         setIsProfileDropdownOpen(false); } }; 
         document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside); }, []);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
    navigate(paths.login, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <StudentSideBar /> {/* Using the local Sidebar component */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex items-center justify-end rounded-b-xl lg:rounded-none">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, kỳ thi, hoặc từ vựng..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              </svg>
            </button>
            {/* Profile Dropdown Integration */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
              >
                <img src="https://placehold.co/32x32/cccccc/ffffff?text=MA" alt="User Avatar" className="rounded-full" />
                <span className="text-gray-700 font-medium hidden md:block">{userInfo?.fullName || "Người dùng"}</span>
                {isProfileDropdownOpen ? (
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                )}
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p><strong>Họ và tên:</strong> {userInfo?.fullName || "N/A"}</p>
                    <p><strong>Email:</strong> {userInfo?.email || "N/A"}</p>
                    <p><strong>Số điện thoại:</strong> {userInfo?.phone || "N/A"}</p>
                    <p><strong>Vai trò:</strong> {userInfo?.role || "N/A"}</p>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      navigate(paths.student_profile);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    Xem Hồ sơ
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng trở lại, {userInfo?.fullName}!</h2>
            <p className="text-gray-600 mb-4">Tiếp tục hành trình đạt chứng chỉ JLPT N3 của bạn</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
                Đăng ký khóa học mới
              </button>
              <button className="bg-white text-green-700 border border-green-500 py-2 px-6 rounded-lg hover:bg-green-50 transition-colors duration-200 shadow-md">
                Làm bài kiểm tra thực hành
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Study Progress Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Tiến độ học tập</h3>
                <a href="#" className="text-green-600 hover:underline text-sm">Xem chi tiết</a>
              </div>
              <div className="flex flex-col items-center mb-4">
                {/* Placeholder for progress circle */}
                <div className="w-32 h-32 relative mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle className="text-green-500 progress-ring__circle stroke-current" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="75.36" style={{transition: 'stroke-dashoffset 0.35s ease-out'}}></circle>
                    <text x="50" y="50" textAnchor="middle" className="text-xl font-bold text-gray-800" dy=".3em">68%</text>
                  </svg>
                </div>
                <div className="w-full">
                  {[
                    { label: 'Ngữ pháp', progress: 75 },
                    { label: 'Từ vựng', progress: 82 },
                    { label: 'Đọc hiểu', progress: 45 },
                    { label: 'Nghe hiểu', progress: 90 },
                  ].map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>{item.label}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Exams Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Các kỳ thi sắp tới</h3>
                <a href="#" className="text-green-600 hover:underline text-sm">Xem tất cả</a>
              </div>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-gray-500 text-sm">Ngày mai, 10:00 SA</p>
                  <h4 className="font-semibold text-gray-800">Bài thi thử JLPT N3</h4>
                  <div className="flex space-x-2 text-sm text-gray-600 mt-1">
                    <span>Ngữ pháp</span>
                    <span>Đọc hiểu</span>
                    <span>Nghe hiểu</span>
                  </div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-gray-500 text-sm">Ngày 15 tháng 10, 2:30 CH</p>
                  <h4 className="font-semibold text-gray-800">Bài kiểm tra Kanji</h4>
                  <div className="flex space-x-2 text-sm text-gray-600 mt-1">
                    <span>Từ vựng</span>
                    <span>Viết</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Ngày 18 tháng 10, 9:00 SA</p>
                  <h4 className="font-semibold text-gray-800">Bài kiểm tra Nghe hiểu</h4>
                  <div className="flex space-x-2 text-sm text-gray-600 mt-1">
                    <span>Nghe hiểu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* To-Do Calendar Card (Previously Study Streak Card) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Việc cần làm</h3>
              {/* Calendar header with month/year and navigation */}
              <div className="flex justify-between items-center mb-4">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <span className="font-medium text-gray-700">Tháng 7, 2025</span> {/* Example month */}
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
              {/* Days of the week header */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
                  <span key={index} className="text-gray-500 font-medium">{day}</span>
                ))}
              </div>
              {/* Calendar grid for days */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Placeholder for empty days at the start of the month (e.g., if month starts on Wednesday) */}
                {Array.from({ length: 2 }, (_, i) => i).map((_, index) => ( // Example: 2 empty days (Mon, Tue for a month starting on Wed)
                  <span key={`empty-${index}`} className="w-7 h-7 flex items-center justify-center text-gray-300"></span>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                  const hasTask = [5, 10, 15, 22].includes(date); // Example days with tasks
                  const isCurrentDay = date === 10; // Example current day

                  return (
                    <div
                      key={date}
                      className={`w-7 h-7 flex flex-col items-center justify-center rounded-full relative
                        ${isCurrentDay ? 'border-2 border-green-700' : ''}
                        ${hasTask ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'}`}
                    >
                      {date}
                      {hasTask && <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>}
                    </div>
                  );
                })}
              </div>
              <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors duration-200 mt-6">
                Xem chi tiết việc cần làm
              </button>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Khóa học đã đăng ký</h3>
              <a href="#" className="text-green-600 hover:underline">Xem tất cả</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  image: 'https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg',
                  title: 'Tiếng Nhật giao tiếp',
                  teacher: 'Tanaka Keiko',
                  progress: '12/20 bài học đã hoàn thành',
                },
                {
                  image: 'https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg',
                  title: 'Làm chủ Kanji: Trình độ N3',
                  teacher: 'Suzuki Hiroshi',
                  progress: '16/20 bài học đã hoàn thành',
                },
                {
                  image: 'https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg',
                  title: 'Nền tảng ngữ pháp',
                  teacher: 'Tanaka Akira',
                  progress: '8/20 bài học đã hoàn thành',
                },
              ].map((course, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h4>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <img src="https://placehold.co/24x24/cccccc/ffffff?text=GV" alt="Teacher Avatar" className="rounded-full mr-2" />
                      <span>{course.teacher}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{course.progress}</p>
                    <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors duration-200">
                      Tiếp tục
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses Section (Khóa học dành cho bạn) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Khóa học dành cho bạn</h3>
              <a href="#" className="text-green-600 hover:underline">Xem tất cả gợi ý</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  image: 'https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg',
                  title: 'Luyện thi JLPT N3',
                  description: 'Khóa học nâng cao dành cho học viên muốn chinh phục N2.',
                  level: 'N2',
                },
                {
                  image: 'https://res.cloudinary.com/jcertpre-090725/image/upload/v1752224957/images/download_ojnvc7.jpg',
                  title: 'Khóa học N4 nâng cao',
                  description: 'Khóa học N4 nâng cao',
                  level: 'N4',
                },
                {
                  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb9jHXStwRc8YgUIZ3mS5eGWYS36d66whnYw&s',
                  title: 'Khóa học N5 cho người mới bắt đầu',
                  description: 'Khóa học N5 này dành cho new bie',
                  level: 'N5',
                },
              ].map((course, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                    <p className="text-gray-500 text-xs mb-4">Trình độ: {course.level}</p>
                    <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200">
                      Khám phá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Study Recommendations & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personalized Study Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gợi ý học tập cá nhân hóa</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Ôn tập các dạng câu điều kiện',
                    description: 'Bài kiểm tra gần đây cho thấy bạn cần luyện tập thêm với các mẫu ngữ pháp điều kiện.',
                    action: 'Bắt đầu luyện tập'
                  },
                  {
                    title: 'Luyện nghe hiểu',
                    description: 'Cải thiện kỹ năng nghe của bạn với các bài tập âm thanh trình độ N3 này.',
                    action: 'Bắt đầu nghe'
                  },
                  {
                    title: 'Luyện viết Kanji',
                    description: 'Thực hành viết 15 ký tự Kanji thường bị nhầm lẫn này.',
                    action: 'Bắt đầu viết'
                  },
                ].map((rec, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                    <a href="#" className="text-green-600 hover:underline text-sm font-medium">{rec.action}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông báo</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Lịch thi thử JLPT N3',
                    description: 'Bài thi thử N3 tiếp theo sẽ được tổ chức vào ngày 15 tháng 10. Đăng ký ngay để giữ chỗ.',
                    time: '2 ngày trước'
                  },
                  {
                    title: 'Khóa học mới: Tiếng Nhật thương mại',
                    description: 'Khám phá cơ hội nghề nghiệp mới với khóa học Tiếng Nhật thương mại của chúng tôi bắt đầu vào tháng tới.',
                    time: '1 tuần trước'
                  },
                  {
                    title: 'Bảo trì hệ thống',
                    description: 'JCertPre sẽ được bảo trì vào ngày 20 tháng 10 từ 2-4 giờ sáng JST. Một số tính năng có thể không khả dụng.',
                    time: '2 tuần trước'
                  },
                ].map((ann, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-800">{ann.title}</h4>
                      <span className="text-gray-500 text-xs">{ann.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{ann.description}</p>
                    <a href="#" className="text-green-600 hover:underline text-sm font-medium">Tìm hiểu thêm</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentHomePage;