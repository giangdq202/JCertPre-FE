import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiX, HiOutlineAcademicCap, HiRefresh } from 'react-icons/hi';
import StudentStudyPlans from './StudentStudyPlans';
import { StudyPlanItemDto } from '../../types/StudyPlan';
import { 
  getTemplateTypeSummary,
  TestTemplateTypeSummaryDto
} from '../../services/testTemplateTypeService';
import { TestType, CourseLevel } from '../../services/testService';
import JLPTTestInterface from '../JLPTTestInterface';
import paths from '../../routes/path';

interface StudentChatStudyPlanViewProps {
  // Chat components
  chatHeader: React.ReactNode;
  chatMessages: React.ReactNode;
  chatInput: React.ReactNode;
  
  // Study plan props
  studentId: string;
  studentName: string;
  onClose: () => void;
}

const StudentChatStudyPlanView: React.FC<StudentChatStudyPlanViewProps> = ({
  chatHeader,
  chatMessages,
  chatInput,
  studentId,
  studentName,
  onClose
}) => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Test interface states
  const [selectedTest, setSelectedTest] = useState<TestTemplateTypeSummaryDto | null>(null);
  const [isInTest, setIsInTest] = useState(false);

  const handleStartTest = async (testId: string) => {
    try {
      // Try common levels to find the test
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

  const handleRefreshStudyPlans = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStudyPlanItemClick = (item: StudyPlanItemDto) => {
    if (item.courseId) {
      // Navigate to course detail page
      navigate(paths.student_course_detail.replace(':courseId', item.courseId));
    } else if (item.testTemplateTypeId) {
      // Start test
      handleStartTest(item.testTemplateTypeId);
    }
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

  return (
    <div className="flex h-full">
      {/* Chat Section - Left Half */}
      <div className="w-1/2 bg-white border-r border-gray-200 relative">
        {/* Fixed Chat Header cho phần chat */}
        <div className="fixed top-0 left-64 z-10 bg-white border-b border-gray-200" style={{ width: 'calc(50vw - 8rem)' }}>
          {chatHeader}
        </div>
        
        {/* Messages - Scrollable area */}
        <div className="pt-20 pb-32 px-6 overflow-y-auto h-full">
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
        <div className="fixed top-0 z-10 bg-white border-b border-gray-200" style={{ left: 'calc(50vw + 8rem)', width: 'calc(50vw - 8rem)' }}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineAcademicCap className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-800">
                  Lộ trình học của bạn
                </h3>
                <p className="text-sm text-gray-500">
                  Xem và thực hiện các hoạt động học tập
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshStudyPlans}
                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                title="Làm mới lộ trình học"
              >
                <HiRefresh className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đóng chế độ xem lộ trình"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Study Plan Content - Scrollable */}
        <div className="pt-20 overflow-y-auto h-full">
          <StudentStudyPlans
            studentId={studentId}
            studentName={studentName}
            refreshKey={refreshKey}
            onItemClick={handleStudyPlanItemClick}
            onTestStart={handleStartTest}
            showActions={true}
            isStudentView={true}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentChatStudyPlanView;
