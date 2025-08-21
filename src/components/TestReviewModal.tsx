import React, { useEffect, useState } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { getAttemptAnswersByAttemptId } from "../services/attemptAnswerService";
import { getQuestionById } from "../services/questionService";
import { getQuestionsByTestId, TestQuestionDto } from "../services/testQuestionService";
import { AttemptAnswerDto } from "../types/attemptAnswer.types";
import { QuestionDto } from "../types/question.types";
import { ChoiceReadDto } from "../types/choice.types";

interface TestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string;
  testId: string;
  testTitle: string;
}

interface QuestionWithAnswer {
  testQuestion: TestQuestionDto;
  question: QuestionDto;
  attemptAnswer: AttemptAnswerDto;
  selectedChoice: ChoiceReadDto | null;
  correctChoice: ChoiceReadDto | null;
  isCorrect: boolean;
}

interface PartData {
  partNumber: number;
  partName: string;
  questions: QuestionWithAnswer[];
}

const TestReviewModal: React.FC<TestReviewModalProps> = ({
  isOpen,
  onClose,
  attemptId,
  testId,
  testTitle,
}) => {
  const [parts, setParts] = useState<PartData[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && attemptId && testId) {
      loadTestReview();
    }
  }, [isOpen, attemptId, testId]);

  const loadTestReview = async () => {
    setLoading(true);
    setError("");
    try {
      // Bước 1: Lấy tất cả attempt answers
      const attemptAnswers = await getAttemptAnswersByAttemptId(attemptId);
      
      // Bước 2: Lấy tất cả test questions để có thông tin về part và thứ tự
      const testQuestions = await getQuestionsByTestId(testId);

      // Bước 3: Lấy chi tiết từng câu hỏi và kết hợp với attempt answers
      const questionsWithAnswers: QuestionWithAnswer[] = [];
      
      for (const testQuestion of testQuestions) {
        const attemptAnswer = attemptAnswers.find(
          (answer) => answer.questionId === testQuestion.questionId
        );
        
        if (attemptAnswer) {
          try {
            const question = await getQuestionById(testQuestion.questionId);
            
            // Tìm choice được chọn và choice đúng
            const selectedChoice = question.choices?.find(
              (choice) => choice.choiceId === attemptAnswer.choiceId
            ) || null;
            
            const correctChoice = question.choices?.find(
              (choice) => choice.isCorrect === true
            ) || null;
            
            const isCorrect = selectedChoice?.isCorrect === true;
            
            questionsWithAnswers.push({
              testQuestion,
              question,
              attemptAnswer,
              selectedChoice,
              correctChoice,
              isCorrect,
            });
          } catch (err) {
            console.error(`Failed to load question ${testQuestion.questionId}:`, err);
          }
        }
      }

      // Bước 4: Nhóm câu hỏi theo part
      const partMap = new Map<number, QuestionWithAnswer[]>();
      questionsWithAnswers.forEach((item) => {
        const partNumber = item.testQuestion.partNumber || 1;
        if (!partMap.has(partNumber)) {
          partMap.set(partNumber, []);
        }
        partMap.get(partNumber)!.push(item);
      });

      // Bước 5: Tạo cấu trúc parts
      const partsData: PartData[] = [];
      Array.from(partMap.entries())
        .sort(([a], [b]) => a - b) // Sắp xếp theo part number
        .forEach(([partNumber, questions]) => {
          // Sắp xếp câu hỏi trong part theo question number
          questions.sort((a, b) => a.testQuestion.questionNumber - b.testQuestion.questionNumber);
          
          partsData.push({
            partNumber,
            partName: `Part ${partNumber}`,
            questions,
          });
        });

      setParts(partsData);
      setCurrentPartIndex(0);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error("Failed to load test review:", err);
      setError("Không thể tải chi tiết bài test. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = (): QuestionWithAnswer | null => {
    const currentPart = parts[currentPartIndex];
    if (!currentPart) return null;
    return currentPart.questions[currentQuestionIndex] || null;
  };

  const goToNextQuestion = () => {
    const currentPart = parts[currentPartIndex];
    if (!currentPart) return;

    if (currentQuestionIndex < currentPart.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next part
      if (currentPartIndex < parts.length - 1) {
        setCurrentPartIndex(currentPartIndex + 1);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Move to previous part
      if (currentPartIndex > 0) {
        setCurrentPartIndex(currentPartIndex - 1);
        const prevPart = parts[currentPartIndex - 1];
        setCurrentQuestionIndex(prevPart.questions.length - 1);
      }
    }
  };

  const goToPart = (partIndex: number) => {
    setCurrentPartIndex(partIndex);
    setCurrentQuestionIndex(0);
  };

  const getCurrentQuestionNumber = (): number => {
    let totalQuestions = 0;
    for (let i = 0; i < currentPartIndex; i++) {
      totalQuestions += parts[i].questions.length;
    }
    return totalQuestions + currentQuestionIndex + 1;
  };

  const getTotalQuestions = (): number => {
    return parts.reduce((total, part) => total + part.questions.length, 0);
  };

  const getChoiceOptionClass = (choice: ChoiceReadDto, questionWithAnswer: QuestionWithAnswer) => {
    const isSelected = questionWithAnswer.selectedChoice?.choiceId === choice.choiceId;
    const isCorrect = choice.isCorrect;
    
    if (isSelected && isCorrect) {
      return "bg-green-100 border-green-500 text-green-800"; // Đáp án đúng và đã chọn
    } else if (isSelected && !isCorrect) {
      return "bg-red-100 border-red-500 text-red-800"; // Đáp án sai đã chọn
    } else if (!isSelected && isCorrect) {
      return "bg-green-50 border-green-300 text-green-700"; // Đáp án đúng nhưng chưa chọn
    }
    return "bg-gray-50 border-gray-200 text-gray-700"; // Đáp án bình thường
  };

  const getChoiceIcon = (choice: ChoiceReadDto, questionWithAnswer: QuestionWithAnswer) => {
    const isSelected = questionWithAnswer.selectedChoice?.choiceId === choice.choiceId;
    const isCorrect = choice.isCorrect;
    
    if (isSelected && isCorrect) {
      return <FaCheckCircle className="text-green-600" />;
    } else if (isSelected && !isCorrect) {
      return <FaTimesCircle className="text-red-600" />;
    } else if (!isSelected && isCorrect) {
      return <FaCheckCircle className="text-green-500 opacity-60" />;
    }
    return null;
  };

  if (!isOpen) return null;

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Xem lại bài test</h2>
            <p className="text-gray-600 text-sm mt-1">{testTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar - Parts Navigator */}
          <div className="w-64 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Danh sách Part</h3>
              <div className="space-y-2">
                {parts.map((part, index) => (
                  <button
                    key={part.partNumber}
                    onClick={() => goToPart(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      index === currentPartIndex
                        ? "bg-blue-100 border border-blue-300 text-blue-800"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{part.partName}</div>
                    <div className="text-xs opacity-75">
                      {part.questions.length} câu hỏi
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-gray-600">Đang tải chi tiết bài test...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && currentQuestion && (
              <>
                {/* Question Header */}
                <div className="p-6 border-b bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {parts[currentPartIndex]?.partName}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Câu {getCurrentQuestionNumber()} / {getTotalQuestions()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      currentQuestion.isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {currentQuestion.isCorrect ? (
                        <>
                          <FaCheckCircle size={14} />
                          <span>Đúng</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle size={14} />
                          <span>Sai</span>
                        </>
                      )}
                    </div>
                    <span className="text-gray-500">
                      Câu hỏi số {currentQuestion.testQuestion.questionNumber}
                    </span>
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-4xl">
                    {/* Question Text */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">
                        {currentQuestion.question.content}
                      </h4>
                      
                      {/* Audio if exists */}
                      {currentQuestion.question.audioFile && (
                        <div className="mb-4">
                          <audio controls className="w-full">
                            <source src={currentQuestion.question.audioFile} type="audio/mpeg" />
                            Trình duyệt của bạn không hỗ trợ audio.
                          </audio>
                        </div>
                      )}
                      
                      {/* Question Attachments (Images) */}
                      {currentQuestion.question.questionAttachments && currentQuestion.question.questionAttachments.length > 0 && (
                        <div className="mb-4">
                          {currentQuestion.question.questionAttachments.map((attachment, index) => (
                            attachment.mediaType.startsWith('image/') && (
                              <img
                                key={index}
                                src={attachment.mediaUrl}
                                alt="Question"
                                className="max-w-md rounded-lg border mb-2"
                              />
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Answer Choices */}
                    <div className="space-y-3">
                      {currentQuestion.question.choices?.map((choice, index) => (
                        <div
                          key={choice.choiceId}
                          className={`p-4 rounded-lg border-2 transition-all ${getChoiceOptionClass(choice, currentQuestion)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-current flex-shrink-0 mt-0.5">
                              <span className="text-sm font-bold">
                                {String.fromCharCode(65 + index)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{choice.content}</p>
                            </div>
                            <div className="flex-shrink-0">
                              {getChoiceIcon(choice, currentQuestion)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Explanation if available */}
                    {currentQuestion.question.explanation && (
                      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <h5 className="font-semibold text-blue-800">Giải thích đáp án</h5>
                        </div>
                        <div className="pl-8">
                          <p className="text-blue-700 text-sm leading-relaxed">
                            {currentQuestion.question.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPreviousQuestion}
                      disabled={currentPartIndex === 0 && currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft size={14} />
                      Câu trước
                    </button>

                    <div className="text-sm text-gray-600">
                      Câu {getCurrentQuestionNumber()} / {getTotalQuestions()}
                    </div>

                    <button
                      onClick={goToNextQuestion}
                      disabled={
                        currentPartIndex === parts.length - 1 &&
                        currentQuestionIndex === parts[currentPartIndex]?.questions.length - 1
                      }
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Câu tiếp
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReviewModal;
