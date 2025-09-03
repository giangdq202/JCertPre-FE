import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiX, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineEye, HiPlus } from 'react-icons/hi';
import StudyPlanCreator from './StudyPlanCreator';
import StudentStudyPlans from './StudentStudyPlans';
import { getPersonalCoursesList, CourseDto, CourseLevel } from '../../services/courseService';
import paths from '../../routes/path';

interface ChatStudyPlanSplitViewProps {
  // Chat components
  chatHeader: React.ReactNode;
  chatMessages: React.ReactNode;
  chatInput: React.ReactNode;
  
  // Study plan props
  studentId: string;
  studentName: string;
  studentEmail: string;
  onClose: () => void;
  onStudyPlanCreated?: (studyPlanId: string) => void;
}

const ChatStudyPlanSplitView: React.FC<ChatStudyPlanSplitViewProps> = ({
  chatHeader,
  chatMessages,
  chatInput,
  studentId,
  studentName,
  studentEmail,
  onClose,
  onStudyPlanCreated
}) => {
  const navigate = useNavigate();
  const [personalCourses, setPersonalCourses] = useState<CourseDto[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [refreshStudyPlans, setRefreshStudyPlans] = useState(0);

  useEffect(() => {
    if (studentId) {
      fetchPersonalCourses();
    }
  }, [studentId]);

  const fetchPersonalCourses = async () => {
    try {
      setLoadingCourses(true);
      const coursesData = await getPersonalCoursesList(studentId);
      setPersonalCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching personal courses:', error);
      setPersonalCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(paths.course_detail.replace(':courseId', courseId));
  };

  const handleCreateCourse = () => {
    // Navigate to create course page with courseType=Personal and prefilled email
    const params = new URLSearchParams({
      courseType: 'Personal',
      userEmail: studentEmail
    });
    navigate(`${paths.create_course}?${params.toString()}`);
  };

  const handleStudyPlanCreated = (studyPlanId: string) => {
    // Trigger refresh of study plans
    setRefreshStudyPlans(prev => prev + 1);
    // Call parent callback if provided
    if (onStudyPlanCreated) {
      onStudyPlanCreated(studyPlanId);
    }
  };

  const getLevelBadgeColor = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.N1:
        return 'bg-red-100 text-red-800';
      case CourseLevel.N2:
        return 'bg-orange-100 text-orange-800';
      case CourseLevel.N3:
        return 'bg-yellow-100 text-yellow-800';
      case CourseLevel.N4:
        return 'bg-blue-100 text-blue-800';
      case CourseLevel.N5:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Section - Left Half */}
      <div className="w-1/2 bg-white border-r border-gray-200 relative">
        {/* Fixed Chat Header cho phần chat */}
        <div className="fixed top-16 left-64 z-10 bg-white border-b border-gray-200" style={{ width: 'calc(50vw - 8rem)' }}>
          {chatHeader}
        </div>
        
        {/* Messages - Scrollable area */}
        <div className="pt-20 pb-32 overflow-y-auto h-full">
          {chatMessages}
        </div>
        
        {/* Fixed Chat Input cho phần chat */}
        <div className="fixed bottom-0 left-64 z-10 bg-white border-t border-gray-200" style={{ width: 'calc(50vw - 8rem)' }}>
          {chatInput}
        </div>
      </div>

      {/* Study Plan Section - Right Half */}
      <div className="w-1/2 bg-gray-50 relative">
        {/* Study Plan Header - Fixed cho phần study plan với height giống ChatHeader */}
        <div className="fixed top-16 z-10 bg-white border-b border-gray-200" style={{ left: 'calc(50vw + 8rem)', width: 'calc(50vw - 8rem)' }}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineAcademicCap className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-gray-800">
                  Thiết kế lộ trình học
                </h3>
                <p className="text-sm text-gray-500">
                  Tạo kế hoạch học tập cho {studentName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đóng chế độ thiết kế lộ trình"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Study Plan Content - Scrollable */}
        <div className="pt-20 px-4 pb-4 overflow-y-auto h-full">
          <StudyPlanCreator
            studentId={studentId}
            studentName={studentName}
            onStudyPlanCreated={handleStudyPlanCreated}
          />

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Current Study Plans Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <HiOutlineAcademicCap className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-800">Lộ trình học hiện tại</h3>
            </div>
            
            <StudentStudyPlans
              studentId={studentId}
              studentName={studentName}
              refreshKey={refreshStudyPlans}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Personal Courses Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <HiOutlineBookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Khóa học cá nhân</h3>
              </div>
              <button
                onClick={handleCreateCourse}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                title="Tạo khóa học cá nhân cho học viên"
              >
                <HiPlus className="w-4 h-4" />
                Tạo khóa học
              </button>
            </div>
            
            {loadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Đang tải khóa học...</span>
              </div>
            ) : personalCourses.length > 0 ? (
              <div className="space-y-3">
                {personalCourses.map((course) => (
                  <div
                    key={course.courseId}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCourseClick(course.courseId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 overflow-hidden"
                           style={{
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical'
                           }}>
                          {course.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                            N{5 - course.level}
                          </span>
                          <span className="text-sm text-gray-500">
                            {course.lessonsCount} bài học
                          </span>
                          {course.livestreamsCount > 0 && (
                            <span className="text-sm text-gray-500">
                              • {course.livestreamsCount} buổi livestream
                            </span>
                          )}
                        </div>
                      </div>
                      <HiOutlineEye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-16 h-16 mx-auto opacity-20 animate-pulse"></div>
                    <HiOutlineBookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4 relative z-10" />
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Chưa có khóa học cá nhân
                  </h4>
                  <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    Tạo khóa học cá nhân để {studentName} có thể học tập theo lộ trình riêng.
                  </p>
                  
                  <button
                    onClick={handleCreateCourse}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <HiPlus className="w-4 h-4" />
                    Tạo khóa học đầu tiên
                  </button>
                  
                  <div className="mt-4 text-xs text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 inline-block">
                    💡 Khóa học cá nhân giúp tùy chỉnh nội dung phù hợp với từng học viên
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatStudyPlanSplitView;
