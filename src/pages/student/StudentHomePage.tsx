import React, { useState, useEffect } from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import { Link, useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  StudentProfileDto,
} from "../../services/studentProfileService";
import {
  getCourses,
  CourseListDto,
  CourseDto,
  CourseStatus,
  CourseLevel,
  getCourseById,
  getCourseInstructors,
  CourseType,
} from "../../services/courseService";
import { InstructorInfoDto } from "../../services/courseService";
import {
  getMyEnrollments,
  EnrollmentDetailDto,
} from "../../services/enrollmentService";
import { getByLessonId, TestDto } from "../../services/testService";
import LevelSetupModal from "../../components/modals/LevelSetupModal";
import ProfileManagementModal from "../../components/modals/ProfileManagementModal";
import { useAuth } from "../../auth/AuthContext";
import { useLessonProgress } from "../../hooks/useLessonProgress";
import { useCourseRatings } from "../../hooks/useCourseRatings";
import { useNotification } from "../../components/notifications";
import paths from "../../routes/path";
import { FaBookOpen, FaPenNib, FaArrowRight, FaTrophy, FaClock, FaUser } from "react-icons/fa";
import { HiOutlineClock } from "react-icons/hi2";
import Lottie from "lottie-react";
import studyAnimation from "../../animations/study.json";
import StudentHeader from "../../components/header/StudentHeader";
import CourseCard, { CourseTypeEnum } from "../../components/card/CourseCard";
import { livestreamApi, LivestreamTimetableDto } from "../../services/livestreamService";
import dayjs from "dayjs";

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
  const { getCourseCompletionRate } = useLessonProgress();
  const { success, error } = useNotification();

  const [studentProfile, setStudentProfile] =
    useState<StudentProfileDto | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileManagementModal, setShowProfileManagementModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseListDto[]>([]);
  const [isLoadingRecommendedCourses, setIsLoadingRecommendedCourses] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentDetailDto[]>([]);
  const [isLoadingEnrolledCourses, setIsLoadingEnrolledCourses] = useState(true);
  const [enrolledThumbnails, setEnrolledThumbnails] = useState<{ [courseId: string]: string }>({});
  const [enrolledCoursesLoaded, setEnrolledCoursesLoaded] = useState(false);
  const [enrolledInstructors, setEnrolledInstructors] = useState<{ [courseId: string]: InstructorInfoDto[] }>({});
  const [recommendedInstructors, setRecommendedInstructors] = useState<{ [courseId: string]: InstructorInfoDto[] }>({});
  const [courseCompletionRates, setCourseCompletionRates] = useState<{ [courseId: string]: number }>({});
  const [isLoadingCompletionRates, setIsLoadingCompletionRates] = useState(false);
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState<{ [courseId: string]: CourseDto }>({});

  // Get course ratings for recommended courses
  const recommendedCourseIds = recommendedCourses.map(course => course.courseId);
  const { ratings: recommendedRatings, loading: loadingRecommendedRatings } = useCourseRatings(recommendedCourseIds);

  // Get course ratings for enrolled courses  
  const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.courseId);
  const { ratings: enrolledRatings, loading: loadingEnrolledRatings } = useCourseRatings(enrolledCourseIds);
  
  // Livestream states
  const [livestreams, setLivestreams] = useState<LivestreamTimetableDto[]>([]);
  const [isLoadingLivestreams, setIsLoadingLivestreams] = useState(false);
  
  // User tests states
  interface UserTestDto extends TestDto {
    courseName: string;
    lessonTitle: string;
    courseId: string;
    isCompleted: boolean;
  }
  const [userTests, setUserTests] = useState<UserTestDto[]>([]);
  const [isLoadingUserTests, setIsLoadingUserTests] = useState(false);

  // Hàm xử lý khi hồ sơ được tạo thành công từ modal
  const handleProfileCreated = (profile: StudentProfileDto) => {
    setStudentProfile(profile);
    setShowProfileModal(false);
    success("Thành công", "Tạo hồ sơ thành công!");
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
      } catch (err) {
        console.error("Error fetching student profile:", err);
        error("Lỗi", "Không thể tải hồ sơ học viên.");
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
        
        // Fetch course details for each enrolled course to get description
        const courseDetails: { [courseId: string]: CourseDto } = {};
        for (const enrollment of enrollments) {
          try {
            const courseDetail = await getCourseById(enrollment.courseId);
            courseDetails[enrollment.courseId] = courseDetail;
          } catch (error) {
            console.error(`Error fetching course details for ${enrollment.courseId}:`, error);
          }
        }
        setEnrolledCourseDetails(courseDetails);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        error("Lỗi", "Không thể tải danh sách khóa học đã đăng ký.");
        setEnrolledCoursesLoaded(true); // Mark as loaded even if error
      } finally {
        setIsLoadingEnrolledCourses(false);
      }
    };
    if (!isLoadingProfile) {
      fetchEnrolledCourses();
    }
  }, [isLoadingProfile]);

  // Fetch completion rates for enrolled courses
  useEffect(() => {
    const fetchCompletionRates = async () => {
      if (enrolledCourses.length === 0) return;
      
      setIsLoadingCompletionRates(true);
      const rates: { [courseId: string]: number } = {};
      
      try {
        await Promise.all(
          enrolledCourses.map(async (enrollment) => {
            try {
              const completionRate = await getCourseCompletionRate(enrollment.courseId);
              rates[enrollment.courseId] = completionRate;
            } catch (error) {
              console.error(`Error fetching completion rate for course ${enrollment.courseId}:`, error);
              rates[enrollment.courseId] = 0; // Default to 0 if error
            }
          })
        );
        
        setCourseCompletionRates(rates);
      } catch (error) {
        console.error("Error fetching completion rates:", error);
      } finally {
        setIsLoadingCompletionRates(false);
      }
    };

    if (enrolledCoursesLoaded && enrolledCourses.length > 0) {
      fetchCompletionRates();
    }
  }, [enrolledCoursesLoaded, enrolledCourses, getCourseCompletionRate]);

  // Fetch livestreams for enrolled courses
  useEffect(() => {
    const fetchLivestreams = async () => {
      if (!userInfo?.id || !enrolledCoursesLoaded) return;
      
      setIsLoadingLivestreams(true);
      try {
        const livestreamsData = await livestreamApi.getLivestreamsForEnrolledCourses(userInfo.id);
        setLivestreams(livestreamsData);
      } catch (error) {
        console.error("Error fetching livestreams:", error);
        setLivestreams([]);
      } finally {
        setIsLoadingLivestreams(false);
      }
    };

    fetchLivestreams();
  }, [userInfo?.id, enrolledCoursesLoaded]);

  // Fetch user tests from enrolled courses
  useEffect(() => {
    const fetchUserTests = async () => {
      if (!userInfo?.id || !enrolledCoursesLoaded) {
        console.log('Skipping fetchUserTests - userInfo:', !!userInfo?.id, 'enrolledCoursesLoaded:', enrolledCoursesLoaded);
        return;
      }
      
      console.log('Starting fetchUserTests...');
      setIsLoadingUserTests(true);
      try {
        // Get enrolled courses with lessons
        const enrolledCoursesData = await getMyEnrollments();
        console.log('Enrolled courses:', enrolledCoursesData);
        
        // Get all tests from enrolled courses
        const allTests: UserTestDto[] = [];
        
        for (const enrollment of enrolledCoursesData) {
          try {
            // Get course details to access lessons
            const courseDetail = await getCourseById(enrollment.courseId);
            console.log(`Course ${enrollment.courseId} details:`, courseDetail);
            if (courseDetail?.lessons) {
              console.log(`Course ${enrollment.courseId} has ${courseDetail.lessons.length} lessons`);
              for (const lesson of courseDetail.lessons) {
                try {
                  const test = await getByLessonId(lesson.lessonId);
                  console.log(`Lesson ${lesson.lessonId} test:`, test);
                  if (test) {
                    console.log(`Found 1 test in lesson ${lesson.lessonId}`);
                    allTests.push({
                      ...test,
                      courseName: enrollment.courseTitle || 'Unknown Course',
                      lessonTitle: lesson.title || 'Unknown Lesson',
                      courseId: enrollment.courseId,
                      isCompleted: false // Not checking completion status anymore
                    });
                  }
                } catch (error) {
                  console.error(`Failed to load tests for lesson ${lesson.lessonId}:`, error);
                }
              }
            }
          } catch (error) {
            console.error(`Failed to load course details for ${enrollment.courseId}:`, error);
          }
        }

        console.log('All tests found:', allTests);
        // Show all tests and limit to 3 for display
        const displayTests = allTests.slice(0, 3);
        console.log('Display tests:', displayTests);
        setUserTests(displayTests);
        
      } catch (error) {
        console.error('Failed to load user tests:', error);
        setUserTests([]);
      } finally {
        setIsLoadingUserTests(false);
      }
    };

    fetchUserTests();
  }, [userInfo?.id, enrolledCoursesLoaded]);

  // Fetch recommended courses based on student profile and enrolled courses
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setIsLoadingRecommendedCourses(true);

      try {
        // Get all published courses with Public type only
        const queryParams = {
          pageNumber: 1,
          pageSize: 20, // Get more courses to filter from
          status: CourseStatus.Published,
          courseType: CourseType.Public, // Only show Public courses
        };

        const response = await getCourses(queryParams);
        
        // Filter out courses that the student is already enrolled in
        const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.courseId);
        const filteredCourses = response.items.filter(course => 
          !enrolledCourseIds.includes(course.courseId)
        );
        
        // Limit to 5 recommended courses
        setRecommendedCourses(filteredCourses.slice(0, 5));
      } catch (err) {
        console.error("Error fetching recommended courses:", err);
        error("Lỗi", "Không thể tải danh sách khóa học gợi ý.");
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

  // Helper functions for calendar
  const getCurrentMonthData = () => {
    const currentDate = dayjs();
    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();
    const daysInMonth = currentDate.daysInMonth();
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).day();
    // Convert to Monday = 0 format
    const mondayFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    return {
      currentMonth,
      currentYear,
      daysInMonth,
      mondayFirstDay
    };
  };

  const getLivestreamDates = () => {
    const datesWithLivestreams: number[] = [];
    
    livestreams.forEach(livestream => {
      const livestreamDate = dayjs(livestream.scheduledDateTime);
      const currentDate = dayjs();
      
      // Only show livestreams in current month
      if (livestreamDate.month() === currentDate.month() && 
          livestreamDate.year() === currentDate.year()) {
        datesWithLivestreams.push(livestreamDate.date());
      }
    });
    
    return datesWithLivestreams;
  };

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
                Hãy tiếp tục hành trình chinh phục chứng chỉ JLPT của bạn.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
               <Link
                    to="/student/courses" // <--- Thêm thuộc tính 'to' với đường dẫn mong muốn
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-6 rounded-xl shadow-md hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                >
                    <FaBookOpen className="mr-2 text-base" />
                    Đăng ký khóa học mới
                </Link>
                <button 
                  onClick={() => navigate('/student/exam-simulations')}
                  className="bg-white text-green-700 border border-green-500 py-2.5 px-6 rounded-xl shadow-md hover:bg-green-50 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                >
                  <FaPenNib className="mr-2 text-base" />
                  Làm bài kiểm tra thực hành
                </button>
                
                {/* Profile Management Button - Only show if profile exists */}
                {studentProfile && (
                  <button 
                    onClick={() => setShowProfileManagementModal(true)}
                    className="bg-blue-600 text-white py-2.5 px-6 rounded-xl shadow-md hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center text-sm font-medium"
                  >
                    <FaUser className="mr-2 text-base" />
                    Xem Profile
                  </button>
                )}
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

          {/* Grid for Upcoming Exams and To-Do List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Study Progress Card - Temporarily Hidden */}
            {/* <div className="bg-white p-6 rounded-2xl shadow-xl">...</div> */}

            {/* User's Tests Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Các bài test của bạn
                </h3>
                <Link
                  to={paths.student_home} // Updated path
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition"
                >
                  Xem tất cả
                </Link>
              </div>

              {isLoadingUserTests ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600 text-sm">Đang tải...</span>
                </div>
              ) : userTests.length > 0 ? (
                <div className="space-y-4">
                  {userTests.map((test, index) => (
                    <div key={test.testId} className="flex items-start gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          test.status === 1 ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {index < userTests.length - 1 && <div className="h-12 w-px bg-gray-300" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-base mb-1">
                              {test.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">{test.courseName}</p>
                            <p className="text-xs text-gray-500 mb-2">{test.lessonTitle}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {test.durationMinutes} phút
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                test.status === 1 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {test.status === 1 ? 'Đang mở' : 'Đã đóng'}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/student/learn-course/${test.courseId}`)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm ml-4"
                            disabled={test.status !== 1}
                          >
                            Làm bài →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <button 
                      onClick={() => navigate('/student/courses')}
                      className="w-full text-center py-2 text-green-600 hover:text-green-700 font-medium text-sm hover:bg-green-50 rounded-lg transition-colors"
                    >
                      Xem tất cả bài test
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <p className="text-gray-500 mb-2">Không có bài test nào</p>
                  <p className="text-sm text-gray-400">Bạn chưa có khóa học nào hoặc khóa học chưa có bài test</p>
                </div>
              )}
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
                  {dayjs().format('MMMM, YYYY')}
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
                {(() => {
                  const { mondayFirstDay, daysInMonth } = getCurrentMonthData();
                  const livestreamDates = getLivestreamDates();
                  const currentDate = dayjs().date();

                  return (
                    <>
                      {/* Empty slots */}
                      {Array.from({ length: mondayFirstDay }).map((_, index) => (
                        <span key={`empty-${index}`} className="w-9 h-9"></span>
                      ))}

                      {/* Calendar Days */}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
                        const hasLivestream = livestreamDates.includes(date);
                        const isCurrent = date === currentDate;

                        return (
                          <div
                            key={date}
                            className={`
                              w-9 h-9 relative rounded-full flex items-center justify-center 
                              font-medium cursor-pointer transition-all
                              ${isCurrent ? "border-2 border-green-600" : ""}
                              ${
                                hasLivestream
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "text-gray-800 hover:bg-gray-100"
                              }
                            `}
                          >
                            {date}
                            {hasLivestream && (
                              <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/student/schedule")}
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
                to={paths.student_my_courses}
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
                {enrolledCourses.slice(0, 3).map((enrollment) => {
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
                      description={enrolledCourseDetails[enrollment.courseId]?.description || enrollment.courseDescription}
                      level="N5" // Mock level since it's not in EnrollmentDetailDto
                      price={0} // Mock price since it's not in EnrollmentDetailDto
                      progress={isLoadingCompletionRates ? undefined : (courseCompletionRates[enrollment.courseId] || 0)} // Use completion rate with loading state
                      courseType="Public" // Mock course type
                      buttonText="Xem chi tiết"
                      onClick={() => navigate(`/student/course-detail/${enrollment.courseId}`)}
                      averageRating={enrolledRatings[enrollment.courseId] || undefined}
                      studentName={userInfo?.fullName || "Học viên"}
                      onCertificateDownload={() => {
                        console.log('Certificate downloaded for course:', enrollment.courseTitle);
                      }}
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
                 to={paths.student_course}
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
                 {recommendedCourses.slice(0, 3).map((course) => {
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
                      courseType="Public" // Mock course type
                      onClick={() => navigate(`/student/course-detail/${course.courseId}`)}
                      averageRating={recommendedRatings[course.courseId] || undefined}
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
                     title: "Ôn tập theo các dạng câu hỏi",
                     description:
                       "Luyện tập các dạng câu hỏi khác nhau để cải thiện kỹ năng làm bài thi.",
                     action: "Bắt đầu luyện tập",
                     path: paths.question_management,
                   },
                   {
                     title: "Luyện thi JLPT",
                     description:
                       "Luyện tập các đề thi JLPT với quy trình thi thực tế.",
                     action: "Bắt đầu luyện tập",
                     path: paths.student_exam,
                   },
                   {
                     title: "Tư vấn lộ trình học",
                     description:
                       "Nhận tư vấn từ Tư vấn viên về lộ trình học tập phù hợp với trình độ của bạn.",
                     action: "Liên hệ tư vấn",
                     path: paths.student_messages,
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
                       <button 
                         onClick={() => navigate(rec.path)}
                         className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200"
                       >
                         {rec.action}
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Livestream Announcements */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-5">
                Thông báo Livestream
              </h3>

              {isLoadingLivestreams ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                  <p className="ml-4 text-gray-600">Đang tải lịch livestream...</p>
                </div>
              ) : livestreams.filter((livestream) => {
                const scheduledTime = dayjs(livestream.scheduledDateTime);
                const now = dayjs();
                const timeUntil = scheduledTime.diff(now, 'minute');
                return timeUntil >= -livestream.durationMinutes;
              }).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Chưa có livestream nào</h4>
                  <p className="text-gray-500">Hiện tại chưa có buổi livestream nào được lên lịch cho các khóa học của bạn.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {livestreams
                    .filter((livestream) => {
                      const scheduledTime = dayjs(livestream.scheduledDateTime);
                      const now = dayjs();
                      const timeUntil = scheduledTime.diff(now, 'minute');
                      // Chỉ hiển thị livestream chưa kết thúc (chưa quá thời gian kết thúc)
                      return timeUntil >= -livestream.durationMinutes;
                    })
                    .sort((a, b) => dayjs(a.scheduledDateTime).valueOf() - dayjs(b.scheduledDateTime).valueOf())
                    .slice(0, 3)
                    .map((livestream) => {
                      const scheduledTime = dayjs(livestream.scheduledDateTime);
                      const now = dayjs();
                      const timeUntil = scheduledTime.diff(now, 'minute');
                      const isUpcoming = timeUntil > 0;
                      const canJoin = timeUntil <= 15 && timeUntil >= -livestream.durationMinutes;
                      
                      return (
                        <div
                          key={livestream.livestreamId}
                          className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-md font-semibold text-gray-800 mb-1">
                                {livestream.description || 'Buổi học trực tuyến'}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Khóa học: {livestream.courseName}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <HiOutlineClock className="text-base" />
                                  <span>{scheduledTime.format('DD/MM/YYYY - HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaClock className="text-sm" />
                                  <span>{livestream.durationMinutes} phút</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {isUpcoming ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Sắp diễn ra
                                </span>
                              ) : canJoin ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Đang diễn ra
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Đã kết thúc
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {isUpcoming ? (
                                timeUntil > 60 ? (
                                  `Bắt đầu sau ${Math.ceil(timeUntil / 60)} giờ`
                                ) : (
                                  `Bắt đầu sau ${timeUntil} phút`
                                )
                              ) : canJoin ? (
                                'Có thể tham gia ngay'
                              ) : (
                                'Đã kết thúc'
                              )}
                            </div>
                            <button
                              onClick={() => navigate(paths.student_livestreams)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1 transition-colors duration-200"
                            >
                              Đi tới livestream
                              <FaArrowRight className="text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  
                  {livestreams.filter((livestream) => {
                    const scheduledTime = dayjs(livestream.scheduledDateTime);
                    const now = dayjs();
                    const timeUntil = scheduledTime.diff(now, 'minute');
                    return timeUntil >= -livestream.durationMinutes;
                  }).length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => navigate(paths.student_livestreams)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-1"
                      >
                        Xem tất cả livestream
                        <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Level Setup Modal */}
      {userInfo?.id && (
        <LevelSetupModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onProfileCreated={handleProfileCreated}
          userId={userInfo.id}
        />
      )}
      
      {/* Profile Management Modal */}
      <ProfileManagementModal
        isOpen={showProfileManagementModal}
        onClose={() => setShowProfileManagementModal(false)}
      />
    </div>
  );
};

export default StudentHomePage;
