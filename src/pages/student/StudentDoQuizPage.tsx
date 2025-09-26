import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../components/notifications";
import { useAuth } from "../../auth/AuthContext";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import {
  getRandomQuestionsWithChoices,
  GetRandomQuestionsRequestDto,
  RandomQuestionWithChoicesDto
} from "../../services/randomQuestionService";
import {
  ContentName,
  CourseLevel,
  SubContentName
} from "../../types/question.types";

const StudentDoQuizPage: React.FC = () => {
  const { userInfo } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  // Quiz setup states
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [selectedContentName, setSelectedContentName] = useState<ContentName>(ContentName.Vocabulary);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(CourseLevel.N5);
  const [selectedSubContentName, setSelectedSubContentName] = useState<SubContentName>(SubContentName.Mondai1);
  
  // Quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<RandomQuestionWithChoicesDto[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

  // Labels for display
  const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
    [CourseLevel.N5]: "N5",
    [CourseLevel.N4]: "N4",
    [CourseLevel.N3]: "N3",
    [CourseLevel.N2]: "N2",
    [CourseLevel.N1]: "N1",
  };

  const CONTENT_NAME_LABELS: Record<ContentName, string> = {
    [ContentName.Kanji]: "Chữ Hán",
    [ContentName.Vocabulary]: "Từ Vựng",
    [ContentName.Grammar]: "Ngữ Pháp",
    [ContentName.Reading]: "Đọc Hiểu",
    [ContentName.Listening]: "Nghe Hiểu",
    [ContentName.Writing]: "Viết", // Added for completeness but not shown in UI
  };

  const SUBCONTENT_NAME_LABELS: Record<SubContentName, string> = {
    [SubContentName.Mondai1]: "Đọc chữ Hán",
    [SubContentName.Mondai2]: "Nhớ chữ Hán",
    [SubContentName.Mondai3]: "Chọn từ phù hợp với câu",
    [SubContentName.Mondai4]: "Tìm câu có cách diễn đạt giống",
    [SubContentName.Mondai5]: "Chọn ngữ pháp phù hợp với câu",
    [SubContentName.Mondai6]: "Sắp xếp câu",
    [SubContentName.Mondai7]: "Tìm đáp án đúng để hoàn thành đoạn văn",
    [SubContentName.Mondai8]: "Đoạn văn ngắn",
    [SubContentName.Mondai9]: "Trung văn",
    [SubContentName.Mondai10]: "Tìm kiếm thông tin",
    [SubContentName.Mondai11]: "Hiểu đề bài",
    [SubContentName.Mondai12]: "Hiểu điểm chính",
    [SubContentName.Mondai13]: "Diễn đạt bằng lời nói",
    [SubContentName.Mondai14]: "Phản hồi tức thời",
    [SubContentName.Mondai15]: "Viết đoạn văn ngắn", // Added for completeness but won't be used in UI
  };

  // Define which ContentName values to show in UI (excluding Writing)
  const AVAILABLE_CONTENT_NAMES = [
    ContentName.Kanji,
    ContentName.Vocabulary,
    ContentName.Grammar,
    ContentName.Reading,
    ContentName.Listening
    // ContentName.Writing is intentionally excluded
  ];

  // Get subcontent options based on selected content
  const getSubContentOptions = (contentName: ContentName): SubContentName[] => {
    switch (contentName) {
      case ContentName.Kanji:
        return [SubContentName.Mondai1, SubContentName.Mondai2];
      case ContentName.Vocabulary:
        return [SubContentName.Mondai3, SubContentName.Mondai4];
      case ContentName.Grammar:
        return [SubContentName.Mondai5, SubContentName.Mondai6, SubContentName.Mondai7];
      case ContentName.Reading:
        return [SubContentName.Mondai8, SubContentName.Mondai9, SubContentName.Mondai10];
      case ContentName.Listening:
        return [SubContentName.Mondai11, SubContentName.Mondai12, SubContentName.Mondai13, SubContentName.Mondai14];
      default:
        return [SubContentName.Mondai1];
    }
  };

  // Update subcontent when content changes
  useEffect(() => {
    const availableSubContents = getSubContentOptions(selectedContentName);
    if (!availableSubContents.includes(selectedSubContentName)) {
      setSelectedSubContentName(availableSubContents[0]);
    }
  }, [selectedContentName, selectedSubContentName]);

  const handleStartQuiz = async () => {
    if (!userInfo?.id) {
      error("Lỗi", "Bạn cần đăng nhập để làm quiz");
      return;
    }

    setLoading(true);
    try {
      const requestDto: GetRandomQuestionsRequestDto = {
        numberOfQuestions,
        contentName: selectedContentName,
        level: selectedLevel,
        subContentName: selectedSubContentName
      };

      const randomQuestions = await getRandomQuestionsWithChoices(requestDto);
      
      if (randomQuestions.length === 0) {
        error("Không có câu hỏi", "Không tìm thấy câu hỏi phù hợp với bộ lọc đã chọn");
        return;
      }

      setQuestions(randomQuestions);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedChoice(null);
      setShowAnswer(false);
      setUserAnswers({});
      setScore(0);
      setShowResults(false);
      
      success("Thành công", `Đã tải ${randomQuestions.length} câu hỏi`);
    } catch (err: any) {
      console.error("Error starting quiz:", err);
      
      // Check if it's a 400 error (Bad Request)
      if (err.response?.status === 400) {
        error("Không có câu hỏi", "Ngân hàng câu hỏi hiện chưa có những câu hỏi này");
      } else {
        error("Lỗi", "Không thể tải câu hỏi. Vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowAnswer(true);
    
    // Save user answer
    const newUserAnswers = { ...userAnswers };
    newUserAnswers[currentQuestionIndex] = choiceId;
    setUserAnswers(newUserAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(userAnswers[currentQuestionIndex + 1] || null);
      setShowAnswer(!!userAnswers[currentQuestionIndex + 1]);
    } else {
      // Show results when reaching the end
      calculateScore();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedChoice(userAnswers[currentQuestionIndex - 1] || null);
      setShowAnswer(!!userAnswers[currentQuestionIndex - 1]);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const userAnswerId = userAnswers[index];
      const correctChoice = question.choices.find((choice: any) => choice.isCorrect);
      if (userAnswerId === correctChoice?.choiceId) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const handleExitQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedChoice(null);
    setShowAnswer(false);
    setUserAnswers({});
    setScore(0);
    setShowResults(false);
  };

  const handleRestartQuiz = () => {
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setSelectedChoice(null);
    setShowAnswer(false);
    setUserAnswers({});
    setScore(0);
  };

  // Quiz setup interface
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 font-inter flex flex-col lg:flex-row">
        <StudentSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <StudentHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4 transition-colors"
              >
                <FaArrowLeft />
                Quay lại
              </button>
              <h1 className="text-3xl font-bold text-green-800">Quiz Tiếng Nhật</h1>
              <p className="text-green-600 mt-2">Chọn cấu hình quiz và bắt đầu luyện tập</p>
            </div>

            {/* Quiz Configuration */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Cấu hình Quiz</h2>
              
              <div className="space-y-6">
                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số câu hỏi (5-20)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Course Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(parseInt(e.target.value) as CourseLevel)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Object.entries(COURSE_LEVEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung
                  </label>
                  <select
                    value={selectedContentName}
                    onChange={(e) => setSelectedContentName(parseInt(e.target.value) as ContentName)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {AVAILABLE_CONTENT_NAMES.map(contentName => (
                      <option key={contentName} value={contentName}>
                        {CONTENT_NAME_LABELS[contentName]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SubContent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bài
                  </label>
                  <select
                    value={selectedSubContentName}
                    onChange={(e) => setSelectedSubContentName(parseInt(e.target.value) as SubContentName)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {getSubContentOptions(selectedContentName).map((subContent) => (
                      <option key={subContent} value={subContent}>
                        {SUBCONTENT_NAME_LABELS[subContent]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Quiz Button */}
                <button
                  onClick={handleStartQuiz}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      Bắt đầu Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 font-inter flex flex-col lg:flex-row">
        <StudentSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <StudentHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">
                  {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "😔"}
                </div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">Kết quả Quiz</h2>
                <p className="text-gray-600">Bạn đã hoàn thành quiz!</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-blue-800 mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {percentage}%
                </div>
                <div className="text-blue-600">
                  {percentage >= 80 ? "Xuất sắc!" : percentage >= 60 ? "Tốt!" : "Cần cải thiện"}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleRestartQuiz}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Xem lại câu hỏi
                </button>
                <button
                  onClick={handleExitQuiz}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all"
                >
                  Làm quiz mới
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 font-inter flex flex-col lg:flex-row">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100 max-w-4xl mx-auto">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex justify-between items-center text-white">
                <button
                  onClick={handleExitQuiz}
                  className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-all"
                >
                  <FaArrowLeft />
                  Quay lại
                </button>
                <div className="text-lg font-semibold bg-white bg-opacity-20 px-4 py-2 rounded-xl">
                  📝 Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-medium"
                >
                  <span>← Trước</span>
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-medium"
                >
                  <span>{currentQuestionIndex === questions.length - 1 ? "Kết thúc" : "Tiếp →"}</span>
                </button>
              </div>

              {questions[currentQuestionIndex] && (
                <div className="space-y-8">
                  {/* Question */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <span>❓</span> Câu hỏi {currentQuestionIndex + 1}
                    </h3>
                    <p className="text-gray-800 text-xl leading-relaxed font-medium">
                      {questions[currentQuestionIndex].questionText}
                    </p>
                  </div>

                  {/* Choices */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <span>📝</span> Chọn đáp án:
                    </h4>
                    {questions[currentQuestionIndex].choices.map((choice: any, index: number) => {
                      const isSelected = selectedChoice === choice.choiceId;
                      const isCorrect = choice.isCorrect;
                      let choiceStyle = "p-6 border-2 border-gray-200 rounded-2xl hover:border-green-300 cursor-pointer transition-all transform hover:scale-102 shadow-md hover:shadow-lg";
                      
                      if (showAnswer) {
                        if (isCorrect) {
                          choiceStyle = "p-6 border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl transition-all shadow-lg";
                        } else if (isSelected && !isCorrect) {
                          choiceStyle = "p-6 border-2 border-red-500 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl transition-all shadow-lg";
                        } else {
                          choiceStyle = "p-6 border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl opacity-60 transition-all";
                        }
                      } else if (isSelected) {
                        choiceStyle = "p-6 border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl transition-all shadow-lg transform scale-102";
                      }

                      return (
                        <div
                          key={choice.choiceId}
                          className={choiceStyle}
                          onClick={() => !showAnswer && handleChoiceSelect(choice.choiceId)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                              showAnswer 
                                ? (isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-gray-300 text-gray-500')
                                : (isSelected ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white text-gray-500')
                            }`}>
                              {showAnswer && isCorrect && (
                                <span className="text-lg">✓</span>
                              )}
                              {isSelected && !showAnswer && (
                                <span className="text-lg">•</span>
                              )}
                              {!isSelected && !showAnswer && (
                                <span className="text-sm">{String.fromCharCode(65 + index)}</span>
                              )}
                            </div>
                            <span className="text-gray-800 text-lg font-medium">
                              <span className="font-bold text-green-600">{String.fromCharCode(65 + index)}.</span> {choice.content}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer feedback */}
                  {showAnswer && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {selectedChoice === questions[currentQuestionIndex].choices.find((c: any) => c.isCorrect)?.choiceId ? "🎉" : "❌"}
                        </div>
                        <div>
                          <div className="font-bold text-blue-800 text-lg">
                            {selectedChoice === questions[currentQuestionIndex].choices.find((c: any) => c.isCorrect)?.choiceId 
                              ? "Chính xác!" 
                              : "Chưa đúng"}
                          </div>
                          {questions[currentQuestionIndex].explanation && (
                            <p className="text-blue-700 mt-2">
                              <strong>Giải thích:</strong> {questions[currentQuestionIndex].explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDoQuizPage;
