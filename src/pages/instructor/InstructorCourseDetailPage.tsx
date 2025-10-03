import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorSidebar from "../../components/sidebar/InstructorSidebar";
import InstructorHeader from "../../components/header/InstructorHeader";
import { FaChevronRight, FaQuestionCircle, FaPen, FaEye, FaEyeSlash, FaEdit, FaList } from "react-icons/fa";
import { getCourseById, CourseDto, CourseLevel } from "../../services/courseService";
import { LessonDto } from "../../types/lesson.types";
import { getLessonsByCourseId } from "../../services/lessonService";
import { getByLessonId, TestDto, TestStatus, updateTestStatus } from "../../services/testService";
import CreateTestModal from "../../components/modals/CreateTestModal";
import EditTestModal from "../../components/modals/EditTestModal";
import CreateWritingTestModal from "../../components/modals/CreateWritingTestModal";
import { toast } from 'react-toastify';

const InstructorCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeLessonPanel, setActiveLessonPanel] = useState<string | string[]>([]);

  // Test creation state
  const [isCreateTestModalVisible, setIsCreateTestModalVisible] = useState(false);
  const [isCreateWritingTestModalVisible, setIsCreateWritingTestModalVisible] = useState(false);
  const [isEditTestModalVisible, setIsEditTestModalVisible] = useState(false);
  const [currentLessonForTest, setCurrentLessonForTest] = useState<string>("");
  const [currentTestForEdit, setCurrentTestForEdit] = useState<TestDto | null>(null);
  
  // Test management state
  const [lessonTests, setLessonTests] = useState<{ [key: string]: TestDto | null }>({});
  const [lessonWritingTests, setLessonWritingTests] = useState<{ [key: string]: TestDto | null }>({});
  const [loadingTests, setLoadingTests] = useState<{ [key: string]: boolean }>({});

  // Fetch course and lessons data
  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      if (!courseId) {
        toast.error("Course ID is missing. Redirecting to course list.");
        setLoading(false);
        navigate("/instructor/courses");
        return;
      }
      
      setLoading(true);
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        const lessonsData = await getLessonsByCourseId(courseId, undefined, 1, 1000);
        setLessons(lessonsData.items.sort((a, b) => a.lessonOrder - b.lessonOrder));
      } catch (error) {
        console.error("Error fetching course details or lessons:", error);
        toast.error("Failed to fetch course details. Please check the ID or network connection.");
        navigate("/instructor/courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseAndLessons();
  }, [courseId, navigate]);

  const loadLessonTest = async (lessonId: string) => {
    setLoadingTests(prev => ({ ...prev, [lessonId]: true }));
    try {
      const test = await getByLessonId(lessonId);
      if (test) {
        // Check test type to determine which state to update
        if (test.testType === 3) { // Writing test
          setLessonWritingTests(prev => ({ ...prev, [lessonId]: test }));
          setLessonTests(prev => ({ ...prev, [lessonId]: null }));
        } else { // Multiple choice test
          setLessonTests(prev => ({ ...prev, [lessonId]: test }));
          setLessonWritingTests(prev => ({ ...prev, [lessonId]: null }));
        }
      } else {
        // No test found
        setLessonTests(prev => ({ ...prev, [lessonId]: null }));
        setLessonWritingTests(prev => ({ ...prev, [lessonId]: null }));
      }
    } catch (error) {
      console.error(`Failed to load test for lesson ${lessonId}:`, error);
      setLessonTests(prev => ({ ...prev, [lessonId]: null }));
      setLessonWritingTests(prev => ({ ...prev, [lessonId]: null }));
    } finally {
      setLoadingTests(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const handleLessonPanelToggle = (lessonId: string) => {
    setActiveLessonPanel(activeLessonPanel === lessonId ? [] : lessonId);
    
    // Load test for this lesson if not already loaded (single API call for both types)
    if (!lessonTests[lessonId] && !lessonWritingTests[lessonId] && !loadingTests[lessonId]) {
      loadLessonTest(lessonId);
    }
  };

  const showCreateTestModal = (lessonId: string) => {
    setCurrentLessonForTest(lessonId);
    setIsCreateTestModalVisible(true);
  };

  const showCreateWritingTestModal = (lessonId: string) => {
    setCurrentLessonForTest(lessonId);
    setIsCreateWritingTestModalVisible(true);
  };

  const handleTestCreated = () => {
    toast.success("Test created successfully!");
    // Refresh the test data for the current lesson
    if (currentLessonForTest) {
      loadLessonTest(currentLessonForTest);
    }
    setIsCreateTestModalVisible(false);
  };

  const handleWritingTestCreated = () => {
    toast.success("Writing test created successfully!");
    // Refresh test data (will categorize as writing test based on testType)
    if (currentLessonForTest) {
      loadLessonTest(currentLessonForTest);
    }
    setIsCreateWritingTestModalVisible(false);
  };

  const showEditTestModal = (test: TestDto) => {
    setCurrentTestForEdit(test);
    setIsEditTestModalVisible(true);
  };

  const handleTestUpdated = () => {
    if (currentTestForEdit?.lessonId) {
      loadLessonTest(currentTestForEdit.lessonId);
    }
    setIsEditTestModalVisible(false);
    setCurrentTestForEdit(null);
    toast.success("Test updated successfully!");
  };

  const handleTestStatusToggle = async (lessonId: string) => {
    const test = lessonTests[lessonId];
    if (!test) return;

    try {
      const newStatus = test.status === TestStatus.Open ? TestStatus.Close : TestStatus.Open;
      const updatedTest = await updateTestStatus(test.testId, newStatus);
      setLessonTests(prev => ({ ...prev, [lessonId]: updatedTest }));
      toast.success(`Test ${newStatus === TestStatus.Open ? 'opened' : 'closed'} successfully!`);
    } catch (error) {
      console.error(`Failed to update test status for lesson ${lessonId}:`, error);
      toast.error("Failed to update test status. Please try again.");
    }
  };

  const handleWritingTestStatusToggle = async (lessonId: string) => {
    const test = lessonWritingTests[lessonId];
    if (!test) return;

    try {
      const newStatus = test.status === TestStatus.Open ? TestStatus.Close : TestStatus.Open;
      const updatedTest = await updateTestStatus(test.testId, newStatus);
      setLessonWritingTests(prev => ({ ...prev, [lessonId]: updatedTest }));
      toast.success(`Writing test ${newStatus === TestStatus.Open ? 'opened' : 'closed'} successfully!`);
    } catch (error) {
      console.error(`Failed to update writing test status for lesson ${lessonId}:`, error);
      toast.error("Failed to update writing test status. Please try again.");
    }
  };

  const handleViewWritingSubmissions = (testId: string) => {
    navigate(`/instructor/writing-submissions/${testId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen font-['Inter']">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <div className="text-2xl font-semibold text-gray-700">Loading course details...</div>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-25"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen font-['Inter']">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <p className="text-lg text-gray-700">
            Course not found or an error occurred.
          </p>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Course List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-inter flex flex-col lg:flex-row">
      <InstructorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Quản lý Bài Kiểm Tra: <span className="text-blue-600">{course.title}</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Course Information (Read-only) */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b pb-3">Thông tin khóa học</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      {course.title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[80px]">
                      {course.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                      <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {CourseLevel[course.level]}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                      <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {course.price.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                      <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {new Date(course.startDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                      <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {new Date(course.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Course thumbnail */}
                  {course.thumbnailUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Lesson Management with Test Creation */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b pb-3">
                  Quản lý Bài Kiểm Tra
                </h2>
                <p className="text-gray-600 mb-6">
                  Tạo và quản lý bài kiểm tra cho các bài học trong khóa học này.
                </p>

                {/* Lessons List */}
                <div className="space-y-3">
                  {lessons.length === 0 ? (
                    <p className="text-gray-600 text-sm">Chưa có bài học nào cho khóa học này.</p>
                  ) : (
                    lessons.map((lesson) => (
                      <div
                        key={lesson.lessonId}
                        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleLessonPanelToggle(lesson.lessonId)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800">
                              Bài học {lesson.lessonOrder}: {lesson.title}
                            </span>
                            {lessonTests[lesson.lessonId] && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Có bài kiểm tra
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                showCreateTestModal(lesson.lessonId); 
                              }}
                              disabled={lessonTests[lesson.lessonId] !== null}
                              className={`transition-colors p-2 rounded-full ${
                                lessonTests[lesson.lessonId] !== null
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100'
                              }`}
                              title={lessonTests[lesson.lessonId] !== null ? 'Lesson này đã có test' : 'Tạo test cho bài học'}
                            >
                              <FaQuestionCircle size={18} />
                            </button>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                showCreateWritingTestModal(lesson.lessonId); 
                              }}
                              disabled={!!lessonWritingTests[lesson.lessonId]}
                              className={`transition-colors p-2 rounded-full ${
                                lessonWritingTests[lesson.lessonId] 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-100'
                              }`}
                              title={lessonWritingTests[lesson.lessonId] ? "Bài học đã có writing test" : "Tạo writing test cho bài học"}
                            >
                              <FaPen size={18} />
                            </button>
                            <FaChevronRight 
                              className={`text-gray-500 transition-transform duration-200 ${
                                activeLessonPanel === lesson.lessonId ? 'rotate-90' : ''
                              }`} 
                            />
                          </div>
                        </div>

                        {activeLessonPanel === lesson.lessonId && (
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="space-y-4">
                              <div>
                                <p className="text-gray-700 text-base">
                                  <span className="font-semibold">Thứ tự:</span> {lesson.lessonOrder}
                                </p>
                                <p className="text-gray-700 text-base mt-2">
                                  <span className="font-semibold">Nội dung:</span> {lesson.content}
                                </p>
                              </div>

                              {/* Test Section for this lesson */}
                              <div className="border-t pt-4">
                                <h4 className="text-lg font-semibold text-gray-700 mb-3">Bài kiểm tra</h4>
                                {loadingTests[lesson.lessonId] ? (
                                  <div className="text-center text-gray-500 py-4">Đang tải...</div>
                                ) : lessonTests[lesson.lessonId] ? (
                                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                      <FaQuestionCircle className="text-blue-600" size={24} />
                                      <div className="flex-1">
                                        <span className="text-base font-medium text-gray-800 block">
                                          {lessonTests[lesson.lessonId]?.title}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          {lessonTests[lesson.lessonId]?.description}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => showEditTestModal(lessonTests[lesson.lessonId]!)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Chỉnh sửa test"
                                      >
                                        Chỉnh sửa
                                      </button>
                                      <button
                                        onClick={() => handleTestStatusToggle(lesson.lessonId)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                                          lessonTests[lesson.lessonId]?.status === TestStatus.Open
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                        title={lessonTests[lesson.lessonId]?.status === TestStatus.Open ? 'Đóng test' : 'Mở test'}
                                      >
                                        {lessonTests[lesson.lessonId]?.status === TestStatus.Open ? (
                                          <>
                                            <FaEyeSlash />
                                            Đóng
                                          </>
                                        ) : (
                                          <>
                                            <FaEye />
                                            Mở
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                                    <FaQuestionCircle className="text-gray-400 text-4xl mx-auto mb-3" />
                                    <p className="text-gray-500 text-base mb-4">Chưa có bài kiểm tra nào.</p>
                                    <button
                                      onClick={() => showCreateTestModal(lesson.lessonId)}
                                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      Tạo bài kiểm tra
                                    </button>
                                  </div>
                                )}

                                {/* Writing Tests Section for this lesson */}
                                {loadingTests[lesson.lessonId] && !lessonTests[lesson.lessonId] && !lessonWritingTests[lesson.lessonId] ? (
                                  <div className="text-center text-gray-500 py-2">Đang tải bài kiểm tra...</div>
                                ) : lessonWritingTests[lesson.lessonId] ? (
                                  <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200 mb-4">
                                    <div className="flex items-center gap-3">
                                      <FaPen className="text-purple-600" size={20} />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-800">
                                            {lessonWritingTests[lesson.lessonId]?.title}
                                          </span>
                                          <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full font-medium">
                                            Viết
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500 block mt-1">
                                          {lessonWritingTests[lesson.lessonId]?.description}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => showEditTestModal(lessonWritingTests[lesson.lessonId]!)}
                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                        title="Chỉnh sửa bài kiểm tra viết"
                                      >
                                        <FaEdit className="text-xs" />
                                        Sửa
                                      </button>
                                      <button
                                        onClick={() => handleWritingTestStatusToggle(lesson.lessonId)}
                                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                                          lessonWritingTests[lesson.lessonId]?.status === TestStatus.Open
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                        title={lessonWritingTests[lesson.lessonId]?.status === TestStatus.Open ? 'Đóng test' : 'Mở test'}
                                      >
                                        {lessonWritingTests[lesson.lessonId]?.status === TestStatus.Open ? (
                                          <>
                                            <FaEyeSlash className="text-xs" />
                                            Đóng
                                          </>
                                        ) : (
                                          <>
                                            <FaEye className="text-xs" />
                                            Mở
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => handleViewWritingSubmissions(lessonWritingTests[lesson.lessonId]?.testId || '')}
                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                        title="Xem các bài đã nộp"
                                      >
                                        <FaList className="text-xs" />
                                        Xem các bài đã nộp
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for creating test */}
      <CreateTestModal
        isOpen={isCreateTestModalVisible}
        onClose={() => setIsCreateTestModalVisible(false)}
        lessonId={currentLessonForTest}
        courseLevel={course?.level || CourseLevel.N5}
        courseStartDate={course?.startDate || ""}
        courseEndDate={course?.endDate || ""}
        onTestCreated={handleTestCreated}
      />

      {/* Modal for editing test */}
      <EditTestModal
        isOpen={isEditTestModalVisible}
        onClose={() => {
          setIsEditTestModalVisible(false);
          setCurrentTestForEdit(null);
        }}
        test={currentTestForEdit}
        courseStartDate={course?.startDate}
        courseEndDate={course?.endDate}
        onTestUpdated={handleTestUpdated}
      />

      {/* Modal for creating writing test */}
      <CreateWritingTestModal
        isVisible={isCreateWritingTestModalVisible}
        onCancel={() => setIsCreateWritingTestModalVisible(false)}
        lessonId={currentLessonForTest}
        courseLevel={course?.level || CourseLevel.N5}
        courseStartDate={course?.startDate}
        courseEndDate={course?.endDate}
        onSuccess={handleWritingTestCreated}
      />
    </div>
  );
};

export default InstructorCourseDetailPage;


