import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaQuestion,
  FaPlay,
  FaFlag,
  FaPaperPlane,
  FaExclamationTriangle
} from 'react-icons/fa';
import { TestDto } from '../services/testService';
import { QuestionDto } from '../types/question.types';
import { TestQuestionDto, getQuestionsByTestId } from '../services/testQuestionService';
import { 
  TestAttemptDto, 
  StartTestAttemptDto,
  SubmitTestAttemptDto,
  TestAttemptWithScoreSummary,
  startTestAttempt,
  submitTestAttempt,
  getTestAttemptWithScoreSummary
} from '../services/testAttemptService';
import {
  CreateAttemptAnswerDto
} from '../types/attemptAnswer.types';
import {
  addOrUpdateAttemptAnswer,
  getAttemptAnswersByAttemptId
} from '../services/attemptAnswerService';
import { getQuestionById } from '../services/questionService';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from './notifications';
import { useLessonProgress } from '../hooks/useLessonProgress';

interface TestInterfaceProps {
  test: TestDto;
  lessonId?: string;
  courseId?: string;
  onBack: () => void;
  onTestCompleted?: () => void;
}

interface QuestionWithDetails {
  testQuestion: TestQuestionDto;
  questionDetails: QuestionDto;
}

interface UserAnswer {
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({ test, lessonId, courseId, onBack, onTestCompleted }) => {
  const { userInfo } = useAuth();
  const { success, error } = useNotification();
  const { markLessonCompleted } = useLessonProgress();
  const [currentAttempt, setCurrentAttempt] = useState<TestAttemptDto | null>(null);
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: UserAnswer }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testStatus, setTestStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'time_up'>('not_started');
  const [testResult, setTestResult] = useState<TestAttemptWithScoreSummary | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Load total questions count on component mount
  useEffect(() => {
    const loadTotalQuestions = async () => {
      try {
        const testQuestions = await getQuestionsByTestId(test.testId);
        setTotalQuestions(testQuestions.length);
      } catch (err) {
        console.error('Failed to load total questions:', err);
        setTotalQuestions(0);
      }
    };
    
    loadTotalQuestions();
  }, [test.testId]);

  // Timer effect
  useEffect(() => {
    if (testStatus === 'in_progress' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (testStatus === 'in_progress' && timeLeft === 0) {
      // Auto submit when time is up
      handleAutoSubmit();
    }
  }, [timeLeft, testStatus]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = async () => {
    if (!userInfo?.id) {
      error('Chưa đăng nhập', 'Vui lòng đăng nhập để làm bài test');
      return;
    }

    setIsLoading(true);
    try {
      // Start test attempt
      const startDto: StartTestAttemptDto = {
        testId: test.testId,
        userId: userInfo.id
      };

      const attempt = await startTestAttempt(startDto);
      setCurrentAttempt(attempt);

      // Calculate time left
      const endTime = new Date(attempt.endTime).getTime();
      const currentTime = Date.now();
      const remainingTime = Math.max(0, Math.floor((endTime - currentTime) / 1000));
      setTimeLeft(remainingTime);

      // Load test questions
      const testQuestions = await getQuestionsByTestId(test.testId);
      
      // Load question details for each test question
      const questionsWithDetails: QuestionWithDetails[] = [];
      for (const tq of testQuestions) {
        try {
          const questionDetails = await getQuestionById(tq.questionId);
          questionsWithDetails.push({
            testQuestion: tq,
            questionDetails
          });
        } catch (error) {
          console.error(`Failed to load question ${tq.questionId}:`, error);
        }
      }

      // Sort by question number
      questionsWithDetails.sort((a, b) => a.testQuestion.questionNumber - b.testQuestion.questionNumber);
      setQuestions(questionsWithDetails);

      // Load existing answers if any
      try {
        const existingAnswers = await getAttemptAnswersByAttemptId(attempt.attemptId);
        const answersMap: { [questionId: string]: UserAnswer } = {};
        existingAnswers.forEach(answer => {
          answersMap[answer.questionId] = {
            questionId: answer.questionId,
            choiceId: answer.choiceId,
            textAnswer: answer.textAnswer
          };
        });
        setUserAnswers(answersMap);
      } catch (error) {
        console.error('Failed to load existing answers:', error);
      }

      setTestStatus('in_progress');
    } catch (err: any) {
      console.error('Failed to start test:', err);
      if (err?.response?.data?.errorCode === "MAX_ATTEMPTS_REACHED") {
        error('Số lần làm bài đã đạt giới hạn', 'Bạn đã sử dụng hết số lần làm bài cho phép!');
      } else {
        error('Lỗi khởi tạo test', 'Không thể bắt đầu bài test. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: string, choiceId?: string, textAnswer?: string) => {
    if (!currentAttempt || !choiceId) return;

    const newAnswer: UserAnswer = {
      questionId,
      choiceId,
      textAnswer
    };

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: newAnswer
    }));

    // Save answer to backend
    try {
      const dto: CreateAttemptAnswerDto = {
        attemptId: currentAttempt.attemptId,
        questionId,
        choiceId
      };
      
      await addOrUpdateAttemptAnswer(dto);
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleAutoSubmit = async () => {
    if (!currentAttempt) return;
    
    setTestStatus('time_up');
    await handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!currentAttempt) return;

    setIsSubmitting(true);
    try {
      const submitDto: SubmitTestAttemptDto = {
        attemptId: currentAttempt.attemptId
      };

      await submitTestAttempt(submitDto);
      
      // Get test result with score summary
      const result = await getTestAttemptWithScoreSummary(currentAttempt.attemptId);
      setTestResult(result);
      setTestStatus('completed');
      
      // Create lesson progress if test is passed and lessonId/courseId are provided
      if (result.attempt.isPass && lessonId && courseId) {
        try {
          await markLessonCompleted(lessonId, courseId);
          success('Chúc mừng!', 'Bạn đã pass bài test và hoàn thành bài học!');
        } catch (progressError) {
          console.error('Failed to create lesson progress:', progressError);
          success('Nộp bài thành công!', 'Kết quả test đã được lưu và chấm điểm');
        }
      } else {
        success('Nộp bài thành công!', 'Kết quả test đã được lưu và chấm điểm');
      }

      // Call onTestCompleted callback if provided
      if (onTestCompleted) {
        onTestCompleted();
      }
    } catch (err) {
      console.error('Failed to submit test:', err);
      error('Lỗi nộp bài', 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(userAnswers).length;
  };

  if (testStatus === 'not_started') {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <FaPlay className="mx-auto text-6xl text-blue-600 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{test.title}</h2>
          <p className="text-gray-600 mb-6">{test.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <FaClock className="mx-auto text-blue-600 text-2xl mb-2" />
              <p className="text-sm text-gray-600">Thời gian làm bài</p>
              <p className="font-bold text-blue-800">{test.durationMinutes} phút</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <FaQuestion className="mx-auto text-green-600 text-2xl mb-2" />
              <p className="text-sm text-gray-600">Số câu hỏi</p>
              <p className="font-bold text-green-800">
                {totalQuestions > 0 ? totalQuestions : 'Đang tải...'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <FaFlag className="mx-auto text-purple-600 text-2xl mb-2" />
              <p className="text-sm text-gray-600">Số lần thử</p>
              <p className="font-bold text-purple-800">{test.maxAttempts} lần</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleStartTest}
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang khởi tạo...
                </>
              ) : (
                <>
                  <FaPlay />
                  Bắt đầu làm bài
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testStatus === 'completed') {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <FaCheckCircle className="mx-auto text-6xl text-green-600 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Hoàn thành bài test!</h2>
          
          {testResult && testResult.scoreSummary && (
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Tổng điểm</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {testResult.scoreSummary.total_score || 0}/{testResult.scoreSummary.total_max_score || 0}
                  </div>
                  <div className="text-lg text-blue-700 mt-2">
                    {testResult.scoreSummary.total_max_score > 0 
                      ? Math.round((testResult.scoreSummary.total_score || 0) / testResult.scoreSummary.total_max_score * 100)
                      : 0}%
                  </div>
                </div>
                
                <div className={`p-6 rounded-lg ${
                  testResult.attempt.isPass ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    testResult.attempt.isPass ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Kết quả
                  </h3>
                  <div className={`text-2xl font-bold ${
                    testResult.attempt.isPass ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testResult.attempt.isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                  </div>
                  <div className={`text-sm mt-2 ${
                    testResult.attempt.isPass ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Điểm cần đạt: 70%
                  </div>
                </div>
              </div>

              {/* Detailed scores by category */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {testResult.scoreSummary.kanji_max_score > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Kanji</h4>
                    <div className="text-lg font-bold text-gray-800">
                      {testResult.scoreSummary.kanji_score}/{testResult.scoreSummary.kanji_max_score}
                    </div>
                  </div>
                )}
                
                {testResult.scoreSummary.vocab_max_score > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Từ vựng</h4>
                                      <div className="text-lg font-bold text-gray-800">
                    {testResult.scoreSummary.vocab_score || 0}/{testResult.scoreSummary.vocab_max_score || 0}
                  </div>
                  </div>
                )}
                
                {testResult.scoreSummary.grammar_max_score > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Ngữ pháp</h4>
                    <div className="text-lg font-bold text-gray-800">
                      {testResult.scoreSummary.grammar_score}/{testResult.scoreSummary.grammar_max_score}
                    </div>
                  </div>
                )}
                
                {testResult.scoreSummary.reading_max_score > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Đọc hiểu</h4>
                    <div className="text-lg font-bold text-gray-800">
                      {testResult.scoreSummary.reading_score}/{testResult.scoreSummary.reading_max_score}
                    </div>
                  </div>
                )}
                
                {testResult.scoreSummary.listening_max_score > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Nghe hiểu</h4>
                    <div className="text-lg font-bold text-gray-800">
                      {testResult.scoreSummary.listening_score}/{testResult.scoreSummary.listening_max_score}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={onBack}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại bài học
          </button>
        </div>
      </div>
    );
  }

  if (testStatus === 'in_progress' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.questionDetails.id];

    return (
      <div className="bg-white rounded-xl shadow-xl max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{test.title}</h2>
              <p className="text-blue-100">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <FaClock />
                <span className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-200' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm text-blue-100">
                Đã trả lời: {getAnsweredQuestionsCount()}/{totalQuestions}
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Câu {currentQuestion.testQuestion.questionNumber}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {currentQuestion.questionDetails.points} điểm
              </span>
            </div>
            
            <div 
              className="text-lg text-gray-800 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentQuestion.questionDetails.content }}
            />

            {/* Question attachments */}
            {currentQuestion.questionDetails.questionAttachments?.map((attachment, index) => (
              <div key={index} className="mb-4">
                {attachment.mediaType.startsWith('image/') ? (
                  <img 
                    src={attachment.mediaUrl} 
                    alt="Question attachment" 
                    className="max-w-full h-auto rounded-lg shadow-sm"
                  />
                ) : attachment.mediaType.startsWith('audio/') ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaPlay className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Audio câu hỏi</span>
                    </div>
                    <audio 
                      controls 
                      className="w-full"
                      preload="none"
                    >
                      <source src={attachment.mediaUrl} type={attachment.mediaType} />
                      Trình duyệt của bạn không hỗ trợ audio.
                    </audio>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <a 
                      href={attachment.mediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Xem tài liệu đính kèm ({attachment.mediaType})
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Answer choices */}
          <div className="space-y-3">
            {currentQuestion.questionDetails.choices?.map((choice) => (
              <label
                key={choice.choiceId}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  currentAnswer?.choiceId === choice.choiceId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionDetails.id}`}
                    value={choice.choiceId}
                    checked={currentAnswer?.choiceId === choice.choiceId}
                    onChange={() => handleAnswerChange(
                      currentQuestion.questionDetails.id,
                      choice.choiceId
                    )}
                    className="mt-1"
                  />
                  <div 
                    className="flex-1 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: choice.content }}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Câu trước
          </button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : userAnswers[questions[index].questionDetails.id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Câu tiếp
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FaPaperPlane />
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4">
              <div className="text-center">
                <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-4">Xác nhận nộp bài</h3>
                <p className="text-gray-600 mb-2">
                  Bạn đã trả lời {getAnsweredQuestionsCount()}/{totalQuestions} câu hỏi.
                </p>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài bạn sẽ không thể thay đổi câu trả lời.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowSubmitConfirm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang nộp...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Nộp bài
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải bài test...</p>
      </div>
    </div>
  );
};
