import React, { useState, useEffect } from 'react';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useAuth } from '../auth/AuthContext';
import { FiCheckCircle, FiCircle, FiPlay, FiPause } from 'react-icons/fi';

interface LessonProgressTrackerProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  onProgressUpdate?: (completionRate: number) => void;
}

export const LessonProgressTracker: React.FC<LessonProgressTrackerProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  onProgressUpdate,
}) => {
  const { isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    getProgressByUserAndLesson,
    getLessonCompletionRate,
    markLessonCompleted,
    updateLessonProgressRate,
  } = useLessonProgress();

  const [completionRate, setCompletionRate] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load initial progress
  useEffect(() => {
    if (authLoading) return; // Don't load progress while auth is loading
    
    const loadProgress = async () => {
      try {
        const rate = await getLessonCompletionRate(lessonId);
        setCompletionRate(rate);
        setIsCompleted(rate >= 100);
      } catch (error) {
        console.error('Failed to load lesson progress:', error);
      }
    };

    loadProgress();
  }, [lessonId, getLessonCompletionRate, authLoading]);

  const handleMarkCompleted = async () => {
    try {
      await markLessonCompleted(lessonId, courseId);
      setCompletionRate(100);
      setIsCompleted(true);
      onProgressUpdate?.(100);
    } catch (error) {
      console.error('Failed to mark lesson as completed:', error);
    }
  };

  const handleUpdateProgress = async (newRate: number) => {
    try {
      await updateLessonProgressRate(lessonId, courseId, newRate);
      setCompletionRate(newRate);
      setIsCompleted(newRate >= 100);
      onProgressUpdate?.(newRate);
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
    }
  };

  const getProgressColor = () => {
    if (completionRate >= 100) return 'text-green-600';
    if (completionRate >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressBgColor = () => {
    if (completionRate >= 100) return 'bg-green-500';
    if (completionRate >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <FiCircle className="h-6 w-6 text-gray-400" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{lessonTitle}</h3>
            <p className="text-sm text-gray-500">
              {isCompleted ? 'Hoàn thành' : 'Đang học'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold ${getProgressColor()}`}>
            {Math.round(completionRate)}%
          </div>
          <div className="text-xs text-gray-500">Tiến độ</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor()}`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Progress Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleUpdateProgress(Math.max(0, completionRate - 10))}
          disabled={loading || completionRate <= 0}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -10%
        </button>

        <button
          onClick={() => handleUpdateProgress(Math.min(100, completionRate + 10))}
          disabled={loading || completionRate >= 100}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +10%
        </button>

        <button
          onClick={handleMarkCompleted}
          disabled={loading || isCompleted}
          className="px-4 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <FiCheckCircle className="h-4 w-4" />
          Hoàn thành
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Đang cập nhật...</span>
        </div>
      )}
    </div>
  );
};

// Course Progress Summary Component
interface CourseProgressSummaryProps {
  courseId: string;
  totalLessons: number;
}

export const CourseProgressSummary: React.FC<CourseProgressSummaryProps> = ({
  courseId,
  totalLessons,
}) => {
  const { isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    getProgressByUserAndCourse,
    getCourseCompletionRate,
  } = useLessonProgress();

  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    if (authLoading) return; // Don't load progress while auth is loading
    
    const loadCourseProgress = async () => {
      try {
        const [completionRate, progressList] = await Promise.all([
          getCourseCompletionRate(courseId),
          getProgressByUserAndCourse(courseId),
        ]);

        setCourseProgress(completionRate);
        const completed = progressList.filter(p => p.completionRate >= 100).length;
        setCompletedLessons(completed);
      } catch (error) {
        console.error('Failed to load course progress:', error);
      }
    };

    loadCourseProgress();
  }, [courseId, getCourseCompletionRate, getProgressByUserAndCourse, authLoading]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Tổng quan khóa học</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(courseProgress)}%
          </div>
          <div className="text-sm text-gray-500">Tiến độ tổng thể</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedLessons}/{totalLessons}
          </div>
          <div className="text-sm text-gray-500">Bài học hoàn thành</div>
        </div>
      </div>

      {/* Course Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${courseProgress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mt-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
        </div>
      )}
    </div>
  );
}; 