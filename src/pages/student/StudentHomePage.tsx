import React, { useState, useEffect, useRef } from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import { Link, useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  StudentProfileDto,
} from "../../services/studentProfileService";
import {
  getCourses,
  CourseListDto,
  CourseStatus,
  CourseLevel,
  getCourseById,
  getCourseInstructors,
} from "../../services/courseService";
import { InstructorInfoDto } from "../../services/courseService";
import {
  getMyEnrollments,
  EnrollmentDetailDto,
} from "../../services/enrollmentService";
import StudentProfileModal from "../../components/modals/StudentProfileModal";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";
import { FaBookOpen, FaPenNib, FaArrowRight } from "react-icons/fa";
import { HiOutlineClock } from "react-icons/hi2";
import Lottie from "lottie-react";
import studyAnimation from "../../animations/study.json";
import StudentHeader from "../../components/header/StudentHeader";
import CourseCard, { CourseTypeEnum } from "../../components/card/CourseCard";

// Placeholder components (kept for routing purposes)
const CoursesPage = () => <div className="p-6 text-gray-700">Nội dung trang Khóa học</div>;
const ExamSimulationsPage = () => (
  <div className="p-6 text-gray-700">Nội dung trang Mô phỏng kỳ thi</div>
);
const StudyPlanPage = () => (
  <div className="p-6 text-gray-700">Nội dung trang Kế hoạch học tập</div>
);
const ProgressPage = () => (
  <div className="p-6 text-gray-700">Nội dung trang Theo dõi tiến độ</div>
);
const MessagesPage = () => <div className="p-6 text-gray-700">Nội dung trang Tin nhắn</div>;
const SchedulePage = () => <div className="p-6 text-gray-700">Nội dung trang Lịch trình</div>;
const SettingsPage = () => <div className="p-6 text-gray-700">Nội dung trang Cài đặt</div>;
const ProfilePage = () => (
  <div className="p-6 text-gray-700">Nội dung trang Hồ sơ người dùng</div>
);

// Helper function to map string level to numeric CourseLevel enum
const getNumericLevel = (levelString: string): CourseLevel | undefined => {
  const levelMap: { [key: string]: CourseLevel } = {
    "N5": CourseLevel.N5,
    "N4": CourseLevel.N4,
    "N3": CourseLevel.N3,
    "N2": CourseLevel.N2,
    "N1": CourseLevel.N1,
  };
  return levelMap[levelString];
};

// StudentHomePage Component
const StudentHomePage = () => {
  const { userInfo } = useAuth(); // Kept for user info
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] =
    useState<StudentProfileDto | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseListDto[]>([]);
  const [isLoadingRecommendedCourses, setIsLoadingRecommendedCourses] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentDetailDto[]>([]);
  const [isLoadingEnrolledCourses, setIsLoadingEnrolledCourses] = useState(true);
  const [enrolledThumbnails, setEnrolledThumbnails] = useState<{ [courseId: string]: string }>({});
  const [enrolledCoursesLoaded, setEnrolledCoursesLoaded] = useState(false);
  const [enrolledInstructors, setEnrolledInstructors] = useState<{ [courseId: string]: InstructorInfoDto[] }>({});
  const [recommendedInstructors, setRecommendedInstructors] = useState<{ [courseId: string]: InstructorInfoDto[] }>({});

  // Hàm xử lý khi hồ sơ được tạo thành công từ modal
  const handleProfileCreated = (profile: StudentProfileDto) => {
    setStudentProfile(profile);
    setShowProfileModal(false);
    alert("Tạo hồ sơ thành công!"); // Using alert instead of Ant Design message
  };

  // Fetch student profile
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
          setShowProfileModal(true); // No profile found, show modal
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
        alert("Failed to fetch student profile."); // Using alert
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userInfo?.id]);

  // Fetch enrolled courses after profile loads
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setIsLoadingEnrolledCourses(true);
      try {
        const enrollments = await getMyEnrollments();
        setEnrolledCourses(enrollments);
        setEnrolledCoursesLoaded(true);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        alert("Failed to fetch enrolled courses.");
        setEnrolledCoursesLoaded(true); // Mark as loaded even if error
      } finally {
        setIsLoadingEnrolledCourses(false);
      }
    };
    if (!isLoadingProfile) {
      fetchEnrolledCourses();
    }
  }, [isLoadingProfile]);

  // Fetch recommended courses based on student profile and enrolled courses
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setIsLoadingRecommendedCourses(true);

      try {
        // Get all published courses
        const queryParams = {
          pageNumber: 1,
          pageSize: 20, // Get more courses to filter from
          status: CourseStatus.Published,
        };

        const response = await getCourses(queryParams);
        
        // Filter out courses that the student is already enrolled in
        const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.courseId);
        const filteredCourses = response.items.filter(course => 
          !enrolledCourseIds.includes(course.courseId)
        );
        
        // Limit to 5 recommended courses
        setRecommendedCourses(filteredCourses.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recommended courses:", error);
        alert("Failed to fetch recommended courses."); // Using alert
      } finally {
        setIsLoadingRecommendedCourses(false);
      }
    };

    // Only fetch recommended courses after both profile and enrolled courses are loaded
    if (!isLoadingProfile && enrolledCoursesLoaded) {
      fetchRecommendedCourses();
    }
  }, [isLoadingProfile, studentProfile, enrolledCoursesLoaded, enrolledCourses]); // Added enrolledCoursesLoaded dependency

  // Fetch thumbnails for enrolled courses
  useEffect(() => {
    const fetchThumbnails = async () => {
      const newThumbnails: { [courseId: string]: string } = {};
      try {
        await Promise.all(
          enrolledCourses.map(async (enrollment) => {
            try {
              const course = await getCourseById(enrollment.courseId);
              newThumbnails[enrollment.courseId] = course.thumbnailUrl || "";
            } catch (error) {
              console.error(`Error fetching course ${enrollment.courseId}:`, error);
              newThumbnails[enrollment.courseId] = "";
            }
          })
        );
      } catch (error) {
        console.error("Error fetching thumbnails:", error);
        // Set empty thumbnails as fallback
        enrolledCourses.forEach((enrollment) => {
          newThumbnails[enrollment.courseId] = "";
        });
      }
      setEnrolledThumbnails(newThumbnails);
    };
    
    if (enrolledCourses.length > 0) {
      fetchThumbnails();
    } else {
      setEnrolledThumbnails({});
    }
  }, [enrolledCourses]);

  // Fetch instructors for enrolled courses
  useEffect(() => {
    const fetchInstructors = async () => {
      const result: { [courseId: string]: InstructorInfoDto[] } = {};
      try {
        await Promise.all(
          enrolledCourses.map(async (enrollment) => {
            try {
              const instructors = await getCourseInstructors(enrollment.courseId);
              result[enrollment.courseId] = instructors;
            } catch (error) {
              console.error(`Error fetching instructors for course ${enrollment.courseId}:`, error);
              result[enrollment.courseId] = [];
            }
          })
        );
      } catch (error) {
        console.error("Error fetching enrolled course instructors:", error);
        // Set empty instructors as fallback
        enrolledCourses.forEach((enrollment) => {
          result[enrollment.courseId] = [];
        });
      }
      setEnrolledInstructors(result);
    };
    
    if (enrolledCourses.length > 0) fetchInstructors();
    else setEnrolledInstructors({});
  }, [enrolledCourses]);

  // Fetch instructors for recommended courses
  useEffect(() => {
    const fetchInstructors = async () => {
      const result: { [courseId: string]: InstructorInfoDto[] } = {};
      try {
        await Promise.all(
          recommendedCourses.map(async (course) => {
            try {
              const instructors = await getCourseInstructors(course.courseId);
              result[course.courseId] = instructors;
            } catch (error) {
              console.error(`Error fetching instructors for course ${course.courseId}:`, error);
              result[course.courseId] = [];
            }
          })
        );
      } catch (error) {
        console.error("Error fetching recommended course instructors:", error);
        // Set empty instructors as fallback
        recommendedCourses.forEach((course) => {
          result[course.courseId] = [];
        });
      }
      setRecommendedInstructors(result);
    };
    
    if (recommendedCourses.length > 0) fetchInstructors();
    else setRecommendedInstructors({});
  }, [recommendedCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-inter flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <StudentSideBar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Banner Section */}
          <div className="relative mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Text content & buttons - leave space on the right for animation */}
            <div className="px-6 py-8 sm:px-8 lg:px-10 pr-28 sm:pr-40 lg:pr-56">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-snug">
                Chào mừng trở lại,{" "}
                <span className="text-green-600">{userInfo?.fullName || "Học viên"}</span>!
              </h2>
              <p className="text-gray-600 text-base mb-6">
                Hãy tiếp tục hành trình chinh phục chứng chỉ{" "}
                <span className="font-medium text-gray-800">
                  {studentProfile?.currentLevel ? `JLPT ${studentProfile.currentLevel}` : "Nhật ngữ"}
                </span>{" "}
                của bạn.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
               <Link
                    to="/student/courses" // <--- Thêm thuộc tính 'to' với đường dẫn mong muốn
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-6 rounded-xl shadow-md hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                >
                    <FaBookOpen className="mr-2 text-base" />
                    Đăng ký khóa học mới
                </Link>
                <button className="bg-white text-green-700 border border-green-500 py-2.5 px-6 rounded-xl shadow-md hover:bg-green-50 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium">
                  <FaPenNib className="mr-2 text-base" />
                  Làm bài kiểm tra thực hành
                </button>
              </div>
            </div>

            {/* Animation in the right corner */}
            <Lottie
              animationData={studyAnimation}
              loop
              autoplay
              className="hidden sm:block absolute top-0 right-0 w-24 sm:w-32 lg:w-48 pointer-events-none select-none"
            />
          </div>

          {/* Grid for Study Progress, Upcoming Exams, and To-Do List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Study Progress Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                  Tiến độ học tập
                </h3>
                <Link
                  to={paths.student_home} // Updated path
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition"
                >
                  Xem chi tiết
                </Link>
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
                <Link
                  to={paths.student_home} // Updated path
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition"
                >
                  Xem tất cả
                </Link>
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

            {/* To-Do List Card */}
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
              <button
                onClick={() => navigate(paths.student_home)} // Updated path
                className="w-full mt-6 bg-green-50 text-green-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                Xem chi tiết việc cần làm
              </button>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Khóa học của tôi
              </h3>
              <Link
                to={paths.student_home}
                className="text-green-600 hover:text-green-700 hover:underline text-base font-semibold transition"
              >
                Xem tất cả
              </Link>
            </div>
            {isLoadingEnrolledCourses ? (
              <div className="flex justify-center items-center h-24 bg-white rounded-2xl shadow-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                <p className="ml-4 text-gray-600">Đang tải khóa học...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <p className="text-gray-600">Bạn chưa đăng ký khóa học nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map((enrollment) => {
                  const instructorNode = (() => {
                    const instructor = enrolledInstructors[enrollment.courseId]?.[0];
                    if (instructor) {
                      return (
                        <>
                          <img
                            src={instructor.avatarUrl || "https://placehold.co/24x24/cccccc/ffffff?text=GV"}
                            alt={instructor.fullName}
                            className="rounded-full mr-3 w-6 h-6 object-cover"
                          />
                          <span className="truncate">{instructor.fullName}</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <img
                          src="https://placehold.co/24x24/cccccc/ffffff?text=GV"
                          alt="Teacher Avatar"
                          className="rounded-full mr-3 w-6 h-6"
                        />
                        <span className="truncate">Giáo viên</span>
                      </>
                    );
                  })();
                  return (
                    <CourseCard
                      key={enrollment.enrollmentId}
                      id={enrollment.courseId}
                      thumbnail={enrolledThumbnails[enrollment.courseId] || "https://placehold.co/400x200/E0F2F1/004D40?text=Course+Thumbnail"}
                      title={enrollment.courseTitle}
                      description={enrollment.courseDescription}
                      level="N5" // Mock level since it's not in EnrollmentDetailDto
                      price={0} // Mock price since it's not in EnrollmentDetailDto
                      progress={75} // Mock progress
                      courseType="Online" // Mock course type
                      onClick={() => navigate(`/learn-course/${enrollment.courseId}`)}
                      instructor={(() => {
                        const instructor = enrolledInstructors[enrollment.courseId]?.[0];
                        if (instructor) {
                          return {
                            avatarUrl: instructor.avatarUrl || undefined,
                            fullName: instructor.fullName,
                          };
                        }
                        return undefined;
                      })()}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Courses Section (Khóa học dành cho bạn) - Dynamic Content */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Danh sách khóa học
              </h3>
              <Link
                to={paths.student_home} // Updated path
                className="text-green-600 hover:text-green-700 hover:underline text-base font-semibold transition"
              >
                Xem tất cả gợi ý
              </Link>
            </div>

            {isLoadingRecommendedCourses ? (
              <div className="flex justify-center items-center h-24 bg-white rounded-2xl shadow-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                <p className="ml-4 text-gray-600">Đang tải khóa học...</p>
              </div>
            ) : recommendedCourses.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <p className="text-gray-600">Không tìm thấy khóa học nào phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedCourses.map((course) => {
                  const recInstructorNode = (() => {
                    const instructor = recommendedInstructors[course.courseId]?.[0];
                    if (instructor) {
                      return (
                        <>
                          <img
                            src={instructor.avatarUrl || "https://placehold.co/24x24/cccccc/ffffff?text=GV"}
                            alt={instructor.fullName}
                            className="rounded-full mr-3 w-6 h-6 object-cover"
                          />
                          <span className="truncate">{instructor.fullName}</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <img
                          src="https://placehold.co/24x24/cccccc/ffffff?text=GV"
                          alt="Teacher Avatar"
                          className="rounded-full mr-3 w-6 h-6"
                        />
                        <span className="truncate">Giáo viên</span>
                      </>
                    );
                  })();
                  return (
                    <CourseCard
                      key={course.courseId}
                      id={course.courseId}
                      thumbnail={course.thumbnailUrl || "https://placehold.co/400x200/E0F2F1/004D40?text=Course+Thumbnail"}
                      title={course.title}
                      description={course.description}
                      level={CourseLevel[course.level]}
                      price={course.price}
                      courseType="Online" // Mock course type
                      onClick={() => navigate(`/student/course-detail/${course.courseId}`)}
                      instructor={(() => {
                        const instructor = recommendedInstructors[course.courseId]?.[0];
                        if (instructor) {
                          return {
                            avatarUrl: instructor.avatarUrl || undefined,
                            fullName: instructor.fullName,
                          };
                        }
                        return undefined;
                      })()}
                    />
                  );
                })}
              </div>
            )}
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
          onProfileCreated={handleProfileCreated}
          userId={userInfo.id}
        />
      )}
    </div>
  );
};

export default StudentHomePage;
