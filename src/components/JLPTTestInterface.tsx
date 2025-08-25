import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaClock, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from './notifications';
import { 
  TestDto, 
  TestType, 
  CourseLevel,
  createAutoTest,
  CreateAutoTestInput 
} from '../services/testService';
import {
  startTestAttempt,
  submitTestAttempt,
  getTestAttemptWithScoreSummary,
  TestAttemptDto,
  TestAttemptWithScoreSummary
} from '../services/testAttemptService';
import {
  getQuestionsByTestId,
  TestQuestionDto
} from '../services/testQuestionService';
import {
  getQuestionById
} from '../services/questionService';
import {
  QuestionDto
} from '../types/question.types';
import {
  CreateAttemptAnswerDto
} from '../types/attemptAnswer.types';
import {
  addOrUpdateAttemptAnswer
} from '../services/attemptAnswerService';
import { 
  updateStudentLevel, 
  getStudentProfile
} from '../services/studentProfileService';

interface JLPTTestInterfaceProps {
  testType: TestType;
  courseLevel: CourseLevel;
  onBack: () => void;
  onLevelUpdated?: () => void; // Optional callback when level is updated
}

interface TestPart {
  partNumber: number;
  partName: string;
  durationMinutes: number;
  questions: TestQuestionDto[];
}

interface QuestionWithChoices extends Omit<QuestionDto, 'choices'> {
  choices?: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
}

const JLPTTestInterface: React.FC<JLPTTestInterfaceProps> = ({
  testType,
  courseLevel,
  onBack,
  onLevelUpdated
}) => {
  const { userInfo } = useAuth();
  const { success, error } = useNotification();
  
  // Test states
  const [test, setTest] = useState<TestDto | null>(null);
  const [testAttempt, setTestAttempt] = useState<TestAttemptDto | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestionDto[]>([]);
  const [testParts, setTestParts] = useState<TestPart[]>([]);
  
  // Current state
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithChoices | null>(null);
  
  // Timer states
  const [partTimeLeft, setPartTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [isPartTimeUp, setIsPartTimeUp] = useState(false);
  
  // Answer states
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Result states
  const [testResult, setTestResult] = useState<TestAttemptWithScoreSummary | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Audio states
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Map<string, number>>(new Map());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Audio control functions
  const handlePlayAudio = async (audioUrl: string) => {
    try {
      // Pause any currently playing audio
      if (playingAudio && playingAudio !== audioUrl) {
        const currentlyPlaying = audioRefs.current.get(playingAudio);
        if (currentlyPlaying) {
          currentlyPlaying.pause();
        }
      }

      // Get or create audio element
      let audio = audioRefs.current.get(audioUrl);
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.preload = 'metadata';
        audioRefs.current.set(audioUrl, audio);

        // Add event listeners
        audio.addEventListener('loadeddata', () => {
          console.log('Audio loaded:', audioUrl);
        });

        audio.addEventListener('ended', () => {
          setPlayingAudio(null);
          setAudioProgress(prev => new Map(prev.set(audioUrl, 0)));
        });

        audio.addEventListener('timeupdate', () => {
          if (audio && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            setAudioProgress(prev => new Map(prev.set(audioUrl, progress)));
          }
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          error('Lỗi audio', 'Không thể phát âm thanh');
          setPlayingAudio(null);
        });
      }

      // Toggle play/pause
      if (playingAudio === audioUrl) {
        audio.pause();
        setPlayingAudio(null);
      } else {
        await audio.play();
        setPlayingAudio(audioUrl);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      error('Lỗi audio', 'Không thể phát âm thanh');
      setPlayingAudio(null);
    }
  };

  // Cleanup audio when component unmounts or question changes
  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.removeEventListener('loadeddata', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('error', () => {});
      });
      audioRefs.current.clear();
    };
  }, [currentQuestion]);

  // Initialize test
  const initializeTest = async () => {
    if (!userInfo?.id) {
      error('Lỗi đăng nhập', 'Vui lòng đăng nhập để làm bài thi');
      return;
    }

    console.log('JLPTTestInterface - testType:', testType, 'Type of:', typeof testType);
    console.log('JLPTTestInterface - courseLevel:', courseLevel, 'Type of:', typeof courseLevel);

    setLoading(true);
    try {
      // Step 1: Create auto test
      const autoTestInput: CreateAutoTestInput = {
        testType,
        courseLevel
      };
      
      console.log('CreateAutoTestInput:', autoTestInput);
      
      const createdTestResult = await createAutoTest(autoTestInput, userInfo.id);
      // Convert CreateAutoTestResult to TestDto format
      const createdTest: TestDto = {
        testId: createdTestResult.testId,
        title: createdTestResult.title || 'Auto Generated Test',
        description: createdTestResult.description || '',
        testType: testType,
        courseLevel: courseLevel,
        durationMinutes: 0,
        maxAttempts: 3,
        availableFrom: new Date().toISOString(),
        availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 1,
        createdByUserId: userInfo.id
      };
      setTest(createdTest);

      // Step 2: Start test attempt
      const attempt = await startTestAttempt({ testId: createdTest.testId, userId: userInfo.id });
      setTestAttempt(attempt);

      // Step 3: Get all test questions
      const questions = await getQuestionsByTestId(createdTest.testId);
      setTestQuestions(questions);

      // Step 4: Group questions by parts
      const parts = groupQuestionsByParts(questions);
      setTestParts(parts);

      // Step 5: Calculate total time and part time
      const totalDuration = parts.reduce((sum, part) => sum + part.durationMinutes, 0);
      setTotalTimeLeft(totalDuration * 60); // Convert to seconds
      setPartTimeLeft(parts[0]?.durationMinutes * 60 || 0);

      // Step 6: Load first question
      if (parts[0]?.questions[0]) {
        await loadQuestion(parts[0].questions[0].questionId);
      }

      success('Bắt đầu bài thi', 'Bài thi đã được khởi tạo thành công');
    } catch (err: any) {
      console.error('Failed to initialize test:', err);
      if (err?.response?.data?.errorCode === "MAX_ATTEMPTS_REACHED") {
        error('Số lần làm bài đã đạt giới hạn', 'Bạn đã sử dụng hết số lần làm bài cho phép!');
      } else if (err?.response?.status === 400) {
        error('Chưa có mẫu đề thi', 'Hệ thống chưa có mẫu đề thi cho loại bài thi này. Vui lòng liên hệ quản trị viên để thiết lập mẫu đề thi.');
      } else {
        error('Lỗi khởi tạo bài thi', 'Không thể bắt đầu bài thi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the next level
  const getNextLevel = (currentLevel: CourseLevel): CourseLevel | null => {
    const levels = [CourseLevel.N5, CourseLevel.N4, CourseLevel.N3, CourseLevel.N2, CourseLevel.N1];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex >= 0 && currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  // Helper function to check if current test is one level higher than user's current level
  const isTestOneLevelHigher = async (): Promise<boolean> => {
    try {
      if (!userInfo?.id) return false;
      
      const profile = await getStudentProfile(userInfo.id);
      if (!profile?.currentLevel) return false;

      // Parse user's current level
      const userLevel = profile.currentLevel as unknown as CourseLevel;
      const testLevel = courseLevel;

      // Check if test level is exactly one level higher than user level
      const nextLevel = getNextLevel(userLevel);
      return nextLevel === testLevel;
    } catch (error) {
      console.error('Error checking user level:', error);
      return false;
    }
  };

  // Auto update user level when pass higher level test
  const handleLevelUpdate = async (testResult: TestAttemptWithScoreSummary) => {
    try {
      if (!userInfo?.id || !testResult.attempt.isPass) return;

      // Check if this test is one level higher than user's current level
      const shouldUpdate = await isTestOneLevelHigher();
      if (!shouldUpdate) return;

      // Update user level to the test level they just passed
      await updateStudentLevel(userInfo.id, courseLevel.toString());
      
      success('Chúc mừng!', `Bạn đã lên cấp độ ${courseLevel}! Profile của bạn đã được cập nhật.`);
      
      // Notify parent component about level update
      if (onLevelUpdated) {
        onLevelUpdated();
      }
    } catch (error) {
      console.error('Failed to update user level:', error);
      // Don't show error to user as this is a background operation
    }
  };

  // Group questions by parts
  const groupQuestionsByParts = (questions: TestQuestionDto[]): TestPart[] => {
    console.log('Raw questions from API:', questions);
    
    const partsMap = new Map<number, TestPart>();
    
    questions.forEach(question => {
      const partNum = question.partNumber || 1;
      console.log(`Question ${question.questionNumber}: partNumber=${question.partNumber}, partDurationMinutes=${question.partDurationMinutes}`);
      
      if (!partsMap.has(partNum)) {
        partsMap.set(partNum, {
          partNumber: partNum,
          partName: `Part ${partNum}`,
          durationMinutes: question.partDurationMinutes || 30,
          questions: []
        });
      }
      partsMap.get(partNum)!.questions.push(question);
    });

    // Sort parts by part number and questions by question number
    const parts = Array.from(partsMap.values()).sort((a, b) => a.partNumber - b.partNumber);
    parts.forEach(part => {
      part.questions.sort((a, b) => a.questionNumber - b.questionNumber);
    });

    console.log('Grouped parts:', parts);
    return parts;
  };

  // Load question details
  const loadQuestion = async (questionId: string) => {
    try {
      const questionDetail = await getQuestionById(questionId);
      // Convert ChoiceReadDto to our format
      const convertedQuestion: QuestionWithChoices = {
        ...questionDetail,
        choices: questionDetail.choices?.map(choice => ({
          id: choice.choiceId,
          content: choice.content,
          isCorrect: choice.isCorrect
        }))
      };
      setCurrentQuestion(convertedQuestion);
    } catch (err) {
      console.error('Failed to load question:', err);
      error('Lỗi tải câu hỏi', 'Không thể tải chi tiết câu hỏi');
    }
  };

  // Timer effect for part time
  useEffect(() => {
    if (partTimeLeft > 0 && !isPartTimeUp) {
      const timer = setTimeout(() => {
        setPartTimeLeft(partTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (partTimeLeft === 0 && !isPartTimeUp) {
      setIsPartTimeUp(true);
      // Auto move to next part
      if (currentPartIndex < testParts.length - 1) {
        moveToNextPart();
      }
    }
  }, [partTimeLeft, isPartTimeUp, currentPartIndex, testParts.length]);

  // Timer effect for total time
  useEffect(() => {
    if (totalTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTotalTimeLeft(totalTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (totalTimeLeft === 0) {
      // Auto submit when time is up
      handleAutoSubmit();
    }
  }, [totalTimeLeft]);

  // Move to next part
  const moveToNextPart = useCallback(() => {
    if (currentPartIndex < testParts.length - 1) {
      const nextPartIndex = currentPartIndex + 1;
      const nextPart = testParts[nextPartIndex];
      
      setCurrentPartIndex(nextPartIndex);
      setCurrentQuestionIndex(0);
      setPartTimeLeft(nextPart.durationMinutes * 60);
      setIsPartTimeUp(false);
      
      // Load first question of next part
      if (nextPart.questions[0]) {
        loadQuestion(nextPart.questions[0].questionId);
      }
    }
  }, [currentPartIndex, testParts]);

  // Navigate to question (updated rule):
  // - User can move forward to any later part at any time
  // - Once moved to a later part, earlier parts are locked (cannot go back)
  const navigateToQuestion = async (partIndex: number, questionIndex: number) => {
    // If trying to go back to a previous part, always block
    if (partIndex < currentPartIndex) {
      error('Không thể quay lại', 'Bạn không thể quay lại phần đã hoàn thành.');
      return;
    }

    // Allow jumping forward to any later part anytime
    const question = testParts[partIndex]?.questions[questionIndex];
    if (question) {
      setCurrentPartIndex(partIndex);
      setCurrentQuestionIndex(questionIndex);
      // Reset timer when moving to a new part (only when changing part)
      if (partIndex !== currentPartIndex) {
        const nextPart = testParts[partIndex];
        setPartTimeLeft(nextPart.durationMinutes * 60);
        setIsPartTimeUp(false);
      }
      await loadQuestion(question.questionId);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (choiceId: string) => {
    if (!currentQuestion || !testAttempt) return;

    const questionId = currentQuestion.id;
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, choiceId);
    setUserAnswers(newAnswers);

    // Save answer to backend
    try {
      const attemptAnswer: CreateAttemptAnswerDto = {
        attemptId: testAttempt.attemptId,
        questionId: questionId,
        choiceId: choiceId
      };
      
      await addOrUpdateAttemptAnswer(attemptAnswer);
    } catch (err) {
      console.error('Failed to save answer:', err);
      // Don't show error to user, just log it
    }
  };

  // Handle test submission
  const handleSubmitTest = async () => {
    if (!testAttempt) return;

    setSubmitting(true);
    try {
      await submitTestAttempt({ attemptId: testAttempt.attemptId });
      
      // Get detailed result with score summary
      const result = await getTestAttemptWithScoreSummary(testAttempt.attemptId);
      setTestResult(result);
      
      // Auto update user level if they passed a higher level test
      await handleLevelUpdate(result);
      
      setShowResult(true);
      
      success('Nộp bài thành công', 'Bài thi của bạn đã được nộp và chấm điểm');
    } catch (err) {
      console.error('Failed to submit test:', err);
      error('Lỗi nộp bài', 'Không thể nộp bài thi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto submit when time is up
  const handleAutoSubmit = useCallback(async () => {
    if (testAttempt && !submitting) {
      try {
        await submitTestAttempt({ attemptId: testAttempt.attemptId });
        
        // Get detailed result with score summary
        const result = await getTestAttemptWithScoreSummary(testAttempt.attemptId);
        setTestResult(result);
        
        // Auto update user level if they passed a higher level test
        await handleLevelUpdate(result);
        
        setShowResult(true);
        
        success('Hết thời gian', 'Bài thi đã được tự động nộp');
      } catch (err) {
        console.error('Failed to auto submit test:', err);
        error('Lỗi tự động nộp bài', 'Không thể tự động nộp bài thi');
      }
    }
  }, [testAttempt, submitting, success, error, handleLevelUpdate]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize on mount
  useEffect(() => {
    initializeTest();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang khởi tạo bài thi...</p>
        </div>
      </div>
    );
  }

  // Show test result if available
  if (showResult && testResult) {
    return (
      <div className="min-h-screen bg-gray-50 font-inter">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kết quả bài thi</h1>
              <p className="text-gray-600">{test?.title}</p>
            </div>

            {/* Pass/Fail Status */}
            <div className={`text-center mb-8 p-6 rounded-lg ${
              testResult.attempt.isPass 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className={`text-4xl font-bold mb-2 ${
                testResult.attempt.isPass ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult.attempt.isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
              </div>
              <p className="text-gray-600">
                Tổng điểm: {testResult.scoreSummary.total_score}/{testResult.scoreSummary.total_max_score} 
                ({testResult.scoreSummary.total_max_score > 0 ? Math.round((testResult.scoreSummary.total_score / testResult.scoreSummary.total_max_score) * 100) : 0}%)
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Điểm chi tiết</h3>
                <div className="space-y-2">
                  {testResult.scoreSummary.vocab_max_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Từ vựng:</span>
                      <span className="font-medium">{testResult.scoreSummary.vocab_score}/{testResult.scoreSummary.vocab_max_score}</span>
                    </div>
                  )}
                  {testResult.scoreSummary.grammar_max_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngữ pháp:</span>
                      <span className="font-medium">{testResult.scoreSummary.grammar_score}/{testResult.scoreSummary.grammar_max_score}</span>
                    </div>
                  )}
                  {testResult.scoreSummary.reading_max_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đọc hiểu:</span>
                      <span className="font-medium">{testResult.scoreSummary.reading_score}/{testResult.scoreSummary.reading_max_score}</span>
                    </div>
                  )}
                  {testResult.scoreSummary.listening_max_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nghe hiểu:</span>
                      <span className="font-medium">{testResult.scoreSummary.listening_score}/{testResult.scoreSummary.listening_max_score}</span>
                    </div>
                  )}
                  {testResult.scoreSummary.kanji_max_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chữ Hán:</span>
                      <span className="font-medium">{testResult.scoreSummary.kanji_score}/{testResult.scoreSummary.kanji_max_score}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin bài thi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lần thi:</span>
                    <span className="font-medium">{testResult.attempt.attemptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian bắt đầu:</span>
                    <span className="font-medium">{new Date(testResult.attempt.startTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian kết thúc:</span>
                    <span className="font-medium">{new Date(testResult.attempt.endTime).toLocaleString('vi-VN')}</span>
                  </div>
                                     <div className="flex justify-between">
                     <span className="text-gray-600">Điểm đạt:</span>
                     <span className="font-medium">70%</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quay lại trang chủ
              </button>
              <button
                onClick={() => {
                  setShowResult(false);
                  setTestResult(null);
                  initializeTest();
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Làm bài thi khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test || !testAttempt || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Không thể tải bài thi</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const currentPart = testParts[currentPartIndex];
  const currentTestQuestion = currentPart?.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header with timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{test.title}</h1>
              <p className="text-sm text-gray-600">
                Part {currentPart?.partNumber} - Câu {currentTestQuestion?.questionNumber}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Part Timer */}
              <div className="text-center">
                <div className="text-sm text-gray-600">Thời gian Part {currentPart?.partNumber}</div>
                <div className={`text-lg font-semibold ${partTimeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                  <FaClock className="inline mr-2" />
                  {formatTime(partTimeLeft)}
                </div>
              </div>
              
              {/* Total Timer */}
              <div className="text-center">
                <div className="text-sm text-gray-600">Tổng thời gian</div>
                <div className={`text-lg font-semibold ${totalTimeLeft < 600 ? 'text-red-600' : 'text-green-600'}`}>
                  <FaClock className="inline mr-2" />
                  {formatTime(totalTimeLeft)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Danh sách câu hỏi</h3>
              
              {testParts.map((part, partIndex) => (
                <div key={part.partNumber} className="mb-4">
                  <div className={`font-medium text-sm mb-2 ${
                    partIndex === currentPartIndex ? 'text-blue-600' : 
                    partIndex < currentPartIndex ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    Part {part.partNumber} ({part.durationMinutes} phút)
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1">
                    {part.questions.map((question, questionIndex) => {
                      const isAnswered = userAnswers.has(question.questionId);
                      const isCurrent = partIndex === currentPartIndex && questionIndex === currentQuestionIndex;
                      // Allow current and future parts; lock previous parts
                      const canAccess = partIndex >= currentPartIndex;
                      
                      return (
                        <button
                          key={question.questionId}
                          onClick={() => navigateToQuestion(partIndex, questionIndex)}
                          disabled={!canAccess}
                          className={`
                            w-8 h-8 text-xs font-medium rounded transition-colors
                            ${isCurrent ? 'bg-blue-600 text-white' :
                              isAnswered ? 'bg-green-100 text-green-700 border border-green-300' :
                              canAccess ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                              'bg-gray-50 text-gray-400 cursor-not-allowed'}
                          `}
                        >
                          {question.questionNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
                             {/* Part Navigation Buttons */}
               {testParts.length > 1 && (
                 <div className="mt-4 space-y-2">
                   <h4 className="text-sm font-medium text-gray-700">Chuyển Part:</h4>
                   {testParts.map((part, partIndex) => (
                     <button
                       key={part.partNumber}
                       onClick={() => navigateToQuestion(partIndex, 0)}
                       disabled={partIndex < currentPartIndex}
                       className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                         partIndex === currentPartIndex
                           ? 'bg-blue-600 text-white'
                           : partIndex < currentPartIndex
                           ? 'bg-green-100 text-green-700 cursor-not-allowed'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                       title={partIndex < currentPartIndex ? 'Part đã hoàn thành' : `Chuyển tới Part ${part.partNumber}`}
                     >
                       Part {part.partNumber} ({part.durationMinutes} phút)
                     </button>
                   ))}
                 </div>
               )}
               
               <button
                 onClick={handleSubmitTest}
                 disabled={submitting}
                 className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
               >
                 {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
               </button>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Question Content */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Câu {currentTestQuestion?.questionNumber}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {currentQuestion.points} điểm
                  </span>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {currentQuestion.content}
                  </p>
                  
                  {/* Question attachments - Audio support */}
                  {currentQuestion.questionAttachments && currentQuestion.questionAttachments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {currentQuestion.questionAttachments.map((attachment, index) => (
                        <div key={index}>
                          {attachment.mediaType.startsWith('image/') ? (
                            <img 
                              src={attachment.mediaUrl} 
                              alt="Question attachment" 
                              className="max-w-full h-auto rounded-lg shadow-sm"
                            />
                          ) : attachment.mediaType.startsWith('audio/') ? (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <FaVolumeUp className="text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">Audio câu hỏi</span>
                                </div>
                                <button
                                  onClick={() => handlePlayAudio(attachment.mediaUrl)}
                                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                  title={playingAudio === attachment.mediaUrl ? "Tạm dừng" : "Phát audio"}
                                >
                                  {playingAudio === attachment.mediaUrl ? (
                                    <>
                                      <FaPause className="text-sm" />
                                      <span className="text-sm font-medium">Tạm dừng</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaPlay className="text-sm" />
                                      <span className="text-sm font-medium">Phát audio</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              {/* Progress bar */}
                              {(audioProgress.get(attachment.mediaUrl) || 0) > 0 && (
                                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${audioProgress.get(attachment.mediaUrl) || 0}%` }}
                                  ></div>
                                </div>
                              )}
                              
                              <p className="text-xs text-blue-600 mt-2">
                                💡 Nhấn nút phát để nghe audio trực tiếp trong trang
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <a 
                                href={attachment.mediaUrl} 
                                download
                                className="text-blue-600 hover:underline flex items-center gap-2"
                              >
                                📎 Tải tài liệu đính kèm ({attachment.mediaType})
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Choices */}
              <div className="space-y-3">
                {currentQuestion.choices?.map((choice, index) => {
                  const isSelected = userAnswers.get(currentQuestion.id) === choice.id;
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(choice.id)}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-colors
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-900' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`
                          flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                          ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}
                        `}>
                          {letter}
                        </span>
                        <span className="flex-1">{choice.content}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      navigateToQuestion(currentPartIndex, currentQuestionIndex - 1);
                    } else if (currentPartIndex > 0) {
                      const prevPart = testParts[currentPartIndex - 1];
                      navigateToQuestion(currentPartIndex - 1, prevPart.questions.length - 1);
                    }
                  }}
                  disabled={currentPartIndex === 0 && currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <FaArrowLeft />
                  Câu trước
                </button>

                <div className="text-sm text-gray-600">
                  {userAnswers.size} / {testQuestions.length} câu đã trả lời
                </div>

                <button
                  onClick={() => {
                      const currentPartQuestions = currentPart.questions;
                      if (currentQuestionIndex < currentPartQuestions.length - 1) {
                      navigateToQuestion(currentPartIndex, currentQuestionIndex + 1);
                      } else if (currentPartIndex < testParts.length - 1) {
                      navigateToQuestion(currentPartIndex + 1, 0);
                      }
                  }}
                  disabled={
                    currentPartIndex === testParts.length - 1 && 
                    currentQuestionIndex === currentPart.questions.length - 1
                  }
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Câu sau
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JLPTTestInterface;
