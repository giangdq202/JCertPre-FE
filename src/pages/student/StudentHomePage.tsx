import React, { useState, useEffect, useRef } from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar"; // Assuming you have a sidebar component for students
import { Link, useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  // createStudentProfile,
  StudentProfileDto,
} from "../../services/studentProfileService";
import { FaUserCircle, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { getCourses } from "../../services/courseService"; // Assuming you have a service to fetch courses
import StudentProfileModal from "../../components/modals/StudentProfileModal"; // Assuming you have a modal component for creating student profile
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/logo.png";
import paths from "../../routes/path";
import axios from "axios";
import { FaBookOpen, FaPenNib, FaArrowRight } from "react-icons/fa";
import {
  FiSearch,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";
import Lottie from "lottie-react";
import studyAnimation from "../../animations/study.json";
import StudentHeader from "../../components/header/StudentHeader";

const CoursesPage = () => <div className="p-6">Nội dung trang Khóa học</div>;
const ExamSimulationsPage = () => (
  <div className="p-6">Nội dung trang Mô phỏng kỳ thi</div>
);
const StudyPlanPage = () => (
  <div className="p-6">Nội dung trang Kế hoạch học tập</div>
);
const ProgressPage = () => (
  <div className="p-6">Nội dung trang Theo dõi tiến độ</div>
);
const MessagesPage = () => <div className="p-6">Nội dung trang Tin nhắn</div>;
const SchedulePage = () => <div className="p-6">Nội dung trang Lịch trình</div>;
const SettingsPage = () => <div className="p-6">Nội dung trang Cài đặt</div>;
const ProfilePage = () => (
  <div className="p-6">Nội dung trang Hồ sơ người dùng</div>
);

// StudentHomePage Component
const StudentHomePage = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const { userInfo, handleLogout } = useAuth();
  const navigate = useNavigate();
  const notificationCount = 2;

  const [studentProfile, setStudentProfile] =
    useState<StudentProfileDto | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        event.target &&
        !profileDropdownRef.current.contains(event.target as HTMLElement)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý khi hồ sơ được tạo thành công từ modal
  const handleProfileCreated = (profile: StudentProfileDto) => {
    setStudentProfile(profile);
    setShowProfileModal(false);
    // toast.success("Tạo hồ sơ thành công!");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const profile = await getStudentProfile(userInfo.id);

        if (profile) {
          setStudentProfile(profile);
        } else {
          // Không có hồ sơ (404), show modal
          setShowProfileModal(true);
        }
      } catch (error) {
        // Những lỗi khác ngoài 404
        console.error("Error fetching student profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userInfo?.id]);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
    navigate(paths.login, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-inter flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <StudentSideBar /> {/* Using the local Sidebar component */}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="relative mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Nội dung text & nút - chừa khoảng bên phải cho animation */}
            <div className="px-6 py-8 sm:px-8 lg:px-10 pr-28 sm:pr-40 lg:pr-56">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-snug">
                Chào mừng trở lại,{" "}
                <span className="text-green-600">{userInfo?.fullName}</span>!
              </h2>
              <p className="text-gray-600 text-base mb-6">
                Hãy tiếp tục hành trình chinh phục chứng chỉ{" "}
                <span className="font-medium text-gray-800">JLPT N3</span> của
                bạn.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-6 rounded-xl shadow-md hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium">
                  <FaBookOpen className="mr-2 text-base" />
                  Đăng ký khóa học mới
                </button>
                <button className="bg-white text-green-700 border border-green-500 py-2.5 px-6 rounded-xl shadow-md hover:bg-green-50 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium">
                  <FaPenNib className="mr-2 text-base" />
                  Làm bài kiểm tra thực hành
                </button>
              </div>
            </div>

            {/* Animation ở góc phải */}
            <Lottie
              animationData={studyAnimation}
              loop
              autoplay
              className="hidden sm:block absolute top-0 right-0 w-24 sm:w-32 lg:w-48 pointer-events-none select-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Study Progress Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                  Tiến độ học tập
                </h3>
                <a
                  href="#"
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition"
                >
                  Xem chi tiết
                </a>
              </div>

              <div className="flex flex-col items-center space-y-6">
                {/* Progress Circle */}
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className="text-green-500 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset="80.4" // 68% (100-68) * 251.2 / 100
                      style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
                    ></circle>
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      className="text-2xl font-bold text-gray-800"
                      dy=".3em"
                    >
                      68%
                    </text>
                  </svg>
                </div>

                {/* Detailed progress bars */}
                <div className="w-full space-y-4">
                  {[
                    { label: "Ngữ pháp", progress: 75 },
                    { label: "Từ vựng", progress: 82 },
                    { label: "Đọc hiểu", progress: 45 },
                    { label: "Nghe hiểu", progress: 90 },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{item.label}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Exams Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Các kỳ thi sắp tới
                </h3>
                <a
                  href="#"
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition"
                >
                  Xem tất cả
                </a>
              </div>

              <div className="space-y-6">
                {/* Exam Item */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                    <div className="h-full w-px bg-gray-300" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500">Ngày mai, 10:00 SA</p>
                    <h4 className="font-semibold text-gray-800 text-base">
                      Bài thi thử JLPT N3
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Ngữ pháp
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Đọc hiểu
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Nghe hiểu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exam Item */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1" />
                    <div className="h-full w-px bg-gray-300" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500">
                      Ngày 20 tháng 10, 2:30 CH
                    </p>
                    <h4 className="font-semibold text-gray-800 text-base">
                      Bài kiểm tra Kanji
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Từ vựng
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Viết
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exam Item */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      Ngày 21 tháng 10, 9:00 SA
                    </p>
                    <h4 className="font-semibold text-gray-800 text-base">
                      Bài kiểm tra Nghe hiểu
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Nghe hiểu
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900">
                Việc cần làm
              </h3>

              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <span className="text-base font-semibold text-gray-700">
                  Tháng 7, 2025
                </span>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-sm text-center text-gray-500 font-medium mb-2">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
                  (day, index) => (
                    <span key={index}>{day}</span>
                  )
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-7 gap-1 text-sm text-center">
                {/* Empty slots (example: 2 days for Wed start) */}
                {Array.from({ length: 2 }).map((_, index) => (
                  <span key={`empty-${index}`} className="w-9 h-9"></span>
                ))}

                {/* Calendar Days */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                  const hasTask = [5, 10, 15, 22].includes(date);
                  const isCurrent = date === 18;

                  return (
                    <div
                      key={date}
                      className={`
            w-9 h-9 relative rounded-full flex items-center justify-center 
            font-medium cursor-pointer transition-all
            ${isCurrent ? "border-2 border-green-600" : ""}
            ${
              hasTask
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "text-gray-800 hover:bg-gray-100"
            }
          `}
                    >
                      {date}
                      {hasTask && (
                        <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <button className="w-full mt-6 bg-green-50 text-green-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-green-100 transition-colors duration-200">
                Xem chi tiết việc cần làm
              </button>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Khóa học đã đăng ký
              </h3>
              <a
                href="#"
                className="text-green-600 hover:text-green-700 hover:underline text-base font-semibold transition"
              >
                Xem tất cả
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  image:
                    "https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg",
                  title: "Tiếng Nhật giao tiếp",
                  teacher: "Tanaka Keiko",
                  progress: "12/20 bài học đã hoàn thành",
                  progressPercent: 60,
                },
                {
                  image:
                    "https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg",
                  title: "Làm chủ Kanji: Trình độ N3",
                  teacher: "Suzuki Hiroshi",
                  progress: "16/20 bài học đã hoàn thành",
                  progressPercent: 80,
                },
                {
                  image:
                    "https://res.cloudinary.com/jcertpre-090725/image/upload/v1752225127/images/hqdefault_tcmisu.jpg",
                  title: "Nền tảng ngữ pháp",
                  teacher: "Tanaka Akira",
                  progress: "8/20 bài học đã hoàn thành",
                  progressPercent: 40,
                },
              ].map((course, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-green-400 transition duration-300 overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-t-xl">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 leading-snug mb-2">
                        {course.title}
                      </h4>

                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <img
                          src="https://placehold.co/24x24/cccccc/ffffff?text=GV"
                          alt="Teacher Avatar"
                          className="rounded-full mr-3 w-6 h-6"
                        />
                        <span className="truncate">{course.teacher}</span>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        {course.progress}
                      </p>

                      <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${course.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 select-none
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    >
                      <span>Tiếp tục học</span>
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses Section (Khóa học dành cho bạn) */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Khóa học dành cho bạn
              </h3>
              <Link
                to="/student/recommended-courses"
                className="text-green-600 hover:text-green-700 hover:underline text-base font-semibold transition"
              >
                Xem tất cả gợi ý
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: "jlpt-n3",
                  image:
                    "https://dungmori.com/cdn/course/default/1690873005_37035_14f279.png",
                  title: "Luyện thi JLPT N3",
                  description:
                    "Khóa học nâng cao dành cho học viên muốn chinh phục N2.",
                  level: "N2",
                },
                {
                  id: "n4-nang-cao",
                  image:
                    "https://dungmori.com/cdn/course/default/1690872820_49380_d3f430.png",
                  title: "Khóa học N4 nâng cao",
                  description:
                    "Nắm vững kiến thức N4 qua các ví dụ thực tế và bài tập chuyên sâu.",
                  level: "N4",
                },
                {
                  id: "n5-nguoi-moi-bat-dau",
                  image:
                    "https://dungmori.com/cdn/course/default/1690872770_61725_e6c174.png",
                  title: "Khóa học N5 cho người mới bắt đầu",
                  description:
                    "Lý tưởng cho người mới học tiếng Nhật với bài giảng đơn giản và dễ hiểu.",
                  level: "N5",
                },
              ].map((course) => (
                <Link
                  to={`/student/course-detail/${course.id}`}
                  key={course.id}
                  className="group block bg-white rounded-xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-green-400 transition duration-300 overflow-hidden"
                  tabIndex={0}
                >
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-t-xl">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between min-h-[260px]">
                    <div className="space-y-3">
                      <h4 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                        <FaBookOpen className="text-green-500" />
                        <span>Trình độ: {course.level}</span>
                      </div>
                    </div>
                    <div
                      className="mt-6 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-3 rounded-lg
                       group-hover:bg-green-700 transition-colors duration-300 cursor-pointer select-none
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    >
                      <span>Khám phá</span>
                      <FaArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Personalized Study Recommendations & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personalized Study Recommendations */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-5">
                Gợi ý học tập cá nhân hóa
              </h3>

              <div className="space-y-5">
                {[
                  {
                    title: "Ôn tập các dạng câu điều kiện",
                    description:
                      "Bài kiểm tra gần đây cho thấy bạn cần luyện tập thêm với các mẫu ngữ pháp điều kiện.",
                    action: "Bắt đầu luyện tập",
                  },
                  {
                    title: "Luyện nghe hiểu",
                    description:
                      "Cải thiện kỹ năng nghe của bạn với các bài tập âm thanh trình độ N3 này.",
                    action: "Bắt đầu nghe",
                  },
                  {
                    title: "Luyện viết Kanji",
                    description:
                      "Thực hành viết 15 ký tự Kanji thường bị nhầm lẫn này.",
                    action: "Bắt đầu viết",
                  },
                ].map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start p-4 border rounded-xl hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="text-md font-semibold text-gray-800 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {rec.description}
                      </p>
                      <button className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200">
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-5">
                Thông báo
              </h3>

              <div className="space-y-5">
                {[
                  {
                    title: "Lịch thi thử JLPT N3",
                    description:
                      "Bài thi thử N3 tiếp theo sẽ được tổ chức vào ngày 15 tháng 10. Đăng ký ngay để giữ chỗ.",
                    time: "2 ngày trước",
                  },
                  {
                    title: "Khóa học mới: Tiếng Nhật thương mại",
                    description:
                      "Khám phá cơ hội nghề nghiệp mới với khóa học Tiếng Nhật thương mại của chúng tôi bắt đầu vào tháng tới.",
                    time: "1 tuần trước",
                  },
                  {
                    title: "Bảo trì hệ thống",
                    description:
                      "JCertPre sẽ được bảo trì vào ngày 20 tháng 10 từ 2-4 giờ sáng JST. Một số tính năng có thể không khả dụng.",
                    time: "2 tuần trước",
                  },
                ].map((ann, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-md font-semibold text-gray-800">
                        {ann.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <HiOutlineClock className="text-base" />
                        <span>{ann.time}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {ann.description}
                    </p>

                    <a
                      href="#"
                      className="text-sm text-green-600 hover:text-green-700 font-medium inline-block transition-colors duration-200"
                    >
                      Tìm hiểu thêm →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Student Profile Modal */}
      {userInfo?.id && (
        <StudentProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={userInfo.id}
          onProfileCreated={handleProfileCreated}
        />
      )}
    </div>
  );
};

export default StudentHomePage;
