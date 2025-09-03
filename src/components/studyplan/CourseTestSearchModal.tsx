import React, { useState, useEffect, useMemo } from 'react';
import { 
  HiX, 
  HiSearch, 
  HiOutlineBookOpen, 
  HiOutlineClipboardList
} from 'react-icons/hi';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { 
  getCourses, 
  CourseListDto, 
  CourseStatus, 
  CourseType, 
  CourseLevel as CourseLevelEnum,
  getPersonalCoursesList
} from '../../services/courseService';
import { 
  TestType, 
  CourseLevel as TestCourseLevelEnum 
} from '../../services/testService';
import { 
  getAllTestTemplateTypes, 
  TestTemplateTypeDto 
} from '../../services/testTemplateTypeService';
import { 
  getAllByTypeId as getTemplatesByTypeId, 
  TestTemplateDto 
} from '../../services/testTemplateService';
import { 
  getAllByTemplateId as getConfigsByTemplateId, 
  TestTemplateConfigDto 
} from '../../services/testTemplateConfigService';

// Define a unified test option interface for search modal
export interface TestOption {
  testId: string; // This will be used for study plan creation
  title: string; // e.g., "JLPT N4"
  description?: string;
  testType: TestType;
  courseLevel: TestCourseLevelEnum;
  durationMinutes: number;
  maxAttempts: number;
  // Additional metadata
  testTemplateTypeId: string; // For reference
  testTemplateId?: string; // Optional template ID
}

interface CourseTestSearchModalProps {
  type: 'course' | 'test';
  onSelect: (item: CourseListDto | TestOption) => void;
  onClose: () => void;
  studentId?: string; // Add studentId to fetch personal courses
}

const CourseTestSearchModal: React.FC<CourseTestSearchModalProps> = ({
  type,
  onSelect,
  onClose,
  studentId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Course data
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  
  // Test data
  const [tests, setTests] = useState<TestOption[]>([]);

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
      // Load public courses
      const publicCoursesResponse = await getCourses({
        pageNumber: 1,
        pageSize: 100,
        status: CourseStatus.Published,
        courseType: CourseType.Public
      });
      
      let allCourses = publicCoursesResponse.items;
      
      // Load personal courses if studentId is provided
      if (studentId) {
        try {
          const personalCourses = await getPersonalCoursesList(studentId);
          // Convert CourseDto[] to CourseListDto[] format
          const personalCoursesListDto: CourseListDto[] = personalCourses.map(course => ({
            courseId: course.courseId,
            title: `[Cá nhân] ${course.title}`, // Mark as personal course
            description: course.description,
            level: course.level,
            courseType: course.courseType,
            price: course.price,
            thumbnailUrl: course.thumbnailUrl,
            status: course.status,
            createdAt: course.createdAt,
            startDate: course.startDate,
            endDate: course.endDate,
            enrollmentsCount: course.enrollmentsCount,
            instructorsCount: course.instructors?.length || 0
          }));
          
          // Combine public and personal courses
          allCourses = [...publicCoursesResponse.items, ...personalCoursesListDto];
        } catch (personalCoursesError) {
          console.error('Error loading personal courses:', personalCoursesError);
          // Continue with just public courses if personal courses fail
        }
      }
      
      setCourses(allCourses);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Không thể tải danh sách khóa học');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTests = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch active template types for JLPTAuto and EntryAuto
      const [jlptTypes, entryTypes] = await Promise.all([
        getAllTestTemplateTypes({ type: TestType.JLPTAuto, isActive: true, pageSize: 100 }),
        getAllTestTemplateTypes({ type: TestType.EntryAuto, isActive: true, pageSize: 100 })
      ]);

      const allTypes: TestTemplateTypeDto[] = [
        ...jlptTypes.items,
        ...entryTypes.items
      ];

      const testOptions: TestOption[] = [];

      // For each type, load templates and ensure type has at least one template with configs
      for (const type of allTypes) {
        const templates: TestTemplateDto[] = await getTemplatesByTypeId(type.testTemplateTypeId);
        
        // Filter templates that have configs
        const validTemplates: TestTemplateDto[] = [];
        for (const template of templates) {
          const configs: TestTemplateConfigDto[] = await getConfigsByTemplateId(template.templateId);
          if (configs && configs.length > 0) {
            validTemplates.push(template);
          }
        }
        
        // Only add option if there are valid templates
        if (validTemplates.length > 0) {
          // Calculate average duration from all valid templates
          const avgDuration = validTemplates.reduce((sum, template) => 
            sum + (template.durationMinutes || 0), 0) / validTemplates.length;
          
          // Use the first valid template's ID as the testId
          const firstTemplate = validTemplates[0];
          
          // Try both testTemplateTypeId and testTemplateId approaches
          // You can comment/uncomment based on what your backend expects
          
          testOptions.push({
            // Option 1: Use testTemplateTypeId (for referencing test type)
            testId: type.testTemplateTypeId,
            
            // Option 2: Use testTemplateId (for specific template instance)
            // testId: firstTemplate.templateId,
            
            title: type.typeName, // Just the type name, e.g., "JLPT N4"
            description: '', // TestTemplateType không có description field
            testType: type.testType as TestType,
            courseLevel: type.courseLevel as TestCourseLevelEnum,
            durationMinutes: Math.round(avgDuration),
            maxAttempts: 3, // Default max attempts
            testTemplateTypeId: type.testTemplateTypeId, // For reference
            testTemplateId: firstTemplate.templateId // The actual template ID
          });
        }
      }

      setTests(testOptions);
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
        (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = !selectedLevel ||
        getTestLevelString(test.courseLevel) === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [tests, searchTerm, selectedLevel]);

  const handleItemClick = (item: CourseListDto | TestOption) => {
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
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="text-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-16 h-16 mx-auto opacity-20 animate-pulse"></div>
                        <HiOutlineBookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4 relative z-10" />
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Không tìm thấy khóa học
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Thử thay đổi từ khóa tìm kiếm hoặc chọn cấp độ khác.
                      </p>
                      
                      <div className="text-xs text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 inline-block">
                        💡 Hãy thử tìm kiếm với từ khóa khác
                      </div>
                    </div>
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
                          {test.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {test.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Thời gian: {test.durationMinutes} phút</span>
                            <span>Số lần làm tối đa: {test.maxAttempts}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="text-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full w-16 h-16 mx-auto opacity-20 animate-pulse"></div>
                        <HiOutlineClipboardList className="w-16 h-16 text-green-400 mx-auto mb-4 relative z-10" />
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Không tìm thấy bài test
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Thử thay đổi từ khóa tìm kiếm hoặc chọn loại test khác.
                      </p>
                      
                      <div className="text-xs text-gray-500 bg-green-50 px-4 py-2 rounded-lg border border-green-100 inline-block">
                        💡 Kiểm tra lại bộ lọc và từ khóa tìm kiếm
                      </div>
                    </div>
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
