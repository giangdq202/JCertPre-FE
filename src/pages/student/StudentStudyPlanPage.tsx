import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight, FaBook, FaPlay } from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import { IoIosTime } from "react-icons/io";
import { toast } from "react-toastify";
import { getStudyPlansByStudentId } from "../../services/studyPlanService";
import { getStudyPlanItemsByPlan } from "../../services/studyPlanItemService";
import { getCourseById } from "../../services/courseService";
import { useAuth } from "../../auth/AuthContext";
import { StudyPlanDto, StudyPlanItemDto, ItemStatus } from "../../types/StudyPlan";

interface StudyPlanItemWithDetails extends StudyPlanItemDto {
  courseTitle?: string;
  testTitle?: string;
}

interface StudyPlanWithItems extends StudyPlanDto {
  items: StudyPlanItemWithDetails[];
}

const StudentStudyPlanPage: React.FC = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [studyPlans, setStudyPlans] = useState<StudyPlanWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (userInfo?.id) {
      loadStudyPlans();
    }
  }, [userInfo?.id]);

  const loadStudyPlans = async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const plans = await getStudyPlansByStudentId(userInfo.id);
      
      // Load items for each plan
      const plansWithItems = await Promise.all(
        plans.map(async (plan: StudyPlanDto) => {
          try {
            const items = await getStudyPlanItemsByPlan(plan.planId);
            
            // Load course/test details for each item
            const itemsWithDetails = await Promise.all(
              items.map(async (item: StudyPlanItemDto) => {
                const itemWithDetails: StudyPlanItemWithDetails = { ...item };
                
                try {
                  if (item.courseId) {
                    const course = await getCourseById(item.courseId);
                    itemWithDetails.courseTitle = course.title;
                  }
                  // Note: Test title loading would need test service
                  if (item.testTemplateTypeId) {
                    itemWithDetails.testTitle = `Test ID: ${item.testTemplateTypeId}`;
                  }
                } catch (error) {
                  console.error(`Error loading details for item ${item.itemId}:`, error);
                  // Keep default titles if API call fails
                  if (item.courseId) {
                    itemWithDetails.courseTitle = `Course ID: ${item.courseId}`;
                  }
                  if (item.testTemplateTypeId) {
                    itemWithDetails.testTitle = `Test ID: ${item.testTemplateTypeId}`;
                  }
                }
                
                return itemWithDetails;
              })
            );
            
            return { ...plan, items: itemsWithDetails };
          } catch (error) {
            console.error(`Error loading items for plan ${plan.planId}:`, error);
            return { ...plan, items: [] };
          }
        })
      );

      setStudyPlans(plansWithItems);
    } catch (error) {
      console.error("Error loading study plans:", error);
      toast.error("Không thể tải kế hoạch học tập");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (items: StudyPlanItemWithDetails[]) => {
    if (items.length === 0) return 0;
    const completedItems = items.filter(item => item.status === ItemStatus.COMPLETED).length;
    return (completedItems / items.length) * 100;
  };

  const handleItemClick = (item: StudyPlanItemWithDetails) => {
    if (item.courseId) {
      navigate(`/student/course-detail/${item.courseId}`);
    } else if (item.testTemplateTypeId) {
      // Navigate to test page if needed
      toast.info("Tính năng thi thử sẽ có sớm");
    }
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải kế hoạch học tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kế hoạch học tập của tôi
          </h1>
          <p className="text-gray-600">
            Theo dõi tiến độ học tập và hoàn thành các mục tiêu đã đề ra
          </p>
        </div>

        {/* Study Plans */}
        {studyPlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MdSchool className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có kế hoạch học tập
            </h3>
            <p className="text-gray-500">
              Bạn chưa có kế hoạch học tập nào. Hãy liên hệ với giáo viên để được tạo kế hoạch học tập phù hợp.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {studyPlans.map((plan) => {
              const progress = calculateProgress(plan.items);
              const isExpanded = expandedPlan === plan.planId;

              return (
                <div key={plan.planId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Plan Header */}
                  <div
                    className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => togglePlanExpansion(plan.planId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {isExpanded ? (
                            <FaChevronDown className="text-green-500" />
                          ) : (
                            <FaChevronRight className="text-gray-400" />
                          )}
                          <h3 className="text-xl font-semibold text-gray-900">
                            {plan.planName}
                          </h3>
                        </div>
                        {plan.description && (
                          <p className="text-gray-600 mb-3">{plan.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <IoIosTime />
                            Từ {new Date(plan.startDate).toLocaleDateString('vi-VN')} đến {new Date(plan.endDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span>{plan.items.length} mục</span>
                          <span className="text-green-600 font-medium">
                            {progress.toFixed(0)}% hoàn thành
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Items */}
                  {isExpanded && (
                    <div className="p-6">
                      {plan.items.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Kế hoạch này chưa có nội dung
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {plan.items.map((item: StudyPlanItemWithDetails) => (
                            <div
                              key={item.itemId}
                              className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                item.status === ItemStatus.COMPLETED
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50"
                              }`}
                              onClick={() => handleItemClick(item)}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  item.status === ItemStatus.COMPLETED
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}>
                                  {item.sequence}
                                </div>

                                <div className="flex items-center gap-3 flex-1">
                                  {item.courseId ? (
                                    <FaBook className="text-blue-500" />
                                  ) : (
                                    <FaPlay className="text-purple-500" />
                                  )}
                                  
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {item.courseTitle || item.testTitle || (item.courseId ? 'Khóa học' : 'Bài kiểm tra')}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {item.courseId ? 'Khóa học' : 'Bài kiểm tra'}
                                    </p>
                                  </div>
                                </div>

                                {item.status === ItemStatus.COMPLETED && (
                                  <div className="text-sm text-green-600">
                                    ✓ Hoàn thành
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentStudyPlanPage;
