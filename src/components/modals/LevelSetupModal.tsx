import React, { useState } from "react";
import {
  createStudentProfile,
  StudentProfileDto,
} from "../../services/studentProfileService";
import { TestType, CourseLevel, createAutoTest, CreateAutoTestInput } from "../../services/testService";
import {
  getAllTestTemplateTypes,
} from "../../services/testTemplateTypeService";
import {
  getAllByTypeId as getTemplatesByTypeId,
  TestTemplateDto,
} from "../../services/testTemplateService";
import {
  getAllByTemplateId as getConfigsByTemplateId,
} from "../../services/testTemplateConfigService";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaArrowLeft, FaArrowRight, FaTrophy, FaBookOpen, FaGraduationCap } from "react-icons/fa";
import paths from "../../routes/path";

interface LevelSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onProfileCreated: (profile: StudentProfileDto) => void;
}

type Level = "Beginner" | "N5" | "N4" | "N3" | "N2" | "N1";
type StudyGoal = "NextLevel" | "Practice" | null;

const LevelSetupModal: React.FC<LevelSetupModalProps> = ({
  isOpen,
  onClose,
  userId,
  onProfileCreated,
}) => {
  const navigate = useNavigate();
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [wantsEntryTest, setWantsEntryTest] = useState<boolean | null>(null);
  const [studyGoal, setStudyGoal] = useState<StudyGoal>(null);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTests, setLoadingTests] = useState(false);

  if (!isOpen) return null;

  const levels: Level[] = ["Beginner", "N5", "N4", "N3", "N2", "N1"];
  const nextLevels: { [key in Level]: Level | null } = {
    "Beginner": "N5",
    "N5": "N4", 
    "N4": "N3",
    "N3": "N2",
    "N2": "N1",
    "N1": null
  };

  const levelToString = (level: Level): string => {
    return level === "Beginner" ? "Lần đầu tiên học" : level;
  };

  const levelToCourseLevel = (level: Level): CourseLevel => {
    switch (level) {
      case "N5": return CourseLevel.N5;
      case "N4": return CourseLevel.N4;
      case "N3": return CourseLevel.N3;
      case "N2": return CourseLevel.N2;
      case "N1": return CourseLevel.N1;
      default: return CourseLevel.N5; // Default for Beginner
    }
  };

  const getTestLevel = (currentLevel: Level, goal: StudyGoal): Level => {
    if (goal === "Practice") {
      return currentLevel === "Beginner" ? "N5" : currentLevel;
    } else if (goal === "NextLevel") {
      const next = nextLevels[currentLevel];
      return next || currentLevel;
    }
    return currentLevel === "Beginner" ? "N5" : currentLevel;
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setShowConfirmation(true);
  };

  const handleConfirmLevel = () => {
    setShowConfirmation(false);
    setCurrentStep(2);
  };

  const handleBackToLevelSelect = () => {
    setShowConfirmation(false);
    setSelectedLevel(null);
  };

  const handleEntryTestChoice = (choice: boolean) => {
    setWantsEntryTest(choice);
    if (choice) {
      setCurrentStep(3);
    } else {
      // Skip to asking target level if beginner
      if (selectedLevel === "Beginner") {
        setCurrentStep(4);
      } else {
        handleCreateProfile("Ôn luyện và cải thiện kỹ năng");
      }
    }
  };

  const handleStudyGoalSelect = (goal: StudyGoal) => {
    setStudyGoal(goal);
    
    if (goal === "NextLevel") {
      if (selectedLevel === "Beginner") {
        setCurrentStep(4); // Ask target level
      } else if (selectedLevel === "N1") {
        // N1 can't go to next level, so treat as practice
        handleStartEntryTest("Practice");
      } else {
        handleStartEntryTest(goal);
      }
    } else if (goal === "Practice") {
      if (selectedLevel === "Beginner") {
        // Beginner can't practice, so ask target level
        setCurrentStep(4);
      } else {
        handleStartEntryTest(goal);
      }
    }
  };

  const handleTargetLevelSelect = (level: Level) => {
    const goalText = studyGoal === "NextLevel" ? `Ôn thi tới cấp độ ${level}` : `Học từ đầu đến ${level}`;
    if (wantsEntryTest) {
      handleStartEntryTest("NextLevel", level);
    } else {
      handleCreateProfile(goalText);
    }
  };

  const handleStartEntryTest = async (goal: StudyGoal, target?: Level) => {
    if (!selectedLevel) return;
    
    setLoadingTests(true);
    setError(null);
    
    try {
      // Load entry test options
      const entryTypes = await getAllTestTemplateTypes({ 
        type: TestType.EntryAuto, 
        isActive: true, 
        pageSize: 100 
      });

      const testLevel = target || getTestLevel(selectedLevel, goal);
      const targetCourseLevel = levelToCourseLevel(testLevel);
      
      // Find matching test for the target level
      const matchingType = entryTypes.items.find(type => 
        type.courseLevel === targetCourseLevel
      );
      
      if (matchingType) {
        const templates = await getTemplatesByTypeId(matchingType.testTemplateTypeId);
        
        // Filter templates that have configs
        const validTemplates: TestTemplateDto[] = [];
        for (const template of templates) {
          const configs = await getConfigsByTemplateId(template.templateId);
          if (configs && configs.length > 0) {
            validTemplates.push(template);
          }
        }
        
        if (validTemplates.length > 0) {
          // Create auto test and navigate to it
          const autoTestResult = await createAutoTest({
            testType: TestType.EntryAuto,
            courseLevel: targetCourseLevel,
          }, userId);
          
          // Save profile first
          const goalText = goal === "NextLevel" 
            ? `Ôn thi tới cấp độ ${testLevel}`
            : "Ôn luyện và cải thiện kỹ năng";
            
          await handleCreateProfile(goalText);
          
          // Navigate to test
          navigate(paths.student_entry_test.replace(':testId', autoTestResult.testId));
          
        } else {
          throw new Error("Không tìm thấy bài test phù hợp");
        }
      } else {
        throw new Error("Không tìm thấy bài test cho trình độ này");
      }
    } catch (err) {
      console.error("Error starting entry test:", err);
      setError("Không thể tải bài test. Vui lòng thử lại.");
    } finally {
      setLoadingTests(false);
    }
  };

  const handleCreateProfile = async (goals: string) => {
    if (!selectedLevel) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const profileLevel = selectedLevel === "Beginner" ? "N5" : selectedLevel;
      const newProfile = await createStudentProfile({
        userId: userId,
        currentLevel: profileLevel,
        learningGoals: goals,
      });

      onProfileCreated(newProfile);
    } catch (err) {
      console.error("Failed to create student profile:", err);
      setError("Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaGraduationCap className="text-2xl text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Chào mừng đến với JCertPre!
        </h2>
        <p className="text-gray-600">
          Hãy cho chúng tôi biết trình độ tiếng Nhật hiện tại của bạn
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => handleLevelSelect(level)}
            className={`p-4 border-2 rounded-xl transition-all duration-200 hover:border-blue-500 hover:shadow-md ${
              selectedLevel === level
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                level === "Beginner" ? "text-green-600" : "text-blue-600"
              }`}>
                {levelToString(level)}
              </div>
              {level === "Beginner" && (
                <div className="text-xs text-gray-500 mt-1">
                  Chưa từng học tiếng Nhật
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {showConfirmation && selectedLevel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Bạn đã chọn: <span className="font-bold">{levelToString(selectedLevel)}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Xác nhận để tiếp tục
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBackToLevelSelect}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Chọn lại
              </button>
              <button
                onClick={handleConfirmLevel}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <FaCheck className="text-xs" />
                <span>Xác nhận</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTrophy className="text-2xl text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bài test đầu vào
        </h2>
        <p className="text-gray-600">
          Bạn có muốn làm bài test đầu vào để đánh giá chính xác trình độ không?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => handleEntryTestChoice(true)}
          className="p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheck className="text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Có, tôi muốn làm test</div>
              <div className="text-sm text-gray-600 mt-1">
                Giúp xác định chính xác trình độ và điểm yếu cần cải thiện
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleEntryTestChoice(false)}
          className="p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FaArrowRight className="text-gray-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Không, bỏ qua test</div>
              <div className="text-sm text-gray-600 mt-1">
                Tiếp tục với trình độ đã chọn
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
        >
          <FaArrowLeft className="text-sm" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaBookOpen className="text-2xl text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Mục tiêu học tập
        </h2>
        <p className="text-gray-600">
          Bạn muốn làm bài test với mục tiêu gì?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {selectedLevel !== "Beginner" && (
          <button
            onClick={() => handleStudyGoalSelect("Practice")}
            disabled={loadingTests}
            className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBookOpen className="text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">Ôn luyện và cải thiện kỹ năng</div>
                <div className="text-sm text-gray-600 mt-1">
                  Test trình độ {selectedLevel && levelToString(selectedLevel)} để tìm điểm yếu
                </div>
              </div>
            </div>
          </button>
        )}

        {selectedLevel && nextLevels[selectedLevel] && (
          <button
            onClick={() => handleStudyGoalSelect("NextLevel")}
            disabled={loadingTests}
            className="p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaTrophy className="text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">Ôn thi tới cấp độ tiếp theo</div>
                <div className="text-sm text-gray-600 mt-1">
                  Test trình độ {levelToString(nextLevels[selectedLevel]!)} để chuẩn bị thi
                </div>
              </div>
            </div>
          </button>
        )}

        {selectedLevel === "Beginner" && (
          <button
            onClick={() => setCurrentStep(4)}
            disabled={loadingTests}
            className="p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaTrophy className="text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">Đặt mục tiêu học tập</div>
                <div className="text-sm text-gray-600 mt-1">
                  Chọn trình độ mục tiêu để làm test đầu vào
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {loadingTests && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Đang chuẩn bị bài test...</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
        >
          <FaArrowLeft className="text-sm" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTrophy className="text-2xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Mục tiêu của bạn
        </h2>
        <p className="text-gray-600">
          Bạn muốn nhắm tới trình độ nào?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {["N5", "N4", "N3", "N2", "N1"].map((level) => (
          <button
            key={level}
            onClick={() => handleTargetLevelSelect(level as Level)}
            disabled={isSubmitting}
            className="p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {level}
              </div>
            </div>
          </button>
        ))}
      </div>

      {isSubmitting && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Đang tạo hồ sơ...</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(selectedLevel === "Beginner" && wantsEntryTest ? 3 : 2)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
        >
          <FaArrowLeft className="text-sm" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 m-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step < currentStep ? "bg-blue-600 text-white" :
                  step === currentStep ? "bg-blue-100 text-blue-600 border-2 border-blue-600" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {step < currentStep ? <FaCheck className="text-xs" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 rounded-full ${
                    step < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LevelSetupModal;
