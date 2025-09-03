import React, { useState, useEffect } from 'react';
import { 
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiChevronRight,
  HiChevronDown,
  HiOutlineExclamationCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiPencil,
  HiPlay
} from 'react-icons/hi';
import { StudyPlanDto, StudyPlanItemDto, ItemStatus } from '../../types/StudyPlan';
import { getStudyPlansByStudentId } from '../../services/studyPlanService';
import { getStudyPlanItemsByPlan } from '../../services/studyPlanItemService';
import { getCourseById, CourseDto } from '../../services/courseService';
import { 
  getTemplateTypeSummary,
  TestTemplateTypeSummaryDto,
  getTestTemplateTypeNameById
} from '../../services/testTemplateTypeService';
import { TestType, CourseLevel } from '../../services/testService';
import JLPTTestInterface from '../JLPTTestInterface';
import StudyPlanEditor from './StudyPlanEditor';

interface StudentStudyPlansProps {
  studentId: string;
  studentName: string;
  refreshKey?: number; // Optional prop to trigger refresh
  onItemClick?: (item: StudyPlanItemDto) => void; // Optional callback for item clicks
  onTestStart?: (testId: string) => Promise<void>; // Optional callback for test start
  showActions?: boolean; // Whether to show clickable actions
  isStudentView?: boolean; // Whether this is for student view (affects styling and functionality)
}

interface StudyPlanWithItemsDisplay extends StudyPlanDto {
  items: StudyPlanItemDto[];
  expandedItems: StudyPlanItemWithDetails[];
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  isOverdue: boolean;
  daysRemaining: number;
}

interface StudyPlanItemWithDetails extends StudyPlanItemDto {
  title?: string;
  description?: string;
  courseName?: string;
  testName?: string;
}

const StudentStudyPlans: React.FC<StudentStudyPlansProps> = ({
  studentId,
  studentName,
  refreshKey,
  onItemClick,
  onTestStart,
  showActions = false,
  isStudentView = false
}) => {
  const [studyPlans, setStudyPlans] = useState<StudyPlanWithItemsDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [editingPlan, setEditingPlan] = useState<StudyPlanWithItemsDisplay | null>(null);
  
  // Test interface states
  const [selectedTest, setSelectedTest] = useState<TestTemplateTypeSummaryDto | null>(null);
  const [isInTest, setIsInTest] = useState(false);

  useEffect(() => {
    loadStudyPlans();
  }, [studentId, refreshKey]); // Add refreshKey to dependencies

  const handleStartTest = async (testId: string) => {
    if (onTestStart) {
      // Use parent callback if provided
      await onTestStart(testId);
      return;
    }

    // Default behavior for internal test handling
    try {
      // For now, we'll try to get a default test template
      // In practice, you might need to map testId to the correct level and type
      // or have a different API to get test details by testId
      
      // Try common levels - you might need to adjust this logic
      const levelsTry = [CourseLevel.N5, CourseLevel.N4, CourseLevel.N3, CourseLevel.N2, CourseLevel.N1];
      
      for (const level of levelsTry) {
        try {
          const summary = await getTemplateTypeSummary(level, TestType.JLPTAuto);
          if (summary && summary.testTemplateTypeId === testId) {
            setSelectedTest(summary);
            setIsInTest(true);
            return;
          }
        } catch {
          // Continue to next level
        }
      }
      
      // Fallback: try with first available level
      const summary = await getTemplateTypeSummary(CourseLevel.N5, TestType.JLPTAuto);
      if (summary) {
        setSelectedTest(summary);
        setIsInTest(true);
      }
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const handleBackFromTest = () => {
    setIsInTest(false);
    setSelectedTest(null);
  };

  // Helper function to get readable test name
  const getReadableTestName = (testTemplateTypeId: string, fallbackName?: string) => {
    // If we have a fallback name from API, use it
    if (fallbackName && fallbackName.trim() && !fallbackName.startsWith('Test ')) {
      return fallbackName;
    }

    // Common test template type mappings (based on actual UUIDs from your system)
    const testNameMapping: Record<string, string> = {
      // Add specific UUID mappings based on your actual data
      'a4a681bf-474a-4236-b651-6870ac496d83': 'Bài kiểm tra JLPT - Tổng hợp',
      '4bfe12c1-6a6b-4280-93ec-4f2294c018a0': 'JLPT N5 Combo - Moji, Goi, Bunpou 8 tuần',
      // Add more mappings as you discover them
    };

    // Try exact mapping first
    if (testNameMapping[testTemplateTypeId]) {
      return testNameMapping[testTemplateTypeId];
    }

    // Extract meaningful info from ID if possible (for non-UUID format)
    const lowerCaseId = testTemplateTypeId.toLowerCase();
    if (lowerCaseId.includes('n5')) {
      return 'JLPT N5 - Bài kiểm tra';
    } else if (lowerCaseId.includes('n4')) {
      return 'JLPT N4 - Bài kiểm tra';
    } else if (lowerCaseId.includes('n3')) {
      return 'JLPT N3 - Bài kiểm tra';
    } else if (lowerCaseId.includes('n2')) {
      return 'JLPT N2 - Bài kiểm tra';
    } else if (lowerCaseId.includes('n1')) {
      return 'JLPT N1 - Bài kiểm tra';
    }

    // Check if it looks like a UUID (has dashes in specific pattern)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testTemplateTypeId);
    if (isUUID) {
      return 'Bài kiểm tra JLPT'; // Generic name for unknown UUIDs
    }

    // Final fallback
    return fallbackName || 'Bài kiểm tra';
  };

  const handleItemClick = (item: StudyPlanItemDto) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Dynamic colors based on view type
  const getThemeClasses = () => {
    if (isStudentView) {
      return {
        spinner: 'border-green-500',
        button: 'bg-green-500 hover:bg-green-600',
        icon: 'text-green-500',
        percentage: 'text-green-500',
        editButton: 'hover:text-green-500 hover:bg-green-50',
        progressBar: 'bg-green-500'
      };
    } else {
      return {
        spinner: 'border-orange-500',
        button: 'bg-orange-500 hover:bg-orange-600',
        icon: 'text-orange-500',
        percentage: 'text-orange-500',
        editButton: 'hover:text-orange-500 hover:bg-orange-50',
        progressBar: 'bg-orange-500'
      };
    }
  };

  const loadStudyPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get study plans for student
      const plans = await getStudyPlansByStudentId(studentId);
      
      // For each plan, get items and their details
      const plansWithItems = await Promise.all(
        plans.map(async (plan) => {
          try {
            const items = await getStudyPlanItemsByPlan(plan.planId);
            
            // Load details for each item
            const expandedItems = await Promise.all(
              items.map(async (item) => {
                try {
                  let title = '';
                  let description = '';
                  let courseName = '';
                  let testName = '';
                  
                  // Load course details if courseId exists
                  if (item.courseId) {
                    try {
                      const course: CourseDto = await getCourseById(item.courseId);
                      courseName = course.title;
                      description = course.description; // Always use course description
                    } catch (err) {
                      console.error('Error loading course details:', err);
                      courseName = `Course ID: ${item.courseId}`;
                    }
                  }
                  
                  // Load test details if testTemplateTypeId exists
                  if (item.testTemplateTypeId) {
                    try {
                      console.log('Loading test name for ID:', item.testTemplateTypeId);
                      
                      // First try to get name by ID
                      let testName_temp = await getTestTemplateTypeNameById(item.testTemplateTypeId);
                      console.log('Retrieved test name from ID lookup:', testName_temp);
                      
                      // If that fails, try to get it from template summary
                      if (!testName_temp) {
                        console.log('ID lookup failed, trying template summary approach...');
                        const levelsTry = [CourseLevel.N5, CourseLevel.N4, CourseLevel.N3, CourseLevel.N2, CourseLevel.N1];
                        
                        for (const level of levelsTry) {
                          try {
                            const summary = await getTemplateTypeSummary(level, TestType.JLPTAuto);
                            if (summary && summary.testTemplateTypeId === item.testTemplateTypeId) {
                              testName_temp = summary.typeName;
                              console.log('Found test name from summary:', testName_temp);
                              break;
                            }
                          } catch {
                            // Continue to next level
                          }
                        }
                      }
                      
                      testName = getReadableTestName(item.testTemplateTypeId, testName_temp || undefined);
                    } catch (err) {
                      console.error('Error loading test details for ID:', item.testTemplateTypeId, err);
                      testName = getReadableTestName(item.testTemplateTypeId);
                    }
                  }
                  
                  // Build title based on what's available
                  if (courseName && testName) {
                    title = `${courseName} + ${testName}`;
                  } else if (courseName) {
                    title = courseName;
                  } else if (testName) {
                    title = testName;
                  } else {
                    title = item.itemType === 'course' ? 'Khóa học' : 'Bài test';
                  }
                  
                  // Set description if not already set
                  if (!description) {
                    if (courseName && testName) {
                      description = 'Bao gồm khóa học và bài kiểm tra';
                    } else if (testName) {
                      description = 'Bài kiểm tra';
                    }
                  }
                  
                  return {
                    ...item,
                    title,
                    description,
                    courseName,
                    testName
                  } as StudyPlanItemWithDetails;
                } catch (err) {
                  console.error('Error loading item details:', err);
                  return {
                    ...item,
                    title: item.itemType === 'course' ? 'Khóa học' : 'Bài test',
                    description: 'Không thể tải thông tin chi tiết',
                    courseName: '',
                    testName: ''
                  } as StudyPlanItemWithDetails;
                }
              })
            );

            const completedItems = items.filter(item => item.status === ItemStatus.COMPLETED).length;
            const completionPercentage = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;
            
            const endDate = new Date(plan.endDate);
            const today = new Date();
            const isOverdue = endDate < today && completionPercentage < 100;
            const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return {
              ...plan,
              items,
              expandedItems,
              totalItems: items.length,
              completedItems,
              completionPercentage,
              isOverdue,
              daysRemaining
            } as StudyPlanWithItemsDisplay;
          } catch (err) {
            console.error('Error loading plan items:', err);
            return {
              ...plan,
              items: [],
              expandedItems: [],
              totalItems: 0,
              completedItems: 0,
              completionPercentage: 0,
              isOverdue: false,
              daysRemaining: 0
            } as StudyPlanWithItemsDisplay;
          }
        })
      );

      setStudyPlans(plansWithItems);
    } catch (err) {
      console.error('Error loading study plans:', err);
      setError('Hãy tạo kế hoạch học tập ngay');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlanExpansion = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const getStatusIcon = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.COMPLETED:
        return <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />;
      case ItemStatus.IN_PROGRESS:
        return <HiOutlineClock className="w-5 h-5 text-yellow-500" />;
      case ItemStatus.SKIPPED:
        return <HiOutlineExclamationCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <HiOutlineClock className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusText = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.COMPLETED:
        return 'Hoàn thành';
      case ItemStatus.IN_PROGRESS:
        return 'Đang học';
      case ItemStatus.SKIPPED:
        return 'Bỏ qua';
      default:
        return 'Chưa bắt đầu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleEditPlan = (plan: StudyPlanWithItemsDisplay) => {
    setEditingPlan(plan);
  };

  const handleSaveEdit = () => {
    setEditingPlan(null);
    loadStudyPlans(); // Refresh the plans after editing
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
  };

  const handleDeletePlan = () => {
    setEditingPlan(null);
    loadStudyPlans(); // Refresh the plans after deletion
  };

  if (isInTest && selectedTest) {
    return (
      <JLPTTestInterface
        testType={selectedTest.testType}
        courseLevel={selectedTest.courseLevel}
        onBack={handleBackFromTest}
        onLevelUpdated={() => {}} // Optional callback
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${getThemeClasses().spinner}`}></div>
          <span className="ml-3 text-gray-600">Đang tải lộ trình học...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-100">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full w-20 h-20 mx-auto opacity-20 animate-pulse"></div>
            <HiOutlineQuestionMarkCircle className="w-20 h-20 text-green-400 mx-auto mb-6 relative z-10" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Hiện tại bạn chưa có kế hoạch học tập nào
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {error}
          </p>
          
          <button
            onClick={loadStudyPlans}
            className={`px-6 py-3 ${getThemeClasses().button} text-white rounded-lg transition-all duration-200 hover:scale-105 focus:ring-4 focus:ring-opacity-50 focus:outline-none`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (studyPlans.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-100">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-24 h-24 mx-auto opacity-20 animate-pulse"></div>
            <HiOutlineAcademicCap className="w-24 h-24 text-blue-400 mx-auto mb-6 relative z-10" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Hiện bạn chưa có kế hoạch học tập nào
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
            Hãy liên hệ với giáo viên để được tạo kế hoạch học tập phù hợp với trình độ và mục tiêu của bạn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              <HiOutlineBookOpen className="w-4 h-4" />
              <span>Khóa học cá nhân hóa</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              <HiOutlineClipboardList className="w-4 h-4" />
              <span>Bài kiểm tra định kỳ</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-lg border border-blue-200 max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              💡 <strong>Mẹo:</strong> Kế hoạch học tập sẽ giúp bạn theo dõi tiến độ và đạt được mục tiêu JLPT hiệu quả hơn!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineAcademicCap className={`w-5 h-5 ${getThemeClasses().icon}`} />
        <h4 className="text-lg font-semibold text-gray-800">
          Lộ trình học hiện tại của {studentName}
        </h4>
      </div>

      {studyPlans.map((plan) => (
        <div key={plan.planId} className="bg-white border rounded-lg shadow-sm">
          {/* Plan Header */}
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => togglePlanExpansion(plan.planId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {expandedPlans.has(plan.planId) ? 
                    <HiChevronDown className="w-5 h-5 text-gray-400" /> :
                    <HiChevronRight className="w-5 h-5 text-gray-400" />
                  }
                  <div>
                    <h5 className="font-semibold text-gray-800">{plan.planName}</h5>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <HiOutlineCalendar className="w-4 h-4" />
                    <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <HiOutlineClipboardList className="w-4 h-4" />
                    <span>{plan.completedItems}/{plan.totalItems} mục hoàn thành</span>
                  </div>
                  
                  {plan.isOverdue && (
                    <div className="flex items-center gap-1 text-red-500">
                      <HiOutlineExclamationCircle className="w-4 h-4" />
                      <span>Quá hạn</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold ${getThemeClasses().percentage}`}>
                  {plan.completionPercentage}%
                </div>
                {!isStudentView && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPlan(plan);
                    }}
                    className={`p-2 text-gray-400 ${getThemeClasses().editButton} rounded-lg transition-colors`}
                    title="Chỉnh sửa lộ trình học"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="text-xs text-gray-500 text-right">
                {plan.daysRemaining > 0 ? `${plan.daysRemaining} ngày còn lại` : 
                 plan.daysRemaining === 0 ? 'Hết hạn hôm nay' : 
                 `Quá hạn ${Math.abs(plan.daysRemaining)} ngày`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getThemeClasses().progressBar} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${plan.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Plan Items (Expanded) */}
          {expandedPlans.has(plan.planId) && (
            <div className="border-t bg-gray-50">
              <div className="p-4 space-y-3">
                {plan.expandedItems.map((item) => (
                  <div key={item.itemId} className="bg-white p-3 rounded border">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {item.sequence}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {/* Course Section */}
                        {item.courseName && (
                          <div>
                            <div 
                              className={`flex items-center gap-2 ${
                                showActions && item.courseId ? 'cursor-pointer hover:bg-blue-50 rounded p-1 -m-1' : ''
                              }`}
                              onClick={showActions && item.courseId ? () => handleItemClick(item) : undefined}
                            >
                              <HiOutlineBookOpen className="w-4 h-4 text-blue-500" />
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                Khóa học
                              </span>
                              <span className={`text-sm font-medium ${
                                showActions && item.courseId ? 'text-blue-700 hover:text-blue-800' : 'text-gray-900'
                              }`}>
                                {item.courseName}
                              </span>
                              {showActions && item.courseId && (
                                <span className="text-xs text-blue-500">(Click để xem chi tiết)</span>
                              )}
                            </div>
                            {/* Course Description - right after course name */}
                            {item.description && item.courseId && (
                              <p className="text-sm text-gray-600 ml-6 mt-1">{item.description}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Test Section */}
                        {item.testName && (
                          <div 
                            className={`flex items-center gap-2 ${
                              showActions && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED ? 
                              'cursor-pointer hover:bg-green-50 rounded p-1 -m-1' : ''
                            }`}
                            onClick={showActions && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED ? 
                              () => handleStartTest(item.testTemplateTypeId!) : undefined}
                          >
                            <HiOutlineClipboardList className="w-4 h-4 text-green-500" />
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                              Bài test
                            </span>
                            <span className={`text-sm font-medium ${
                              showActions && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED ? 
                              'text-green-700 hover:text-green-800' : 'text-gray-900'
                            }`}>
                              {item.testName}
                            </span>
                            {showActions && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED && (
                              <span className="text-xs text-green-500">(Click để làm bài)</span>
                            )}
                          </div>
                        )}
                        
                        {/* Fallback display if no course or test name */}
                        {!item.courseName && !item.testName && (
                          <div>
                            <div 
                              className={`flex items-center gap-2 ${
                                showActions && ((item.itemType === 'course' && item.courseId) || 
                                (item.itemType === 'test' && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED)) ?
                                'cursor-pointer hover:bg-gray-50 rounded p-1 -m-1' : ''
                              }`}
                              onClick={showActions ? () => {
                                if (item.itemType === 'course' && item.courseId) {
                                  handleItemClick(item);
                                } else if (item.itemType === 'test' && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED) {
                                  handleStartTest(item.testTemplateTypeId!);
                                }
                              } : undefined}
                            >
                              {item.itemType === 'course' ? 
                                <HiOutlineBookOpen className="w-4 h-4 text-blue-500" /> :
                                <HiOutlineClipboardList className="w-4 h-4 text-green-500" />
                              }
                              <span className={`text-sm font-medium ${
                                showActions && ((item.itemType === 'course' && item.courseId) || 
                                (item.itemType === 'test' && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED)) ?
                                'text-blue-700 hover:text-blue-800' : 'text-gray-900'
                              }`}>
                                {item.title}
                              </span>
                              {showActions && item.itemType === 'course' && item.courseId && (
                                <span className="text-xs text-blue-500">(Click để xem chi tiết)</span>
                              )}
                              {showActions && item.itemType === 'test' && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED && (
                                <span className="text-xs text-green-500">(Click để làm bài)</span>
                              )}
                            </div>
                            {item.description && !item.courseName && (
                              <p className="text-sm text-gray-600 ml-6 mt-1">{item.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Test Action Button */}
                        {item.itemType === 'test' && item.testTemplateTypeId && item.status !== ItemStatus.COMPLETED && (
                          <button
                            onClick={() => handleStartTest(item.testTemplateTypeId!)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                            title="Làm bài test"
                          >
                            <HiPlay className="w-3 h-3" />
                            Làm bài
                          </button>
                        )}
                        
                        {getStatusIcon(item.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Study Plan Editor Modal */}
      {editingPlan && (
        <StudyPlanEditor
          studyPlan={editingPlan}
          studyPlanItems={editingPlan.items}
          studentId={studentId}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onDelete={handleDeletePlan}
        />
      )}
    </div>
  );
};

export default StudentStudyPlans;
