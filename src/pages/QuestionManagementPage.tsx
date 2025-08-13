import React, { useEffect, useState } from "react";
import { getAllQuestions, getActiveQuestions, getQuestionsPagingDetails, toggleQuestionActiveStatus, getQuestionById, getChoicesByQuestionId } from "../services/questionService";
import { QuestionDto, QuestionDifficulty, ContentName, CourseLevel } from "../types/question.types";
import { ChoiceReadDto } from "../types/choice.types";

import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/notifications";
import paths from "../routes/path";
import { useAuth } from "../auth/AuthContext";
import StudentSideBar from "../components/sidebar/StudentSideBar";
import StaffSidebar from "../components/sidebar/StaffSidebar";

// Extended interface for editing questions - no longer needed for inline editing
// interface EditingQuestion extends Omit<QuestionDto, 'contentName' | 'level' | 'subContentName'> {
//   contentName: ContentName;
//   level: CourseLevel;
//   subContentName: string;
//   contentNameDisplay?: string;
//   levelDisplay?: string;
//   subContentNameDisplay?: string;
// }

const QuestionManagementPage: React.FC = () => {
  const { userInfo } = useAuth();
  const isStaff = userInfo?.roleName === "ACADEMIC_MANAGER";
  const { success, error, warning } = useNotification();
  
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty[]>([]);
  const [contentName, setContentName] = useState<ContentName[]>([]);
  const [courseLevel, setCourseLevel] = useState<CourseLevel[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Edit states - no longer needed for inline editing
  // const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null);
  // const [editingChoices, setEditingChoices] = useState<ChoiceReadDto[]>([]);
  // const [editLoading, setEditLoading] = useState(false);
  
  // Quiz mode states (for Student role)
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuestionDto[]>([]);
  const [quizChoices, setQuizChoices] = useState<ChoiceReadDto[][]>([]);
  
  const navigate = useNavigate();

  const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
    [QuestionDifficulty.Easy]: "Dễ",
    [QuestionDifficulty.Medium]: "Trung bình",
    [QuestionDifficulty.Hard]: "Khó",
  };
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
  };

  // Helper function to safely get content name label
  const getContentNameLabel = (contentNameEnum: ContentName | number): string => {
    try {
      // Handle both enum and number inputs
      const enumValue = typeof contentNameEnum === 'number' ? contentNameEnum : Number(contentNameEnum);
      
      // Check if it's a valid enum value
      if (isNaN(enumValue) || enumValue < 0 || enumValue > 4) {
        console.warn("Invalid contentName value:", contentNameEnum);
        return "Unknown";
      }
      
      return CONTENT_NAME_LABELS[enumValue as ContentName] || "Unknown";
    } catch (error) {
      console.error("Error in getContentNameLabel:", error, contentNameEnum);
      return "Unknown";
    }
  };

  // Fetch questions (with filter)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // Reset quiz mode when filters change
        if (quizMode) {
          handleExitQuiz();
        }
        
        // Students only see active questions, staff see all questions
        const fetchFunction = isStaff ? getAllQuestions : getActiveQuestions;
        
        // Lấy tất cả câu hỏi trước
        const allQuestions = await fetchFunction();
        
        // Debug: Log first question to check data structure
        if (allQuestions.length > 0) {
          console.log("Sample question data:", allQuestions[0]);
        }
        
        let filteredQuestions = allQuestions;
        
        // Áp dụng filter nếu có
        if (difficulty.length > 0 || courseLevel.length > 0 || contentName.length > 0) {
          
          // Filter theo difficulty
          if (difficulty.length > 0) {
            filteredQuestions = filteredQuestions.filter(q => difficulty.includes(q.difficulty));
          }
          
          // Filter theo courseLevel (level)
          if (courseLevel.length > 0) {
            filteredQuestions = filteredQuestions.filter(q => {
              // So sánh với string value từ API
              return courseLevel.some(level => {
                const levelStr = COURSE_LEVEL_LABELS[level];
                return levelStr === CourseLevel[q.level] || levelStr === q.level?.toString();
              });
            });
          }
          
          // Filter theo contentName
          if (contentName.length > 0) {
            filteredQuestions = filteredQuestions.filter(q => {
              return contentName.some(cn => {
                const contentStr = CONTENT_NAME_LABELS[cn];
                
                // So sánh với enum number value
                if (typeof q.contentName === 'number' && q.contentName === cn) {
                  return true;
                }
                
                // So sánh với string description (case insensitive)
                if (typeof q.contentName === 'string') {
                  const questionContentName = q.contentName as string;
                  // Check exact description match
                  if (contentStr.toLowerCase() === questionContentName.toLowerCase()) {
                    return true;
                  }
                  
                  // Check if it's a parsed number
                  const parsed = parseInt(questionContentName);
                  if (!isNaN(parsed) && parsed === cn) {
                    return true;
                  }
                }
                
                return false;
              });
            });
          }
        }
        
        // Fetch attachments cho tất cả câu hỏi (đã filter hoặc chưa filter)
        const questionsWithAttachments = await Promise.all(
          filteredQuestions.map(async (question) => {
            try {
              const questionWithAttachments = await getQuestionById(question.id);
              return questionWithAttachments;
            } catch (error) {
              console.error(`Error fetching attachments for question ${question.id}:`, error);
              return question; // Return original question if attachment fetch fails
            }
          })
        );
        
        setQuestions(questionsWithAttachments);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [difficulty, courseLevel, contentName, isStaff]);

  const handleCreateQuestion = () => {
    navigate(paths.create_question);
  };

  // Edit functions - navigate to EditQuestionPage
  const handleEditQuestion = async (question: QuestionDto) => {
    // Navigate to edit question page using paths
    navigate(`/edit-question/${question.id}`);
  };

  const handleToggleActiveStatus = async (questionId: string, currentStatus: boolean) => {
    try {
      // Fix: Pass the new status as a boolean value, not an object
      const updatedQuestion = await toggleQuestionActiveStatus(questionId, !currentStatus);
      
      // Update the questions list with the new status
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, isActive: updatedQuestion.isActive } : q
      ));
      
      success(`Câu hỏi đã được ${updatedQuestion.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công!`);
    } catch (err: any) {
      console.error("Error toggling question status:", err);
      
      // Enhanced error handling
      if (err?.response?.status === 415) {
        error("Lỗi định dạng dữ liệu", "Server không hỗ trợ định dạng dữ liệu được gửi");
      } else if (err?.response?.data?.message) {
        error("Lỗi", err.response.data.message);
      } else {
        error("Có lỗi xảy ra khi thay đổi trạng thái câu hỏi");
      }
    }
  };

  // Quiz mode functions (for Student role)
  const handleStartQuiz = async (questions: QuestionDto[]) => {
    try {
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setSelectedChoice(null);
      setShowAnswer(false);
      setQuizMode(true);
      
      // Fetch choices for all questions
      const allChoices: ChoiceReadDto[][] = [];
      for (const question of questions) {
        const choices = await getChoicesByQuestionId(question.id);
        allChoices.push(choices);
      }
      setQuizChoices(allChoices);
          } catch (err) {
        console.error("Error starting quiz:", err);
        error("Không thể tải câu hỏi");
      }
  };

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null);
      setShowAnswer(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedChoice(null);
      setShowAnswer(false);
    }
  };

  const handleExitQuiz = () => {
    setQuizMode(false);
    setQuizQuestions([]);
    setQuizChoices([]);
    setCurrentQuestionIndex(0);
    setSelectedChoice(null);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-inter relative">
      {/* Hover trigger area for sidebar */}
      <div 
        className="fixed left-0 top-0 w-2 h-full z-40"
        onMouseEnter={() => setSidebarVisible(true)}
        onMouseLeave={() => setSidebarVisible(false)}
      />
      
      {/* Sliding Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={() => setSidebarVisible(true)}
        onMouseLeave={() => setSidebarVisible(false)}
      >
        {isStaff ? <StaffSidebar /> : <StudentSideBar />}
      </div>

      {/* Overlay when sidebar is visible */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar filter */}
      <aside className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col gap-8">
        {isStaff && (
          <button
            onClick={() => navigate(paths.staff_sub_content_management)}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
          >
            <span>Quản lý cấu trúc câu hỏi</span>
          </button>
        )}
        <div>
          <h3 className="text-lg font-bold mb-3 text-gray-800">Lọc theo độ khó</h3>
          <div className="flex flex-col gap-2">
            {Object.keys(QuestionDifficulty)
              .filter(k => isNaN(Number(k)))
              .map((key) => {
                const value = QuestionDifficulty[key as keyof typeof QuestionDifficulty] as unknown as QuestionDifficulty;
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={difficulty.includes(value)}
                      onChange={() => setDifficulty(difficulty.includes(value) ? difficulty.filter(d => d !== value) : [...difficulty, value])}
                    />
                    <span>{DIFFICULTY_LABELS[value]}</span>
                  </label>
                );
              })}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={difficulty.length === 0} onChange={() => setDifficulty([])} />
              <span>Tất cả</span>
            </label>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-3 text-gray-800">Lọc theo cấp độ</h3>
          <div className="flex flex-col gap-2 mb-4">
            {Object.keys(CourseLevel)
              .filter(k => isNaN(Number(k)))
              .map((key) => {
                const value = CourseLevel[key as keyof typeof CourseLevel] as unknown as CourseLevel;
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseLevel.includes(value)}
                      onChange={() => setCourseLevel(courseLevel.includes(value) ? courseLevel.filter(l => l !== value) : [...courseLevel, value])}
                    />
                    <span>{COURSE_LEVEL_LABELS[value]}</span>
                  </label>
                );
              })}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={courseLevel.length === 0} onChange={() => setCourseLevel([])} />
              <span>Tất cả</span>
            </label>
          </div>
          <h4 className="text-md font-semibold mb-2 text-gray-700">Lọc theo nội dung</h4>
          {/* ContentName filter - chỉ hiển thị contentName, không có subcontent */}
          {Object.keys(ContentName)
            .filter(k => isNaN(Number(k)))
            .map((key) => {
              const value = ContentName[key as keyof typeof ContentName] as unknown as ContentName;
              const isContentSelected = contentName.includes(value);
              
              return (
                <div key={key} className="mb-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={isContentSelected}
                      onChange={() => {
                        if (contentName.includes(value)) {
                          setContentName(contentName.filter(c => c !== value));
                        } else {
                          setContentName([...contentName, value]);
                        }
                      }}
                    />
                    <span>{CONTENT_NAME_LABELS[value]}</span>
                  </label>
                </div>
              );
            })}
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={contentName.length === 0} 
              onChange={() => {
                setContentName([]);
              }} 
            />
            <span>Tất cả</span>
          </label>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(isStaff ? paths.staff_home : paths.student_home)} 
            className="flex items-center text-gray-600 hover:text-green-700"
          >
            <FaArrowLeft className="mr-2" /> 
            Quay lại trang chủ
          </button>
          <div className="flex gap-2">
            {!isStaff && questions.length > 0 && (
              <button
                onClick={() => handleStartQuiz(questions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                <span>Bắt đầu làm bài</span>
              </button>
            )}
            {isStaff && (
              <button
                onClick={handleCreateQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                <FaPlus className="text-sm" />
                Tạo câu hỏi mới
              </button>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isStaff ? "Quản lý câu hỏi" : "Xem câu hỏi"}
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
            <span className="ml-4 text-gray-600">Đang tải câu hỏi...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">Không có câu hỏi nào.</div>
        ) : !quizMode ? (
          <div className="bg-white rounded-xl shadow p-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left">Nội dung</th>
                  <th className="py-2 px-3 text-left">Độ khó</th>
                  <th className="py-2 px-3 text-left">Loại câu hỏi</th>
                  <th className="py-2 px-3 text-left">Điểm</th>
                  <th className="py-2 px-3 text-left">Audio</th>
                  {isStaff && <th className="py-2 px-3">Trạng thái</th>}
                  {isStaff && <th className="py-2 px-3">Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr 
                    key={q.id} 
                    className={`border-b hover:bg-gray-50 ${!isStaff ? 'cursor-pointer' : ''}`}
                    onClick={!isStaff ? () => handleStartQuiz([q]) : undefined}
                  >
                    <td className="py-2 px-3 max-w-xs truncate" title={q.content}>{q.content}</td>
                    <td className="py-2 px-3">{DIFFICULTY_LABELS[q.difficulty]}</td>
                    <td className="py-2 px-3">
                      {(() => {
                        // API có thể trả về description string thay vì enum number
                        // Nếu contentName là string description, map ngược lại
                        if (typeof q.contentName === 'string') {
                          // Check if it's already a description
                          const reverseMapping: Record<string, string> = {
                            "Chữ Hán": "Chữ Hán",
                            "Từ Vựng": "Từ Vựng", 
                            "Ngữ Pháp": "Ngữ Pháp",
                            "Đọc Hiểu": "Đọc Hiểu",
                            "Nghe Hiểu": "Nghe Hiểu",
                            "Kanji": "Chữ Hán",
                            "Vocabulary": "Từ Vựng",
                            "Grammar": "Ngữ Pháp", 
                            "Reading": "Đọc Hiểu",
                            "Listening": "Nghe Hiểu"
                          };
                          
                          if (reverseMapping[q.contentName]) {
                            return reverseMapping[q.contentName];
                          }
                          
                          // If not found in mapping, try parsing as number
                          const parsed = parseInt(q.contentName);
                          if (!isNaN(parsed)) {
                            return getContentNameLabel(parsed as ContentName);
                          }
                          
                          // Return as-is if nothing works
                          return q.contentName;
                        } else if (typeof q.contentName === 'number') {
                          return getContentNameLabel(q.contentName as ContentName);
                        }
                        
                        return "Unknown";
                      })()}
                    </td>
                    <td className="py-2 px-3">{q.points}</td>
                    <td className="py-2 px-3">
                      {/* Audio Player */}
                      {q.questionAttachments && q.questionAttachments.length > 0 && 
                       q.questionAttachments.some(att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/')) ? (
                        <div className="flex items-center space-x-2">
                          <audio 
                            controls 
                            className="h-8 w-32"
                            preload="none"
                          >
                            {q.questionAttachments
                              .filter(att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/'))
                              .map((att, index) => (
                                <source key={index} src={att.mediaUrl} type="audio/mpeg" />
                              ))
                            }
                            Trình duyệt của bạn không hỗ trợ phát audio.
                          </audio>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Không có audio</span>
                      )}
                    </td>
                    {isStaff && (
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          q.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {q.isActive ? 'Hoạt động' : 'Vô hiệu'}
                        </span>
                      </td>
                    )}
                    {isStaff && (
                      <td className="py-2 px-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuestion(q);
                          }}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActiveStatus(q.id, q.isActive);
                          }}
                          className={`mr-2 ${q.isActive ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                        >
                          {q.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                        {/* <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(q.id);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button> */}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        
        {/* Quiz Interface (for Student role) */}
        {quizMode && quizQuestions.length > 0 && (
          <div className="bg-white rounded-xl shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleExitQuiz}
                className="flex items-center text-gray-600 hover:text-green-700"
              >
                <FaArrowLeft className="mr-2" />
                Quay lại danh sách
              </button>
              <div className="text-sm text-gray-500">
                Câu hỏi {currentQuestionIndex + 1} / {quizQuestions.length}
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>← Trước</span>
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quizQuestions.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Tiếp →</span>
              </button>
            </div>

            {quizQuestions[currentQuestionIndex] && quizChoices[currentQuestionIndex] && (
              <div className="space-y-6">
                {/* Question */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Câu hỏi {currentQuestionIndex + 1}
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {quizQuestions[currentQuestionIndex].content}
                  </p>
                </div>

                {/* Choices */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Chọn đáp án:
                  </h4>
                  {quizChoices[currentQuestionIndex].map((choice, index) => {
                    const isSelected = selectedChoice === choice.choiceId;
                    const isCorrect = choice.isCorrect;
                    let choiceStyle = "p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all";
                    
                    if (showAnswer) {
                      if (isCorrect) {
                        choiceStyle = "p-4 border-2 border-green-500 bg-green-50 rounded-lg transition-all";
                      } else if (isSelected && !isCorrect) {
                        choiceStyle = "p-4 border-2 border-red-500 bg-red-50 rounded-lg transition-all";
                      } else {
                        choiceStyle = "p-4 border-2 border-gray-200 bg-gray-50 rounded-lg opacity-60 transition-all";
                      }
                    } else if (isSelected) {
                      choiceStyle = "p-4 border-2 border-blue-500 bg-blue-50 rounded-lg transition-all";
                    }

                    return (
                      <div
                        key={choice.choiceId}
                        className={choiceStyle}
                        onClick={() => !showAnswer && handleChoiceSelect(choice.choiceId)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            showAnswer 
                              ? (isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-gray-300')
                              : (isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300')
                          }`}>
                            {showAnswer && isCorrect && (
                              <span className="text-white text-sm">✓</span>
                            )}
                            {isSelected && !showAnswer && (
                              <span className="text-white text-sm">•</span>
                            )}
                          </div>
                          <span className="text-gray-700 text-lg">
                            {String.fromCharCode(65 + index)}. {choice.content}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Answer feedback */}
                {showAnswer && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      {selectedChoice === quizChoices[currentQuestionIndex].find(c => c.isCorrect)?.choiceId
                        ? "🎉 Chính xác! Bạn đã trả lời đúng."
                        : "❌ Sai rồi! Hãy thử lại hoặc xem đáp án đúng."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionManagementPage;