import React, { useEffect, useState } from "react";
import { FaTimes, FaClock, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { TestDto, getAllByUserId, TestType } from "../services/testService";
import { TestAttemptDto, getAllTestAttemptsByUserId } from "../services/testAttemptService";
import { CourseLevel } from "../services/testService";
import TestReviewModal from "./TestReviewModal";

interface TestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTemplateTypeId: string;
  testTemplateTypeName: string;
  userId: string;
}

interface TestWithAttempt {
  test: TestDto;
  attempt: TestAttemptDto | null;
  score?: number;
}

const TestHistoryModal: React.FC<TestHistoryModalProps> = ({
  isOpen,
  onClose,
  testTemplateTypeId,
  testTemplateTypeName,
  userId,
}) => {
  const [testHistory, setTestHistory] = useState<TestWithAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // State for test review modal
  const [selectedTestForReview, setSelectedTestForReview] = useState<{
    attemptId: string;
    testId: string;
    testTitle: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && userId && testTemplateTypeId) {
      loadTestHistory();
    }
  }, [isOpen, userId, testTemplateTypeId]);

  const loadTestHistory = async () => {
    setLoading(true);
    setError("");
    try {
      // Bước 1: Lấy tất cả tests của user với testType = 0 (JLPTAuto)
      const testsResponse = await getAllByUserId({
        userId,
        testType: TestType.JLPTAuto,
        pageSize: 100, // Load nhiều để không bị giới hạn
      });

      // Bước 2: Filter tests có TestTemplateTypeId trùng khớp
      const filteredTests = testsResponse.items.filter(
        (test) => test.testTemplateTypeId === testTemplateTypeId
      );

      // Bước 3: Lấy tất cả test attempts của user
      const allAttempts = await getAllTestAttemptsByUserId(userId);

      // Bước 4: Kết hợp tests với attempts tương ứng
      const testHistoryData: TestWithAttempt[] = filteredTests.map((test) => {
        const attempt = allAttempts.find((att) => att.testId === test.testId) || null;
        return {
          test,
          attempt,
        };
      });

      // Sắp xếp theo thời gian attempt (mới nhất trước)
      testHistoryData.sort((a, b) => {
        if (!a.attempt && !b.attempt) return 0;
        if (!a.attempt) return 1;
        if (!b.attempt) return -1;
        return new Date(b.attempt.startTime).getTime() - new Date(a.attempt.startTime).getTime();
      });

      setTestHistory(testHistoryData);
    } catch (err) {
      console.error("Failed to load test history:", err);
      setError("Không thể tải lịch sử làm bài. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTestDetails = (item: TestWithAttempt) => {
    if (item.attempt) {
      setSelectedTestForReview({
        attemptId: item.attempt.attemptId,
        testId: item.test.testId,
        testTitle: item.test.title,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return `${diffMinutes} phút`;
  };

  const getStatusColor = (attempt: TestAttemptDto | null) => {
    if (!attempt) return "text-gray-500";
    if (attempt.isPass === true) return "text-green-600";
    if (attempt.isPass === false) return "text-red-600";
    return "text-blue-600";
  };

  const getStatusIcon = (attempt: TestAttemptDto | null) => {
    if (!attempt) return null;
    if (attempt.isPass === true) return <FaCheckCircle className="text-green-600" />;
    if (attempt.isPass === false) return <FaTimesCircle className="text-red-600" />;
    return <FaClock className="text-blue-600" />;
  };

  const getStatusText = (attempt: TestAttemptDto | null) => {
    if (!attempt) return "Chưa làm bài";
    if (attempt.isPass === true) return "Đậu";
    if (attempt.isPass === false) return "Rớt";
    return "Đã hoàn thành";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Lịch sử làm bài</h2>
              <p className="text-gray-600 text-sm mt-1">{testTemplateTypeName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Đang tải lịch sử làm bài...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && testHistory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Bạn chưa làm bài test nào cho cấp độ này.</p>
              </div>
            )}

            {!loading && !error && testHistory.length > 0 && (
              <div className="space-y-4">
                {testHistory.map((item, index) => (
                  <div
                    key={`${item.test.testId}-${index}`}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {item.test.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt />
                            <span>
                              {item.attempt 
                                ? `Làm bài: ${formatDate(item.attempt.startTime)}`
                                : "Chưa làm bài"
                              }
                            </span>
                          </div>
                          
                          {item.attempt && item.attempt.endTime && (
                            <div className="flex items-center gap-2">
                              <FaClock />
                              <span>
                                Thời gian: {formatDuration(item.attempt.startTime, item.attempt.endTime)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <span>Cấp độ: {CourseLevel[item.test.courseLevel]}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span>Thời gian làm bài: {item.test.durationMinutes} phút</span>
                          </div>
                        </div>

                        <div className={`flex items-center gap-2 text-sm font-medium ${getStatusColor(item.attempt)}`}>
                          {getStatusIcon(item.attempt)}
                          <span>{getStatusText(item.attempt)}</span>
                        </div>
                      </div>

                      {item.attempt && (
                        <div className="ml-4">
                          <button
                            onClick={() => handleViewTestDetails(item)}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FaEye size={14} />
                            Xem chi tiết
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Review Modal */}
      {selectedTestForReview && (
        <TestReviewModal
          isOpen={!!selectedTestForReview}
          onClose={() => setSelectedTestForReview(null)}
          attemptId={selectedTestForReview.attemptId}
          testId={selectedTestForReview.testId}
          testTitle={selectedTestForReview.testTitle}
        />
      )}
    </>
  );
};

export default TestHistoryModal;
