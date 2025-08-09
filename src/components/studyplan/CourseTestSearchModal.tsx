import React, { useState, useEffect, useMemo } from 'react';
import { 
  HiX, 
  HiSearch, 
  HiOutlineBookOpen, 
  HiOutlineClipboardList
} from 'react-icons/hi';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { useAuth } from '../../auth/AuthContext';
import { 
  getCourses, 
  CourseListDto, 
  CourseStatus, 
  CourseType, 
  CourseLevel as CourseLevelEnum 
} from '../../services/courseService';
import { 
  getAllByUserId, 
  TestDto, 
  TestType, 
  CourseLevel as TestCourseLevelEnum 
} from '../../services/testService';

interface CourseTestSearchModalProps {
  type: 'course' | 'test';
  onSelect: (item: CourseListDto | TestDto) => void;
  onClose: () => void;
}

const CourseTestSearchModal: React.FC<CourseTestSearchModalProps> = ({
  type,
  onSelect,
  onClose
}) => {
  const { userInfo } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Course data
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  
  // Test data
  const [tests, setTests] = useState<TestDto[]>([]);

  // Load data based on type
  useEffect(() => {
    if (type === 'course') {
      loadCourses();
    } else {
      loadTests();
    }
  }, [type]);

  const loadCourses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getCourses({
        pageNumber: 1,
        pageSize: 100,
        status: CourseStatus.Published,
        courseType: CourseType.Public
      });
      setCourses(response.items);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Không thể tải danh sách khóa học');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTests = async () => {
    if (!userInfo?.id) {
      setError('Không thể xác định thông tin người dùng');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await getAllByUserId({
        userId: userInfo.id,
        pageSize: 100
      });
      setTests(response.items);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Không thể tải danh sách bài test');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getCourseLevelString = (level: CourseLevelEnum): string => {
    const levelMap = {
      [CourseLevelEnum.N5]: "N5",
      [CourseLevelEnum.N4]: "N4", 
      [CourseLevelEnum.N3]: "N3",
      [CourseLevelEnum.N2]: "N2",
      [CourseLevelEnum.N1]: "N1"
    };
    return levelMap[level] || "N5";
  };

  const getTestLevelString = (level: TestCourseLevelEnum): string => {
    const levelMap = {
      [TestCourseLevelEnum.N5]: "N5",
      [TestCourseLevelEnum.N4]: "N4",
      [TestCourseLevelEnum.N3]: "N3", 
      [TestCourseLevelEnum.N2]: "N2",
      [TestCourseLevelEnum.N1]: "N1"
    };
    return levelMap[level] || "N5";
  };

  const getTestTypeString = (testType: TestType): string => {
    switch (testType) {
      case TestType.JLPTAuto:
        return 'JLPT Auto';
      case TestType.EntryAuto:
        return 'Entry Auto';
      case TestType.CustomManual:
        return 'Custom Manual';
      case TestType.CustomAuto:
        return 'Custom Auto';
      default:
        return 'Unknown';
    }
  };

  // Filter data based on search and level
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = !selectedLevel || 
        getCourseLevelString(course.level) === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, selectedLevel]);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = !searchTerm ||
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = !selectedLevel ||
        getTestLevelString(test.courseLevel) === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [tests, searchTerm, selectedLevel]);

  const handleItemClick = (item: CourseListDto | TestDto) => {
    onSelect(item);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {type === 'course' ? (
              <HiOutlineBookOpen className="w-6 h-6 text-blue-500" />
            ) : (
              <HiOutlineClipboardList className="w-6 h-6 text-green-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-800">
              Chọn {type === 'course' ? 'khóa học' : 'bài test'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Tìm kiếm ${type === 'course' ? 'khóa học' : 'bài test'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Tất cả cấp độ</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-red-500">
              <HiExclamationTriangle className="w-6 h-6 mr-2" />
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {type === 'course' ? (
                filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div
                      key={course.courseId}
                      onClick={() => handleItemClick(course)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {course.thumbnailUrl && (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {getCourseLevelString(course.level)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Giá: {course.price.toLocaleString()} VND</span>
                            <span>Học viên: {course.enrollmentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <HiOutlineBookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Không tìm thấy khóa học nào</p>
                  </div>
                )
              ) : (
                filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <div
                      key={test.testId}
                      onClick={() => handleItemClick(test)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{test.title}</h4>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              {getTestLevelString(test.courseLevel)}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {getTestTypeString(test.testType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {test.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Thời gian: {test.durationMinutes} phút</span>
                            <span>Số lần làm tối đa: {test.maxAttempts}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <HiOutlineClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Không tìm thấy bài test nào</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Nhấn vào {type === 'course' ? 'khóa học' : 'bài test'} để chọn
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseTestSearchModal;
