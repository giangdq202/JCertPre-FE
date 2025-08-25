import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useNotification } from "../../components/notifications";
import { 
  TestDto, 
  TestType, 
  CourseLevel,
  getByTestId
} from "../../services/testService";
import {
  getTestAttemptWithScoreSummary,
  TestAttemptWithScoreSummary
} from "../../services/testAttemptService";
import EntryTestResultModal from "../../components/modals/EntryTestResultModal";
import JLPTTestInterface from "../../components/JLPTTestInterface";
import StudentHeader from "../../components/header/StudentHeader";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import { FaArrowLeft, FaClock, FaPlay } from "react-icons/fa";
import paths from "../../routes/path";

interface TestResultSummary {
  totalScore: number;
  maxScore: number;
  percentage: number;
  sections: {
    sectionName: string;
    score: number;
    maxScore: number;
    percentage: number;
    weakAreas?: string[];
  }[];
}

const EntryTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { success, error } = useNotification();

  // Test states
  const [test, setTest] = useState<TestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<TestResultSummary | null>(null);

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      if (!testId || !userInfo?.id) {
        setErrorMessage("Không tìm thấy thông tin test hoặc người dùng");
        setLoading(false);
        return;
      }

      try {
        const testData = await getByTestId(testId);
        
        if (!testData) {
          setErrorMessage("Không tìm thấy bài test");
          setLoading(false);
          return;
        }
        
        // Verify this is an Entry Auto test
        if (testData.testType !== TestType.EntryAuto) {
          setErrorMessage("Test này không phải là bài test đầu vào");
          setLoading(false);
          return;
        }

        setTest(testData);
      } catch (err) {
        console.error("Error loading test:", err);
        setErrorMessage("Không thể tải thông tin bài test");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, userInfo?.id]);

  const handleStartTest = () => {
    setIsStarted(true);
  };

  const handleBackToHome = () => {
    navigate(paths.student_home);
  };

  const handleTestCompleted = async (attemptId: string) => {
    try {
      // Get test results with score summary
      const result = await getTestAttemptWithScoreSummary(attemptId);
      
      // Convert to our result format
      const testResultSummary: TestResultSummary = {
        totalScore: result.scoreSummary.total_score || 0,
        maxScore: result.scoreSummary.total_max_score || 100,
        percentage: result.scoreSummary.percentage_score || 0,
        sections: [
          {
            sectionName: "Kanji",
            score: result.scoreSummary.kanji_score || 0,
            maxScore: result.scoreSummary.kanji_max_score || 0,
            percentage: result.scoreSummary.kanji_max_score ? 
              ((result.scoreSummary.kanji_score || 0) / result.scoreSummary.kanji_max_score) * 100 : 0,
            weakAreas: result.scoreSummary.kanji_score < (result.scoreSummary.kanji_max_score * 0.6) ? 
              ["Kanji cơ bản", "Đọc âm Kun/On"] : []
          },
          {
            sectionName: "Từ vựng",
            score: result.scoreSummary.vocab_score || 0,
            maxScore: result.scoreSummary.vocab_max_score || 0,
            percentage: result.scoreSummary.vocab_max_score ? 
              ((result.scoreSummary.vocab_score || 0) / result.scoreSummary.vocab_max_score) * 100 : 0,
            weakAreas: result.scoreSummary.vocab_score < (result.scoreSummary.vocab_max_score * 0.6) ? 
              ["Từ vựng cơ bản", "Từ đồng nghĩa"] : []
          },
          {
            sectionName: "Ngữ pháp",
            score: result.scoreSummary.grammar_score || 0,
            maxScore: result.scoreSummary.grammar_max_score || 0,
            percentage: result.scoreSummary.grammar_max_score ? 
              ((result.scoreSummary.grammar_score || 0) / result.scoreSummary.grammar_max_score) * 100 : 0,
            weakAreas: result.scoreSummary.grammar_score < (result.scoreSummary.grammar_max_score * 0.6) ? 
              ["Cấu trúc câu", "Trợ từ"] : []
          },
          {
            sectionName: "Đọc hiểu",
            score: result.scoreSummary.reading_score || 0,
            maxScore: result.scoreSummary.reading_max_score || 0,
            percentage: result.scoreSummary.reading_max_score ? 
              ((result.scoreSummary.reading_score || 0) / result.scoreSummary.reading_max_score) * 100 : 0,
            weakAreas: result.scoreSummary.reading_score < (result.scoreSummary.reading_max_score * 0.6) ? 
              ["Đọc hiểu văn bản", "Tốc độ đọc"] : []
          },
          {
            sectionName: "Nghe hiểu",
            score: result.scoreSummary.listening_score || 0,
            maxScore: result.scoreSummary.listening_max_score || 0,
            percentage: result.scoreSummary.listening_max_score ? 
              ((result.scoreSummary.listening_score || 0) / result.scoreSummary.listening_max_score) * 100 : 0,
            weakAreas: result.scoreSummary.listening_score < (result.scoreSummary.listening_max_score * 0.6) ? 
              ["Nghe hiểu hội thoại", "Phát âm"] : []
          }
        ]
      };

      setTestResult(testResultSummary);
      setShowResult(true);
      
      success("Hoàn thành", "Bạn đã hoàn thành bài test đầu vào!");
      
    } catch (err) {
      console.error("Error getting test results:", err);
      error("Lỗi", "Không thể lấy kết quả bài test");
    }
  };

  const handleContinueAfterResult = () => {
    setShowResult(false);
    navigate(paths.student_home);
  };

  const getLevelString = (level: CourseLevel): string => {
    switch (level) {
      case CourseLevel.N5: return "N5";
      case CourseLevel.N4: return "N4"; 
      case CourseLevel.N3: return "N3";
      case CourseLevel.N2: return "N2";
      case CourseLevel.N1: return "N1";
      default: return "N5";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài test...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex">
          <StudentSideBar />
          <main className="flex-1 p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                <h1 className="text-2xl font-bold text-red-800 mb-4">Lỗi</h1>
                <p className="text-red-600 mb-6">{errorMessage}</p>
                <button
                  onClick={handleBackToHome}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <FaArrowLeft />
                  <span>Quay lại trang chủ</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex">
          <StudentSideBar />
          <main className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              {/* Test Info Card */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaClock className="text-3xl text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {test.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    Test trình độ {getLevelString(test.courseLevel)}
                  </p>
                  {test.description && (
                    <p className="text-gray-600 mb-4">
                      {test.description}
                    </p>
                  )}
                </div>

                {/* Test Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{test.durationMinutes}</div>
                    <div className="text-sm text-gray-600">Phút</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{test.maxAttempts}</div>
                    <div className="text-sm text-gray-600">Lần làm tối đa</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">70%</div>
                    <div className="text-sm text-gray-600">Điểm đạt</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-yellow-800 mb-3">Hướng dẫn làm bài:</h3>
                  <ul className="text-sm text-yellow-700 space-y-2">
                    <li>• Đây là bài test đánh giá trình độ tiếng Nhật của bạn</li>
                    <li>• Bạn có {test.durationMinutes} phút để hoàn thành tất cả các câu hỏi</li>
                    <li>• Kết quả sẽ giúp xác định điểm mạnh và điểm yếu của bạn</li>
                    <li>• Hãy trả lời một cách chân thực để có đánh giá chính xác nhất</li>
                    <li>• Sau khi hoàn thành, bạn sẽ nhận được báo cáo chi tiết</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBackToHome}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                  >
                    <FaArrowLeft />
                    <span>Quay lại</span>
                  </button>
                  
                  <button
                    onClick={handleStartTest}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaPlay />
                    <span>Bắt đầu làm bài</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Result Modal */}
        {showResult && testResult && (
          <EntryTestResultModal
            isOpen={showResult}
            onClose={() => setShowResult(false)}
            result={testResult}
            level={getLevelString(test.courseLevel)}
            onContinue={handleContinueAfterResult}
          />
        )}
      </div>
    );
  }

  // Show test interface when started
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <div className="flex">
        <StudentSideBar />
        <main className="flex-1">
          <JLPTTestInterface
            testType={test.testType}
            courseLevel={test.courseLevel}
            onBack={handleBackToHome}
          />
        </main>
      </div>

      {/* Result Modal */}
      {showResult && testResult && (
        <EntryTestResultModal
          isOpen={showResult}
          onClose={() => setShowResult(false)}
          result={testResult}
          level={getLevelString(test.courseLevel)}
          onContinue={handleContinueAfterResult}
        />
      )}
    </div>
  );
};

export default EntryTestPage;
