// src/pages/student/StudentExamPage.tsx
import React, { useEffect, useState } from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import JLPTTestInterface from "../../components/JLPTTestInterface";
import TestHistoryModal from "../../components/TestHistoryModal";
import { TestType, CourseLevel } from "../../services/testService";
import { FaPlay, FaGraduationCap, FaClock, FaUsers, FaHistory } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import { 
  getTemplateTypeSummary,
  TestTemplateSummaryDto
} from "../../services/testTemplateTypeService";
import {
  getStudentProfile,
  StudentProfileDto,
} from "../../services/studentProfileService";
import {
  getMyEnrollments,
} from "../../services/enrollmentService";

interface TestOption {
  id: string; // use testTemplateTypeId for uniqueness
  title: string; // e.g., "JLPT N5"
  testType: TestType;
  courseLevel: CourseLevel;
  totalTestScore: number;
  totalPassPercentage: number;
  totalDurationMinutes: number;
  // Keep reference to template summaries for test execution
  templates: TestTemplateSummaryDto[];
}

const StudentExamPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [selectedTest, setSelectedTest] = useState<TestOption | null>(null);
  const [isInTest, setIsInTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [studentProfile, setStudentProfile] = useState<StudentProfileDto | null>(null);
  const [hasEnrollments, setHasEnrollments] = useState<boolean>(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true);
  
  const [testOptions, setTestOptions] = useState<TestOption[]>([]);

  // History modal state
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    testTemplateTypeId: string;
    testTemplateTypeName: string;
  }>({
    isOpen: false,
    testTemplateTypeId: "",
    testTemplateTypeName: "",
  });

  // Helper function to get CourseLevel from string
  const getCourseLevelFromString = (levelString: string): CourseLevel => {
    switch (levelString) {
      case "N5": return CourseLevel.N5;
      case "N4": return CourseLevel.N4;
      case "N3": return CourseLevel.N3;
      case "N2": return CourseLevel.N2;
      case "N1": return CourseLevel.N1;
      default: return CourseLevel.N5;
    }
  };

  // Check if user has any enrollments
  const checkEnrollments = async () => {
    if (!userInfo?.id) return;
    
      try {
        setCheckingEnrollment(true);
        const enrollmentList = await getMyEnrollments();
        setHasEnrollments(enrollmentList.length > 0);      if (enrollmentList.length === 0) {
        setErrorMsg("Bạn cần đăng ký ít nhất một khóa học để có thể làm bài test. Vui lòng đăng ký khóa học trước khi tiếp tục.");
      }
    } catch (error) {
      console.error('Error checking enrollments:', error);
      setErrorMsg('Không thể kiểm tra thông tin đăng ký khóa học. Vui lòng thử lại sau.');
    } finally {
      setCheckingEnrollment(false);
    }
  };

  // Load student profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.id) return;

      try {
        const profile = await getStudentProfile(userInfo.id);
        setStudentProfile(profile);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        // If no profile found, default to N5 level
        setStudentProfile({ 
          userId: userInfo.id, 
          currentLevel: "N5", 
          learningGoals: "Cải thiện trình độ tiếng Nhật" 
        } as StudentProfileDto);
      }
    };

    const initializeData = async () => {
      await Promise.all([fetchProfile(), checkEnrollments()]);
    };

    initializeData();
  }, [userInfo?.id]);

  // Load available options using new summary API
  useEffect(() => {
    const loadOptions = async () => {
      if (!studentProfile || !hasEnrollments || checkingEnrollment) return; // Wait for profile and enrollment check
      
      setLoading(true);
      setErrorMsg("");
      try {
        const userCurrentLevel = getCourseLevelFromString(studentProfile.currentLevel);
        const options: TestOption[] = [];

        // Get available levels: current level and one level higher
        const levelProgression = [CourseLevel.N5, CourseLevel.N4, CourseLevel.N3, CourseLevel.N2, CourseLevel.N1];
        const userIndex = levelProgression.indexOf(userCurrentLevel);
        const availableLevels = [userCurrentLevel]; // Current level
        
        // Add one level higher if not already at highest level
        if (userIndex < levelProgression.length - 1) {
          availableLevels.push(levelProgression[userIndex + 1]);
        }

        // For each available level, try to get template type summary
        for (const level of availableLevels) {
          try {
            const summary = await getTemplateTypeSummary(level, TestType.JLPTAuto);
            
            if (summary && summary.testTemplates.length > 0) {
              console.log('Template Type Summary:', summary);
              
              options.push({
                id: summary.testTemplateTypeId,
                title: summary.typeName,
                testType: summary.testType,
                courseLevel: summary.courseLevel,
                totalTestScore: summary.totalTestScore,
                totalPassPercentage: summary.totalPassPercentage,
                totalDurationMinutes: summary.totalDurationMinutes,
                templates: summary.testTemplates
              });
            }
          } catch (levelError) {
            console.log(`No template type found for level ${CourseLevel[level]} with JLPTAuto type`);
            // Continue to next level if this level doesn't have a template type
          }
        }

        setTestOptions(options);
      } catch (err) {
        console.error('Failed to load exam options:', err);
        setErrorMsg('Không thể tải danh sách bài test. Vui lòng thử lại sau.');
        setTestOptions([]);
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, [studentProfile, hasEnrollments, checkingEnrollment]); // Added hasEnrollments and checkingEnrollment dependencies

  const handleStartTest = (testOption: TestOption) => {
    setSelectedTest(testOption);
    setIsInTest(true);
  };

  const handleBackToList = () => {
    setIsInTest(false);
    setSelectedTest(null);
  };

  const handleLevelUpdated = async () => {
    // Reload student profile after level update
    if (userInfo?.id) {
      try {
        const updatedProfile = await getStudentProfile(userInfo.id);
        setStudentProfile(updatedProfile);
      } catch (error) {
        console.error('Failed to reload student profile:', error);
      }
    }
  };

  const handleViewHistory = (testOption: TestOption) => {
    setHistoryModal({
      isOpen: true,
      testTemplateTypeId: testOption.id,
      testTemplateTypeName: testOption.title,
    });
  };

  const handleCloseHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      testTemplateTypeId: "",
      testTemplateTypeName: "",
    });
  };

  if (isInTest && selectedTest) {
    return (
      <JLPTTestInterface
        testType={selectedTest.testType}
        courseLevel={selectedTest.courseLevel}
        onBack={handleBackToList}
        onLevelUpdated={handleLevelUpdated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-inter">
      {/* Sidebar */}
      <StudentSideBar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <StudentHeader />

        {/* Content */}
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thi thử JLPT
            </h2>
            <p className="text-gray-600">
              Chọn cấp độ JLPT phù hợp với trình độ của bạn để bắt đầu làm bài thi thử
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading || checkingEnrollment) && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg p-6 border text-center text-gray-600">
                {checkingEnrollment ? "Đang kiểm tra đăng ký khóa học..." : "Đang tải danh sách bài test..."}
              </div>
            )}
            
            {!loading && !checkingEnrollment && !hasEnrollments && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-yellow-50 rounded-lg p-8 border border-yellow-200 text-center">
                  <div className="text-yellow-600 text-5xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Chưa đăng ký khóa học
                  </h3>
                  <p className="text-yellow-700 mb-6">
                    Bạn cần đăng ký ít nhất một khóa học để có thể làm bài test JLPT. 
                    Việc đăng ký khóa học sẽ giúp bạn tiếp cận với hệ thống bài test được tối ưu hóa theo trình độ.
                  </p>
                  <button
                    onClick={() => window.location.href = '/student/courses'}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Đăng ký khóa học ngay
                  </button>
                </div>
              </div>
            )}
            
            {!loading && !checkingEnrollment && errorMsg && hasEnrollments && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-red-50 rounded-lg p-6 border border-red-200 text-center text-red-700">
                {errorMsg}
              </div>
            )}
            
            {!loading && !checkingEnrollment && hasEnrollments && testOptions.length === 0 && !errorMsg && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg p-6 border text-center text-gray-600">
                Không có bài test phù hợp với cấp độ của bạn.
              </div>
            )}
            {!loading && !checkingEnrollment && hasEnrollments && testOptions.map((testOption) => (
              <div
                key={testOption.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-xl text-blue-600" />
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                      JLPT
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700`}>
                    {CourseLevel[testOption.courseLevel]}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {testOption.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">Bài thi thử JLPT theo cấu hình hệ thống</p>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>~{testOption.totalDurationMinutes} phút</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    <span>Cấp độ {CourseLevel[testOption.courseLevel]}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(testOption)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white mb-2"
                >
                  <FaPlay size={14} />
                  Bắt đầu làm bài
                </button>
                
                <button
                  onClick={() => handleViewHistory(testOption)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <FaHistory size={14} />
                  Xem lịch sử
                </button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Hướng dẫn làm bài
            </h3>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>• Bài thi sẽ được chia thành nhiều phần (Part) với thời gian riêng biệt</p>
              <p>• Bạn không thể làm Part tiếp theo khi Part hiện tại chưa hết thời gian</p>
              <p>• Bạn không thể quay lại Part trước khi Part hiện tại chưa hết thời gian</p>
              <p>• Hệ thống sẽ tự động nộp bài khi hết thời gian tổng</p>
              <p>• Câu trả lời sẽ được lưu tự động khi bạn chọn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test History Modal */}
      {userInfo && (
        <TestHistoryModal
          isOpen={historyModal.isOpen}
          onClose={handleCloseHistoryModal}
          testTemplateTypeId={historyModal.testTemplateTypeId}
          testTemplateTypeName={historyModal.testTemplateTypeName}
          userId={userInfo.id}
        />
      )}
    </div>
  );
};

export default StudentExamPage;
