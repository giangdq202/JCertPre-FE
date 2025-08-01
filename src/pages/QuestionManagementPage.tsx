import React, { useEffect, useState } from "react";
import { getAllQuestions, getActiveQuestions, getQuestionsPagingDetails, QuestionDto, QuestionDifficulty, ContentName, SubContentName, CourseLevel, updateQuestion, updateChoice, getChoicesByQuestionId, ChoiceReadDto, toggleQuestionActiveStatus } from "../services/questionService";
import { getAllSubContents, SubContentDto } from "../services/subContentService";
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import paths from "../routes/path";
import { useAuth } from "../auth/AuthContext";
import StudentSideBar from "../components/sidebar/StudentSideBar";
import StaffSidebar from "../components/sidebar/StaffSidebar";

const QuestionManagementPage: React.FC = () => {
  const { userInfo } = useAuth();
  const isStaff = userInfo?.roleName === "ACADEMIC_MANAGER";
  
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty[]>([]);
  const [contentName, setContentName] = useState<ContentName[]>([]);
  const [courseLevel, setCourseLevel] = useState<CourseLevel[]>([]);
  const [subContentName, setSubContentName] = useState<SubContentName[]>([]);
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Edit inline states
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null);
  const [editingChoices, setEditingChoices] = useState<ChoiceReadDto[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  
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
    [ContentName.Vocabulary]: "Từ vựng",
    [ContentName.Grammar]: "Ngữ pháp",
    [ContentName.Reading]: "Đọc hiểu",
    [ContentName.Listening]: "Nghe hiểu",
  };

  // Mapping ContentName to SubContentName
  const CONTENT_SUBCONTENT_MAPPING: Record<ContentName, SubContentName[]> = {
    [ContentName.Kanji]: [SubContentName.Mondai1, SubContentName.Mondai2],
    [ContentName.Vocabulary]: [SubContentName.Mondai3, SubContentName.Mondai4],
    [ContentName.Grammar]: [SubContentName.Mondai5, SubContentName.Mondai6, SubContentName.Mondai7],
    [ContentName.Reading]: [SubContentName.Mondai8, SubContentName.Mondai9, SubContentName.Mondai10],
    [ContentName.Listening]: [SubContentName.Mondai11, SubContentName.Mondai12, SubContentName.Mondai13, SubContentName.Mondai14]
  };

  // SubContentName labels
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
    [SubContentName.Mondai14]: "Phản hồi tức thời"
  };

  // Fetch subcontents theo tổ hợp contentName + courseLevel
  useEffect(() => {
    const fetchSubContents = async () => {
      try {
        let all: SubContentDto[] = [];
        if (contentName.length === 0 && courseLevel.length === 0) {
          const data = await getAllSubContents();
          all = data.items;
        } else {
          // Lấy tất cả tổ hợp contentName + courseLevel
          for (const cName of (contentName.length ? contentName : Object.values(ContentName))) {
            for (const cLevel of (courseLevel.length ? courseLevel : Object.values(CourseLevel))) {
              const data = await getAllSubContents(undefined, cLevel as CourseLevel, cName as ContentName);
              all = all.concat(data.items);
            }
          }
        }
        setSubContents(all);
      } catch {
        setSubContents([]);
      }
    };
    fetchSubContents();
  }, [contentName, courseLevel]);

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
        
        // Nếu không có filter nào được chọn, lấy tất cả
        if (difficulty.length === 0 && subContentName.length === 0 && courseLevel.length === 0 && contentName.length === 0) {
          const data = await fetchFunction();
          setQuestions(data);
        } else {
          // Nếu có filter, sử dụng client-side filtering
          const allQuestions = await fetchFunction();
          let filteredQuestions = allQuestions;
          
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
                return levelStr === q.level || levelStr === q.levelDescription;
              });
            });
          }
          
          // Filter theo contentName
          if (contentName.length > 0) {
            filteredQuestions = filteredQuestions.filter(q => {
              // So sánh với string value từ API (không phân biệt hoa thường)
              return contentName.some(cn => {
                const contentStr = CONTENT_NAME_LABELS[cn];
                return contentStr.toLowerCase() === q.contentName?.toLowerCase() || 
                       contentStr.toLowerCase() === q.contentNameDescription?.toLowerCase();
              });
            });
          }
          
          // Filter theo subContentName
          if (subContentName.length > 0) {
            filteredQuestions = filteredQuestions.filter(q => {
              // So sánh với string value từ API (không phân biệt hoa thường)
              return subContentName.some(scn => {
                const subContentStr = SUBCONTENT_NAME_LABELS[scn];
                return subContentStr.toLowerCase() === q.subContentName?.toLowerCase() || 
                       subContentStr.toLowerCase() === q.subContentNameDescription?.toLowerCase();
              });
            });
          }
          
          setQuestions(filteredQuestions);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [difficulty, subContentName, courseLevel, contentName, isStaff]);

  // Filtered subcontent chỉ lấy unique subContentName
  const filteredSubContents = Array.from(new Map(subContents.map(sc => [sc.subContentName, sc])).values());

  const handleCreateQuestion = () => {
    navigate(paths.create_question);
  };

  // Edit inline functions
  const handleEditQuestion = async (question: QuestionDto) => {
    try {
      setEditLoading(true);
      const choices = await getChoicesByQuestionId(question.id);
      setEditingChoices(choices);
      setEditingQuestion(question);
    } catch (error) {
      console.error("Error fetching choices:", error);
      alert("Không thể tải thông tin câu hỏi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditingChoices([]);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    
    try {
      setEditLoading(true);
      
      // Map string values to enum values
      const mapContentNameToEnum = (contentNameStr: string): ContentName => {
        // Tìm key trong enum bằng cách so sánh string
        const key = Object.keys(ContentName).find(k => k === contentNameStr);
        if (key) {
          return ContentName[key as keyof typeof ContentName];
        }
        // Fallback: tìm theo description
        switch (contentNameStr) {
          case "Kanji": return ContentName.Kanji;
          case "Vocabulary": return ContentName.Vocabulary;
          case "Grammar": return ContentName.Grammar;
          case "Reading": return ContentName.Reading;
          case "Listening": return ContentName.Listening;
          default: return ContentName.Kanji;
        }
      };
      
      const mapLevelToEnum = (levelStr: string): CourseLevel => {
        // Tìm key trong enum bằng cách so sánh string
        const key = Object.keys(CourseLevel).find(k => k === levelStr);
        if (key) {
          return CourseLevel[key as keyof typeof CourseLevel];
        }
        // Fallback: tìm theo description
        switch (levelStr) {
          case "N5": return CourseLevel.N5;
          case "N4": return CourseLevel.N4;
          case "N3": return CourseLevel.N3;
          case "N2": return CourseLevel.N2;
          case "N1": return CourseLevel.N1;
          default: return CourseLevel.N5;
        }
      };
      
      const mapSubContentNameToEnum = (subContentNameStr: string): SubContentName => {
        // Tìm key trong enum bằng cách so sánh string
        const key = Object.keys(SubContentName).find(k => k === subContentNameStr);
        if (key) {
          return SubContentName[key as keyof typeof SubContentName];
        }
        // Fallback: tìm theo description
        switch (subContentNameStr) {
          case "Mondai1": return SubContentName.Mondai1;
          case "Mondai2": return SubContentName.Mondai2;
          case "Mondai3": return SubContentName.Mondai3;
          case "Mondai4": return SubContentName.Mondai4;
          case "Mondai5": return SubContentName.Mondai5;
          case "Mondai6": return SubContentName.Mondai6;
          case "Mondai7": return SubContentName.Mondai7;
          case "Mondai8": return SubContentName.Mondai8;
          case "Mondai9": return SubContentName.Mondai9;
          case "Mondai10": return SubContentName.Mondai10;
          case "Mondai11": return SubContentName.Mondai11;
          case "Mondai12": return SubContentName.Mondai12;
          case "Mondai13": return SubContentName.Mondai13;
          case "Mondai14": return SubContentName.Mondai14;
          default: return SubContentName.Mondai1;
        }
      };
      
      // Update question
      await updateQuestion(editingQuestion.id, {
        content: editingQuestion.content,
        explanation: editingQuestion.explanation,
        points: editingQuestion.points,
        difficulty: editingQuestion.difficulty,
        isActive: editingQuestion.isActive,
        contentName: mapContentNameToEnum(editingQuestion.contentName),
        level: mapLevelToEnum(editingQuestion.level),
        subContentName: mapSubContentNameToEnum(editingQuestion.subContentName),
      });
      
      // Update choices
      for (const choice of editingChoices) {
        await updateChoice(choice.choiceId, {
          content: choice.content,
          isCorrect: choice.isCorrect,
        });
      }
      
      // Refresh questions list
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      );
      setQuestions(updatedQuestions);
      
      setEditingQuestion(null);
      setEditingChoices([]);
      alert("Cập nhật câu hỏi thành công!");
      
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Có lỗi xảy ra khi cập nhật câu hỏi");
    } finally {
      setEditLoading(false);
    }
  };

  const updateEditingChoice = (index: number, field: string, value: any) => {
    const newChoices = [...editingChoices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setEditingChoices(newChoices);
  };

  const handleDeleteQuestion = (questionId: string) => {
    // TODO: Implement delete question
    console.log("Delete question:", questionId);
  };

  const handleToggleActiveStatus = async (questionId: string, currentStatus: boolean) => {
    try {
      const updatedQuestion = await toggleQuestionActiveStatus(questionId, !currentStatus);
      
      // Update the questions list with the new status
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, isActive: updatedQuestion.isActive } : q
      ));
      
      alert(`Câu hỏi đã được ${updatedQuestion.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công!`);
    } catch (error) {
      console.error("Error toggling question status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái câu hỏi");
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
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Không thể tải câu hỏi");
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
          {/* ContentName filter với SubContentName con */}
          {Object.keys(ContentName)
            .filter(k => isNaN(Number(k)))
            .map((key) => {
              const value = ContentName[key as keyof typeof ContentName] as unknown as ContentName;
              const subContentsForThisContent = CONTENT_SUBCONTENT_MAPPING[value];
              const isContentSelected = contentName.includes(value);
              
              return (
                <div key={key} className="mb-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={isContentSelected}
                      onChange={() => setContentName(contentName.includes(value) ? contentName.filter(c => c !== value) : [...contentName, value])}
                    />
                    <span>{CONTENT_NAME_LABELS[value]}</span>
                  </label>
                  
                  {/* SubContentName con */}
                  {isContentSelected && (
                    <div className="ml-6 mt-2 space-y-1">
                      {subContentsForThisContent.map((subContent) => {
                        const subContentLabel = SUBCONTENT_NAME_LABELS[subContent];
                        return (
                          <label key={subContent} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={subContentName.includes(subContent)}
                              onChange={() => setSubContentName(subContentName.includes(subContent)
                                ? subContentName.filter(s => s !== subContent)
                                : [...subContentName, subContent])}
                            />
                            <span>{subContentLabel}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={contentName.length === 0} onChange={() => setContentName([])} />
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
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3">Câu hỏi</th>
                  <th className="py-2 px-3">Độ khó</th>
                  <th className="py-2 px-3">Nội dung</th>
                  <th className="py-2 px-3">Điểm</th>
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
                    <td className="py-2 px-3">{q.contentNameDescription || q.contentName}</td>
                    <td className="py-2 px-3">{q.points}</td>
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
                          onClick={() => handleEditQuestion(q)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleToggleActiveStatus(q.id, q.isActive)}
                          className={`mr-2 ${q.isActive ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                        >
                          {q.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        
        {/* Edit Inline Form */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa câu hỏi</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                {/* Question Content */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung câu hỏi *
                  </label>
                  <textarea
                    value={editingQuestion.content}
                    onChange={(e) => setEditingQuestion({...editingQuestion, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
                
                {/* Question Info */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ khó
                    </label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Object.keys(QuestionDifficulty)
                        .filter(k => isNaN(Number(k)))
                        .map((key) => {
                          const value = QuestionDifficulty[key as keyof typeof QuestionDifficulty] as unknown as QuestionDifficulty;
                          return (
                            <option key={key} value={value}>
                              {DIFFICULTY_LABELS[value]}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cấp độ
                    </label>
                    <select
                      value={editingQuestion.level}
                      onChange={(e) => setEditingQuestion({...editingQuestion, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Object.keys(CourseLevel)
                        .filter(k => isNaN(Number(k)))
                        .map((key) => {
                          const value = CourseLevel[key as keyof typeof CourseLevel] as unknown as CourseLevel;
                          return (
                            <option key={key} value={value}>
                              {COURSE_LEVEL_LABELS[value]}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại câu hỏi
                    </label>
                    <select
                      value={editingQuestion.contentName}
                      onChange={(e) => setEditingQuestion({...editingQuestion, contentName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Object.keys(ContentName)
                        .filter(k => isNaN(Number(k)))
                        .map((key) => {
                          const value = ContentName[key as keyof typeof ContentName] as unknown as ContentName;
                          return (
                            <option key={key} value={value}>
                              {CONTENT_NAME_LABELS[value]}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingQuestion.points}
                      onChange={(e) => setEditingQuestion({...editingQuestion, points: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={editingQuestion.isActive ? "true" : "false"}
                      onChange={(e) => setEditingQuestion({...editingQuestion, isActive: e.target.value === "true"})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Vô hiệu</option>
                    </select>
                  </div>
                </div>
                
                {/* Choices */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Đáp án *
                  </label>
                  <div className="space-y-4">
                    {editingChoices.map((choice, index) => (
                      <div key={choice.choiceId} className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={choice.isCorrect}
                          onChange={() => {
                            const newChoices = editingChoices.map((c, i) => ({
                              ...c,
                              isCorrect: i === index
                            }));
                            setEditingChoices(newChoices);
                          }}
                          className="mt-2"
                        />
                        
                        <div className="flex-1">
                          <textarea
                            value={choice.content}
                            onChange={(e) => updateEditingChoice(index, 'content', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder={`Đáp án ${index + 1}...`}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>  
        )}

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