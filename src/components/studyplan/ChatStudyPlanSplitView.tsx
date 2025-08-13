import React from 'react';
import { HiX, HiOutlineAcademicCap } from 'react-icons/hi';
import StudyPlanCreator from './StudyPlanCreator';

interface ChatStudyPlanSplitViewProps {
  // Chat components
  chatHeader: React.ReactNode;
  chatMessages: React.ReactNode;
  chatInput: React.ReactNode;
  
  // Study plan props
  studentId: string;
  studentName: string;
  onClose: () => void;
  onStudyPlanCreated?: (studyPlanId: string) => void;
}

const ChatStudyPlanSplitView: React.FC<ChatStudyPlanSplitViewProps> = ({
  chatHeader,
  chatMessages,
  chatInput,
  studentId,
  studentName,
  onClose,
  onStudyPlanCreated
}) => {
  return (
    <div className="flex h-full">
      {/* Chat Section - Left Half */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        {chatHeader}
        {chatMessages}
        {chatInput}
      </div>

      {/* Study Plan Section - Right Half */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Study Plan Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiOutlineAcademicCap className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Thiết kế lộ trình học
              </h3>
              <p className="text-sm text-gray-600">
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

        {/* Study Plan Content */}
        <div className="flex-1 overflow-y-auto">
          <StudyPlanCreator
            studentId={studentId}
            studentName={studentName}
            onStudyPlanCreated={onStudyPlanCreated}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatStudyPlanSplitView;
