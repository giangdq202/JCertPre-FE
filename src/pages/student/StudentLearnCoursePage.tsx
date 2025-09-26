import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonsByCourseId } from "../../services/lessonService";
import { LessonDto } from "../../types/lesson.types";
import { getDocumentsByLessonId, DocumentDto } from "../../services/documentService";
import { getCourseById, CourseDto } from "../../services/courseService";
import { getByLessonId, TestDto, TestType } from "../../services/testService";
import { getAllTestAttemptsByUserId, TestAttemptDto, TestAttemptStatus } from "../../services/testAttemptService";
import { 
  getLessonProgressByUserAndLesson
} from "../../services/lessonProgressService";
import { livestreamApi, LivestreamDto, LivestreamStatus } from "../../services/livestreamService";
import StudentHeader from "../../components/header/StudentHeader";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import { FaChevronRight, FaFilePdf, FaDownload, FaVideo, FaEdit, FaPen, FaPlay, FaClock, FaCalendarAlt, FaUser, FaExclamationTriangle } from "react-icons/fa";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";
import { useLessonProgress } from "../../hooks/useLessonProgress";
import { VideoLessonPlayer } from "../../components/VideoLessonPlayer";
import { TestInterface } from "../../components/TestInterface";
import WritingTestInterface from "../../components/WritingTestInterface";
import { useAuth } from "../../auth/AuthContext";
import { useNotification } from '../../components/notifications';
import paths from "../../routes/path";
import dayjs from 'dayjs';

// Add custom styles for video controls
const videoStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const StudentLearnCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [videoDoc, setVideoDoc] = useState<DocumentDto | null>(null);
  const [lessonProgress, setLessonProgress] = useState<{ [key: string]: number }>({});
  const [lessonTests, setLessonTests] = useState<{ [key: string]: TestDto | null }>({});
  const [loadingTests, setLoadingTests] = useState<{ [key: string]: boolean }>({});
  const [activeTest, setActiveTest] = useState<TestDto | null>(null);
  const [showTestInterface, setShowTestInterface] = useState(false);
  const [, setTestAttempts] = useState<TestAttemptDto[]>([]);
  const [passedTestIds, setPassedTestIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  
  // Livestream states
  const [livestreams, setLivestreams] = useState<LivestreamDto[]>([]);
  const [isLoadingLivestreams, setIsLoadingLivestreams] = useState(false);
  
  // Auth and lesson progress hooks
  const { isLoading: authLoading, userInfo } = useAuth();
  const { 
    getLessonCompletionRate, 
    getPassedTestIds,
    updateProgress
  } = useLessonProgress();
  const { error: showError, warning } = useNotification();

  // Helper function to check if course has expired
  const isCourseExpired = (endDate: string) => {
    return dayjs(endDate).isBefore(dayjs(), 'day');
  };

  // Get course expiry status
  const courseExpired = course?.endDate ? isCourseExpired(course.endDate) : false;

  useEffect(() => {
    if (!courseId || authLoading) return;
    setLoadingLessons(true);
    getCourseById(courseId)
      .then(setCourse)
      .catch(() => setCourse(null));
    getLessonsByCourseId(courseId)
      .then(async (res) => {
        setLessons(res.items);
        if (res.items.length > 0) setSelectedLessonId(res.items[0].lessonId);
        
        // Load progress for all lessons
        const loadAllProgress = async () => {
          const progressData: { [key: string]: number } = {};
          for (const lesson of res.items) {
            try {
              const progress = await getLessonCompletionRate(lesson.lessonId);
              progressData[lesson.lessonId] = progress;
            } catch (error) {
              console.error(`Failed to load progress for lesson ${lesson.lessonId}:`, error);
              progressData[lesson.lessonId] = 0;
            }
          }
          setLessonProgress(progressData);
        };
        
        // Load tests for all lessons to properly display pass status
        const loadAllLessonTests = async () => {
          for (const lesson of res.items) {
            try {
              await loadLessonTest(lesson.lessonId);
            } catch (error) {
              console.error(`Failed to load test for lesson ${lesson.lessonId}:`, error);
            }
          }
        };
        
        // Add a small delay to ensure userInfo is loaded
        setTimeout(() => {
          loadAllProgress();
          loadAllLessonTests();
        }, 100);
      })
      .finally(() => setLoadingLessons(false));
  }, [courseId, getLessonCompletionRate, authLoading]);

  useEffect(() => {
    if (!selectedLessonId) return;
    getDocumentsByLessonId(selectedLessonId)
      .then((docs) => {
        setDocuments(docs);
        // Ưu tiên video đầu tiên nếu có
        const video = docs.find((d) => d.fileUrl.includes("688ac2cc0012a1f4136d"));
        setVideoDoc(video || null);
        
        // Load test for this lesson if not already loaded
        if (!lessonTests[selectedLessonId] && !loadingTests[selectedLessonId]) {
          loadLessonTest(selectedLessonId);
        }
      });
  }, [selectedLessonId]);

  // Fetch livestreams for this course
  useEffect(() => {
    const fetchLivestreams = async () => {
      if (!courseId) return;
      
      setIsLoadingLivestreams(true);
      try {
        const livestreamsData = await livestreamApi.getLivestreamsByCourse(courseId);
        setLivestreams(livestreamsData);
      } catch (error) {
        console.error("Error fetching livestreams:", error);
        setLivestreams([]);
      } finally {
        setIsLoadingLivestreams(false);
      }
    };

    if (!authLoading && courseId) {
      fetchLivestreams();
    }
  }, [courseId, authLoading]);

  // Load all test attempts for the user
  useEffect(() => {
    const loadAllTestAttempts = async () => {
      if (!userInfo?.id) return;
      
      try {
        const allAttempts = await getAllTestAttemptsByUserId(userInfo.id);
        
        // Store all attempts
        setTestAttempts(allAttempts);
        
        // Find test IDs that have at least one passed attempt
        const passedTestIdsSet = new Set<string>();
        allAttempts.forEach(attempt => {
          if (attempt.status === TestAttemptStatus.Completed && attempt.isPass === true) {
            passedTestIdsSet.add(attempt.testId);
          }
        });
        
        setPassedTestIds(passedTestIdsSet);
      } catch (error) {
        console.error('Failed to load test attempts:', error);
      }
    };

    if (!authLoading && userInfo?.id) {
      loadAllTestAttempts();
    }
  }, [userInfo?.id, authLoading]);

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    // Load test for this lesson if not already loaded
    if (!lessonTests[lessonId] && !loadingTests[lessonId]) {
      loadLessonTest(lessonId);
    }
  };

  const loadLessonTest = async (lessonId: string) => {
    setLoadingTests(prev => ({ ...prev, [lessonId]: true }));
    try {
      const test = await getByLessonId(lessonId);
      setLessonTests(prev => ({ ...prev, [lessonId]: test }));
    } catch (error) {
      console.error(`Failed to load test for lesson ${lessonId}:`, error);
      setLessonTests(prev => ({ ...prev, [lessonId]: null }));
    } finally {
      setLoadingTests(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress[lessonId] >= 100;
  };

  const handleStartTest = (test: TestDto) => {
    setActiveTest(test);
    setShowTestInterface(true);
  };

  const handleBackFromTest = () => {
    setShowTestInterface(false);
    setActiveTest(null);
    // Refresh test results when coming back from test
    refreshTestResults();
  };

  const handleJoinLivestream = async (livestream: LivestreamDto) => {
    const now = dayjs();
    const livestreamStart = dayjs(livestream.scheduledDateTime);
    const timeUntilStart = livestreamStart.diff(now, 'minute');

    if (timeUntilStart > 15) {
      warning("Chưa đến giờ", `Buổi livestream sẽ bắt đầu sau ${timeUntilStart} phút. Bạn chỉ có thể tham gia 15 phút trước khi bắt đầu.`);
      return;
    }

    if (timeUntilStart < -livestream.durationMinutes) {
      showError("Livestream đã kết thúc", "Buổi livestream này đã kết thúc.");
      return;
    }

    try {
      // Check if user can join
      const canJoin = await livestreamApi.canJoinLivestream(livestream.livestreamId, userInfo?.id || '');
      
      if (!canJoin) {
        showError("Không có quyền truy cập", "Bạn không có quyền tham gia buổi livestream này.");
        return;
      }

      // Generate join token
      const joinData = await livestreamApi.generateJoinToken(livestream.livestreamId, userInfo?.id || '');
      
      // Navigate to livestream room
      navigate(paths.student_livestream.replace(':livestreamId', livestream.livestreamId), {
        state: {
          livestreamId: livestream.livestreamId,
          roomName: joinData.roomName,
          token: joinData.token,
          title: joinData.title,
          scheduledDateTime: joinData.scheduledDateTime,
          description: joinData.description,
          durationMinutes: joinData.durationMinutes
        }
      });
    } catch (error: any) {
      console.error("Error joining livestream:", error);
      showError("Lỗi tham gia livestream", "Không thể tham gia buổi livestream. Vui lòng thử lại.");
    }
  };

  const getLivestreamStatus = (livestream: LivestreamDto) => {
    const now = dayjs();
    const livestreamStart = dayjs(livestream.scheduledDateTime);
    const timeUntilStart = livestreamStart.diff(now, 'minute');

    if (livestream.status === LivestreamStatus.COMPLETED) {
      return { status: 'completed', text: 'Đã kết thúc', color: 'text-gray-500' };
    }

    if (livestream.status === LivestreamStatus.LIVE) {
      return { status: 'live', text: 'Đang diễn ra', color: 'text-red-600' };
    }

    if (timeUntilStart <= 0 && timeUntilStart > -livestream.durationMinutes) {
      return { status: 'live', text: 'Đang diễn ra', color: 'text-red-600' };
    }

    if (timeUntilStart <= 15 && timeUntilStart > 0) {
      return { status: 'starting', text: 'Sắp bắt đầu', color: 'text-orange-600' };
    }

    return { status: 'scheduled', text: 'Đã lên lịch', color: 'text-green-600' };
  };

  const canJoinLivestream = (livestream: LivestreamDto) => {
    const now = dayjs();
    const livestreamStart = dayjs(livestream.scheduledDateTime);
    const timeUntilStart = livestreamStart.diff(now, 'minute');
    
    return timeUntilStart <= 15 && timeUntilStart > -livestream.durationMinutes && livestream.status !== LivestreamStatus.COMPLETED;
  };

  const isTestPassed = (testId: string) => {
    return passedTestIds.has(testId);
  };

  // const getTestScore = (testId: string) => {
  //   // Find the best (highest scoring) passed attempt for this test
  //   const passedAttempts = testAttempts.filter(attempt => 
  //     attempt.testId === testId && 
  //     attempt.status === TestAttemptStatus.Completed && 
  //     attempt.isPass === true
  //   );
  //   
  //   if (passedAttempts.length === 0) return null;
  //   
  //   // For now, just return "PASS" since we don't have percentage score in attempt
  //   // You might need to call getTestAttemptWithScoreSummary for the specific attempt if you need percentage
  //   return "PASS";
  // };

  const refreshTestResults = async () => {
    if (!userInfo?.id) return;
    
    try {
      // Use the new service to get passed test IDs
      const passedTestIdsSet = await getPassedTestIds();
      setPassedTestIds(passedTestIdsSet);
      
      // Check for newly completed tests and update lesson progress
      await checkAndUpdateLessonProgress(passedTestIdsSet);
      
      // Refresh lesson progress for all lessons to update UI
      await refreshAllLessonProgress();
    } catch (error) {
      console.error('Failed to refresh test results:', error);
      // Fallback to empty set on error
      setPassedTestIds(new Set());
    }
  };

  // Refresh lesson progress for all lessons
  const refreshAllLessonProgress = async () => {
    if (!userInfo?.id) return;
    
    try {
      const progressData: { [key: string]: number } = {};
      for (const lesson of lessons) {
        try {
          const progress = await getLessonCompletionRate(lesson.lessonId);
          progressData[lesson.lessonId] = progress;
        } catch (error) {
          console.error(`Failed to load progress for lesson ${lesson.lessonId}:`, error);
          progressData[lesson.lessonId] = 0;
        }
      }
      setLessonProgress(progressData);
    } catch (error) {
      console.error('Failed to refresh lesson progress:', error);
    }
  };

  // Check and update lesson progress for completed tests
  const checkAndUpdateLessonProgress = async (passedTestIds: Set<string>) => {
    if (!userInfo?.id || !courseId) return;
    
    try {
      // Get all lessons and their tests
      for (const lesson of lessons) {
        const test = lessonTests[lesson.lessonId];
        if (!test) continue;
        
        // If test is passed, check and update lesson progress
        if (passedTestIds.has(test.testId)) {
          const existingProgress = await getLessonProgressByUserAndLesson(userInfo.id, lesson.lessonId);
          
          if (existingProgress && existingProgress.completionRate < 100) {
            // Update lesson progress to 100% if test is passed but progress is not 100%
            await updateProgress(existingProgress.progressId, 100);
            console.log(`Updated lesson progress for lesson ${lesson.lessonId} to 100%`);
            
            // Update local state immediately
            setLessonProgress(prev => ({
              ...prev,
              [lesson.lessonId]: 100
            }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
    }
  };

  return (
    <>
      <style>{videoStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-inter flex flex-col lg:flex-row">
        <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <span className="hover:underline cursor-pointer" onClick={() => navigate(-1)}>Khóa học</span>
            <FaChevronRight className="inline mx-1" />
            <span className="font-semibold text-green-700">{course?.title || "..."}</span>
          </nav>
          
          {/* Course Expiry Warning */}
          {courseExpired && course?.endDate && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-400 mr-3" />
                <div>
                  <h3 className="text-red-800 font-semibold text-lg">Khóa học đã hết hạn</h3>
                  <p className="text-red-700 mt-1">
                    Khóa học này đã kết thúc vào ngày {dayjs(course.endDate).format('DD/MM/YYYY')}. 
                    Bạn không thể thực hiện các bài kiểm tra sau thời hạn này.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {showTestInterface && activeTest ? (
                // Conditional rendering based on test type
                activeTest.testType === TestType.WrittenManual ? (
                  <WritingTestInterface 
                    test={activeTest}
                    onBack={handleBackFromTest}
                    onTestCompleted={async () => {
                      // Hide test interface immediately and show lesson content
                      setShowTestInterface(false);
                      setActiveTest(null);
                      
                      // Refresh test results and lesson progress after test completion
                      await refreshTestResults();
                    }}
                  />
                ) : (
                  <TestInterface 
                    test={activeTest} 
                    lessonId={selectedLessonId || undefined}
                    courseId={courseId}
                    onBack={handleBackFromTest} 
                    onTestCompleted={async () => {
                      // Hide test interface immediately and show lesson content
                      setShowTestInterface(false);
                      setActiveTest(null);
                      
                      // Refresh test results and lesson progress after test completion
                      await refreshTestResults();
                    }}
                  />
                )
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedLessonId && lessons.find(l => l.lessonId === selectedLessonId)?.title}</h2>
              
               {/* Video player without progress tracking */}
               {videoDoc && selectedLessonId ? (
                 <VideoLessonPlayer
                   courseId={courseId!}
                   lessonId={selectedLessonId}
                   lessonTitle={lessons.find(l => l.lessonId === selectedLessonId)?.title || ''}
                   videoUrl={videoDoc.fileUrl}
                 />
              ) : videoDoc ? (
                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Video bài học</h3>
                    <span className="text-sm text-gray-500">{videoDoc.documentName}</span>
                  </div>
                  <div className="relative w-full bg-black rounded-xl overflow-hidden">
                    <video
                      src={videoDoc.fileUrl}
                      controls
                      className="w-full h-auto"
                      style={{ minHeight: 400, maxHeight: '70vh' }}
                      autoPlay={false}
                      preload="metadata"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-xl p-8 text-center text-gray-500 mb-6">
                  <FaVideo className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p>Không có video cho bài học này</p>
                </div>
              )}

              {/* Lesson Content - Mô tả bài học */}
              {selectedLessonId && lessons.find(l => l.lessonId === selectedLessonId)?.content && (
                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mô tả bài học</h3>
                  <div className="prose prose-gray max-w-none">
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: lessons.find(l => l.lessonId === selectedLessonId)?.content || '' 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Phần Lịch livestream sắp tới */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaVideo className="text-2xl text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Lịch livestream sắp tới</h3>
                </div>
                
                {isLoadingLivestreams ? (
                  <div className="bg-white rounded-xl shadow-xl p-8">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                      <p className="ml-4 text-gray-600">Đang tải lịch livestream...</p>
                    </div>
                  </div>
                ) : livestreams.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                    <FaVideo className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Chưa có livestream nào</h4>
                    <p className="text-gray-500">Khóa học này chưa có lịch livestream nào được lên kế hoạch.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-6 font-semibold text-gray-700 border-b border-gray-200 pb-4 mb-4 gap-4">
                        <div className="lg:col-span-2">Buổi học</div>
                        <div>Trạng thái</div>
                        <div>Ngày & Thời gian</div>
                        <div>Thời lượng</div>
                        <div></div>
                      </div>
                      
                      {livestreams.map((livestream) => {
                        const statusInfo = getLivestreamStatus(livestream);
                        const canJoin = canJoinLivestream(livestream);
                        
                        return (
                          <div key={livestream.livestreamId} className="grid grid-cols-1 lg:grid-cols-6 items-center py-4 border-b border-gray-100 last:border-b-0 gap-4">
                            <div className="lg:col-span-2">
                              <div className="text-gray-900 font-medium">{livestream.description || 'Buổi học trực tuyến'}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <FaUser className="text-xs" />
                                <span>Giảng viên</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            <div className="text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-sm" />
                                <span>{dayjs(livestream.scheduledDateTime).format('DD/MM/YYYY')}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <FaClock className="text-sm" />
                                <span className="font-semibold text-green-600">
                                  {dayjs(livestream.scheduledDateTime).format('HH:mm')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-gray-600">
                              <div className="flex items-center gap-2">
                                <HiOutlineClock className="text-sm" />
                                <span>{livestream.durationMinutes} phút</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {canJoin ? (
                                <button
                                  onClick={() => handleJoinLivestream(livestream)}
                                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                  <FaPlay className="text-xs" />
                                  Tham gia
                                </button>
                              ) : statusInfo.status === 'completed' ? (
                                <span className="text-gray-400 text-sm">Đã kết thúc</span>
                              ) : statusInfo.status === 'scheduled' ? (
                                <span className="text-gray-500 text-sm">Chưa đến giờ</span>
                              ) : (
                                <span className="text-orange-500 text-sm">Sắp bắt đầu</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
                </>
              )}
            </div>
            {/* Sidebar lesson */}
            <aside className="w-80 min-w-[260px] bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2 h-fit sticky top-24">
              {/* Course Progress Summary */}
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Tiến độ khóa học</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Hoàn thành</span>
                  <span className="text-sm font-bold text-green-600">
                    {lessons.filter(l => isLessonCompleted(l.lessonId)).length}/{lessons.length} bài học
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${lessons.length > 0 ? (lessons.filter(l => isLessonCompleted(l.lessonId)).length / lessons.length) * 100 : 0}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(lessons.length > 0 ? (lessons.filter(l => isLessonCompleted(l.lessonId)).length / lessons.length) * 100 : 0)}% hoàn thành
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Danh sách bài học</h3>
              {loadingLessons ? (
                <div className="text-center text-gray-500">Đang tải...</div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {lessons.map((lesson) => (
                    <li key={lesson.lessonId}>
                                             <button
                         className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-start justify-between ${
                           selectedLessonId === lesson.lessonId 
                             ? "bg-green-100 text-green-700 border border-green-200" 
                             : "hover:bg-gray-100 text-gray-800"
                         }`}
                         onClick={() => handleLessonClick(lesson.lessonId)}
                       >
                         <div className="flex items-start gap-3 flex-1 min-w-0">
                           {isLessonCompleted(lesson.lessonId) ? (
                             <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                           ) : (
                             <FiCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                           )}
                           <span className="break-words leading-relaxed">{lesson.title}</span>
                         </div>
                         
                         {/* Progress indicator */}
                         {lessonProgress[lesson.lessonId] > 0 && !isLessonCompleted(lesson.lessonId) && (
                           <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                             <div className="w-12 h-1 bg-gray-200 rounded-full">
                               <div
                                 className="h-1 bg-yellow-500 rounded-full transition-all duration-300"
                                 style={{ width: `${lessonProgress[lesson.lessonId]}%` }}
                               />
                             </div>
                             <span className="text-xs text-gray-500">
                               {Math.round(lessonProgress[lesson.lessonId])}%
                             </span>
                           </div>
                         )}
                       </button>
                      
                      {/* Dropdown tài liệu và tests */}
                      {selectedLessonId === lesson.lessonId && (
                        <div className="ml-4 mt-2 flex flex-col gap-2">
                          {/* Tests */}
                          <div className="border-l-2 border-blue-200 pl-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Bài kiểm tra</span>
                              {loadingTests[lesson.lessonId] && (
                                <span className="text-xs text-gray-500">Đang tải...</span>
                              )}
                            </div>
                            
                            {lessonTests[lesson.lessonId] ? (
                              <div className="flex flex-col gap-2">
                                <div className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${
                                  lessonTests[lesson.lessonId]?.testType === TestType.WrittenManual 
                                    ? 'bg-purple-50 border-purple-200' 
                                    : 'bg-blue-50 border-blue-200'
                                }`}>
                                  <div className="flex items-center gap-2 flex-1">
                                    {isTestPassed(lessonTests[lesson.lessonId]!.testId) ? (
                                      <FiCheckCircle className="text-green-600" />
                                    ) : lessonTests[lesson.lessonId]?.testType === TestType.WrittenManual ? (
                                      <FaPen className="text-purple-600" />
                                    ) : (
                                      <FaEdit className="text-blue-600" />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800 block">
                                          {lessonTests[lesson.lessonId]?.title}
                                        </span>
                                        {lessonTests[lesson.lessonId]?.testType === TestType.WrittenManual && (
                                          <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-0.5 rounded">
                                            Viết
                                          </span>
                                        )}
                                        {isTestPassed(lessonTests[lesson.lessonId]!.testId) && (
                                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded">
                                            Đã pass ✓
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {lessonTests[lesson.lessonId]?.description}
                                      </span>

                                    </div>
                                  </div>

                                </div>
                                {lessonTests[lesson.lessonId] && (
                                  <>
                                    {isTestPassed(lessonTests[lesson.lessonId]!.testId) ? (
                                      <button
                                        onClick={() => {
                                          if (courseExpired) {
                                            warning('Khóa học đã hết hạn. Bạn không thể thực hiện các bài kiểm tra.');
                                            return;
                                          }
                                          handleStartTest(lessonTests[lesson.lessonId]!);
                                        }}
                                        disabled={courseExpired}
                                        className={`w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg transition-colors ${
                                          courseExpired 
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                      >
                                        <FaEdit />
                                        {courseExpired ? 'Khóa học đã hết hạn' : 'Làm lại bài test'}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (courseExpired) {
                                            warning('Khóa học đã hết hạn. Bạn không thể thực hiện các bài kiểm tra.');
                                            return;
                                          }
                                          handleStartTest(lessonTests[lesson.lessonId]!);
                                        }}
                                        disabled={courseExpired}
                                        className={`w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg transition-colors ${
                                          courseExpired 
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                      >
                                        <FaEdit />
                                        {courseExpired ? 'Khóa học đã hết hạn' : 'Làm bài test'}
                                      </button>
                                    )}
                                    
                                    {courseExpired && (
                                      <div className="text-center py-1 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                                        <div className="text-yellow-800 text-xs">
                                          ⚠️ Đã hết hạn vào {dayjs(course?.endDate).format('DD/MM/YYYY')}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : loadingTests[lesson.lessonId] ? (
                              <div className="text-xs text-gray-500 p-2">
                                Đang tải bài kiểm tra...
                              </div>
                            ) : (
                              // Hiển thị nút test mặc định nếu không có test được load
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => {
                                    if (courseExpired) {
                                      warning('Khóa học đã hết hạn. Bạn không thể thực hiện các bài kiểm tra.');
                                      return;
                                    }
                                    // Thử load lại test nếu chưa có
                                    if (!lessonTests[lesson.lessonId] && !loadingTests[lesson.lessonId]) {
                                      loadLessonTest(lesson.lessonId);
                                    }
                                  }}
                                  disabled={courseExpired}
                                  className={`w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg transition-colors ${
                                    courseExpired 
                                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  <FaEdit />
                                  {courseExpired ? 'Khóa học đã hết hạn' : 'Kiểm tra bài test'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Documents */}
                          {documents.length > 0 && (
                            <div className="border-l-2 border-green-200 pl-3">
                              <span className="text-sm font-medium text-gray-700 block mb-2">Tài liệu</span>
                              <ul className="flex flex-col gap-1">
                                {documents.filter(d => !d.fileUrl.includes("688ac2cc0012a1f4136d")).map((doc, index) => (
                                  <li key={doc.documentId} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-2 flex-1">
                                      {doc.fileUrl.endsWith(".pdf") ? <FaFilePdf className="text-red-500" /> : <FaDownload className="text-gray-500" />}
                                      <span className="text-sm text-gray-700 truncate">
                                        Tài liệu_Bài {index + 1}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => window.open(doc.fileUrl, '_blank')}
                                      className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                    >
                                      <FaDownload className="text-xs" />
                                      Tải
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default StudentLearnCoursePage; 