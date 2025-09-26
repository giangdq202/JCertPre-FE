import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaPaperPlane,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSave
} from 'react-icons/fa';
import { TestDto } from '../services/testService';
import { QuestionDto } from '../types/question.types';
import { TestQuestionDto, getQuestionsByTestId } from '../services/testQuestionService';
import { 
  TestAttemptDto, 
  StartTestAttemptDto,
  SubmitTestAttemptDto,
  startTestAttempt,
  submitTestAttempt
} from '../services/testAttemptService';
import {
  addOrUpdateWritingAnswers
} from '../services/attemptAnswerService';
import { getQuestionById } from '../services/questionService';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from './notifications';

interface WritingTestInterfaceProps {
  test: TestDto;
  onBack: () => void;
  onTestCompleted?: () => void;
}

interface QuestionWithDetails {
  testQuestion: TestQuestionDto;
  questionDetails: QuestionDto;
}

const WritingTestInterface: React.FC<WritingTestInterfaceProps> = ({
  test,
  onBack,
  onTestCompleted
}) => {
  const { userInfo } = useAuth();
  const notification = useNotification();

  // State management
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<TestAttemptDto | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (testStarted && timeRemaining > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStarted, timeRemaining, testCompleted]);

  // Load test questions
  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const testQuestions = await getQuestionsByTestId(test.testId);
      
      if (testQuestions.length === 0) {
        notification.error('Lỗi', 'Bài test này không có câu hỏi nào');
        return;
      }

      // Load detailed question information
      const questionsWithDetails: QuestionWithDetails[] = [];
      for (const testQuestion of testQuestions) {
        try {
          const questionDetails = await getQuestionById(testQuestion.questionId);
          questionsWithDetails.push({
            testQuestion,
            questionDetails
          });
        } catch (error) {
          console.error(`Failed to load question ${testQuestion.questionId}:`, error);
        }
      }

      setQuestions(questionsWithDetails.sort((a, b) => a.testQuestion.questionNumber - b.testQuestion.questionNumber));
    } catch (error) {
      console.error('Failed to load test questions:', error);
      notification.error('Lỗi', 'Không thể tải câu hỏi bài test');
    } finally {
      setIsLoading(false);
    }
  };

  // Start test attempt
  const handleStartTest = async () => {
    if (!userInfo) {
      notification.error('Lỗi', 'Bạn cần đăng nhập để làm bài test');
      return;
    }

    try {
      setIsLoading(true);
      
      const startData: StartTestAttemptDto = {
        testId: test.testId,
        userId: userInfo.id
      };

      const attempt = await startTestAttempt(startData);
      setCurrentAttempt(attempt);
      setTimeRemaining(test.durationMinutes * 60);
      setTestStarted(true);
      
      notification.success('Thành công', 'Bắt đầu làm bài test');
    } catch (error) {
      console.error('Failed to start test:', error);
      notification.error('Lỗi', 'Không thể bắt đầu bài test');
    } finally {
      setIsLoading(false);
    }
  };

  // Save answer
  const handleSaveAnswer = async () => {
    if (!currentAttempt || !userAnswer.trim()) {
      notification.warning('Cảnh báo', 'Vui lòng nhập câu trả lời');
      return;
    }

    try {
      // First get question ID from the current question  
      if (!questions.length) {
        notification.error('Lỗi', 'Không tìm thấy câu hỏi');
        return;
      }

      await addOrUpdateWritingAnswers([{
        attemptId: currentAttempt.attemptId,
        questionId: questions[0].questionDetails.id, // Use 'id' instead of 'questionId'
        writtenAnswer: userAnswer.trim() // Changed from 'content' to 'writtenAnswer'
      }]);
      
      notification.success('Thành công', 'Đã lưu câu trả lời');
    } catch (error) {
      console.error('Failed to save answer:', error);
      notification.error('Lỗi', 'Không thể lưu câu trả lời');
    }
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!currentAttempt) return;

    // Save current answer first
    if (userAnswer.trim()) {
      await handleSaveAnswer();
    }

    try {
      setIsSubmitting(true);

      const submitData: SubmitTestAttemptDto = {
        attemptId: currentAttempt.attemptId
      };

      await submitTestAttempt(submitData);
      setTestCompleted(true);
      
      notification.success('Thành công', 'Đã nộp bài test thành công!');
      
      // Call completion callback
      if (onTestCompleted) {
        onTestCompleted();
      }
      
    } catch (error) {
      console.error('Failed to submit test:', error);
      notification.error('Lỗi', 'Không thể nộp bài test');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto submit when time runs out
  const handleAutoSubmit = async () => {
    notification.warning('Hết giờ', 'Thời gian làm bài đã hết, tự động nộp bài');
    await handleSubmitTest();
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, [test.testId]);

  if (isLoading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài test...</p>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
          <p className="text-gray-600 mb-6">
            Bạn đã hoàn thành bài test viết. Kết quả sẽ được chấm điểm và thông báo sau.
          </p>
          <button
            onClick={onBack}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h2>
            {test.description && (
              <p className="text-gray-600">{test.description}</p>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">Thông tin bài test:</h3>
            <div className="space-y-2 text-sm text-purple-700">
              <div className="flex items-center gap-2">
                <FaClock className="text-purple-600" />
                <span>Thời gian: {test.durationMinutes} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-purple-600" />
                <span>Đây là bài test viết. Bạn sẽ có {questions.length} câu hỏi để trả lời.</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft />
              Quay lại
            </button>
            <button
              onClick={handleStartTest}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
            >
              {isLoading ? 'Đang khởi tạo...' : 'Bắt đầu làm bài'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[0]; // Writing test usually has 1 question

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
            <p className="text-sm text-gray-600">Bài test viết</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'
            }`}>
              <FaClock />
              <span className="font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {currentQuestion && (
            <div className="space-y-6">
              {/* Question */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Đề bài:</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {currentQuestion.questionDetails.content}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              {currentQuestion.questionDetails.explanation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Hướng dẫn:</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 leading-relaxed">
                      {currentQuestion.questionDetails.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Answer Input */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Câu trả lời của bạn:</h3>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời của bạn vào đây..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={testCompleted}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {userAnswer.length} ký tự
                  </p>
                  <button
                    onClick={handleSaveAnswer}
                    disabled={!userAnswer.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                  >
                    <FaSave />
                    Lưu câu trả lời
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmitTest}
            disabled={isSubmitting || !userAnswer.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors text-lg font-semibold"
          >
            <FaPaperPlane />
            {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingTestInterface;
