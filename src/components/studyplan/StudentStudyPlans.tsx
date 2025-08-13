import React, { useState, useEffect } from 'react';
import { 
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiChevronRight,
  HiChevronDown,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiPencil
} from 'react-icons/hi';
import { StudyPlanDto, StudyPlanItemDto, ItemStatus } from '../../types/StudyPlan';
import { getStudyPlansByStudentId } from '../../services/studyPlanService';
import { getStudyPlanItemsByPlan } from '../../services/studyPlanItemService';
import { getCourseById, CourseDto } from '../../services/courseService';
import StudyPlanEditor from './StudyPlanEditor';

interface StudentStudyPlansProps {
  studentId: string;
  studentName: string;
  refreshKey?: number; // Optional prop to trigger refresh
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
}

const StudentStudyPlans: React.FC<StudentStudyPlansProps> = ({
  studentId,
  studentName,
  refreshKey
}) => {
  const [studyPlans, setStudyPlans] = useState<StudyPlanWithItemsDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [editingPlan, setEditingPlan] = useState<StudyPlanWithItemsDisplay | null>(null);

  useEffect(() => {
    loadStudyPlans();
  }, [studentId, refreshKey]); // Add refreshKey to dependencies

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
                  
                  if (item.itemType === 'course' && item.courseId) {
                    const course: CourseDto = await getCourseById(item.courseId);
                    title = course.title;
                    description = course.description;
                  } else if (item.itemType === 'test' && item.testId) {
                    // For test, we might need to use a different service
                    // depending on your API structure
                    title = `Bài test (ID: ${item.testId})`;
                    description = 'Bài kiểm tra';
                  }
                  
                  return {
                    ...item,
                    title,
                    description
                  } as StudyPlanItemWithDetails;
                } catch (err) {
                  console.error('Error loading item details:', err);
                  return {
                    ...item,
                    title: item.itemType === 'course' ? 'Khóa học' : 'Bài test',
                    description: 'Không thể tải thông tin chi tiết'
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
      setError('Không thể tải lộ trình học của học viên');
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Đang tải lộ trình học...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <HiOutlineExclamationCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadStudyPlans}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (studyPlans.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <HiOutlineAcademicCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            Chưa có lộ trình học
          </h4>
          <p className="text-gray-500">
            {studentName} chưa có lộ trình học nào được tạo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineAcademicCap className="w-5 h-5 text-orange-500" />
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
                <div className="text-2xl font-bold text-orange-500">
                  {plan.completionPercentage}%
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPlan(plan);
                  }}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Chỉnh sửa lộ trình học"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
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
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
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
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {item.sequence}
                      </div>
                      
                      <div className="flex-shrink-0">
                        {item.itemType === 'course' ? 
                          <HiOutlineBookOpen className="w-5 h-5 text-blue-500" /> :
                          <HiOutlineClipboardList className="w-5 h-5 text-green-500" />
                        }
                      </div>
                      
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-800">{item.title}</h6>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
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
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onDelete={handleDeletePlan}
        />
      )}
    </div>
  );
};

export default StudentStudyPlans;
