import React, { useEffect, useState } from "react";
import { getAllQuestions, getActiveQuestions, toggleQuestionActiveStatus, getQuestionById, getChoicesByQuestionId, ImportFailedQuestionsBlob } from "../services/questionService";
import { QuestionDto, QuestionDifficulty, ContentName, CourseLevel, SubContentName, ImportQuestionsResultDto } from "../types/question.types";
import { ChoiceReadDto } from "../types/choice.types";
import ImportQuestionsModal from "../components/modals/ImportQuestionsModal";

import { FaArrowLeft, FaPlus, FaUpload } from "react-icons/fa";
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
  const { success, error } = useNotification();
  
  // Color scheme based on role
  const colorScheme = {
    primary: isStaff ? 'orange' : 'green',
    primaryGradient: isStaff ? 'from-orange-500 to-orange-600' : 'from-green-500 to-green-600',
    primaryHover: isStaff ? 'hover:from-orange-600 hover:to-orange-700' : 'hover:from-green-600 hover:to-green-700',
    primaryBg: isStaff ? 'bg-orange-500' : 'bg-green-500',
    primaryHoverBg: isStaff ? 'hover:bg-orange-600' : 'hover:bg-green-600',
    primaryText: isStaff ? 'text-orange-600' : 'text-green-600',
    primaryBorder: isStaff ? 'border-orange-200' : 'border-green-200',
    lightBg: isStaff ? 'from-orange-50 to-orange-100' : 'from-green-50 to-green-100',
    lightText: isStaff ? 'text-orange-800' : 'text-green-800',
    lightHoverText: isStaff ? 'group-hover:text-orange-800' : 'group-hover:text-green-800',
    focusRing: isStaff ? 'focus:ring-orange-500' : 'focus:ring-green-500',
    checkboxBorder: isStaff ? 'border-orange-300' : 'border-green-300',
    checkboxText: isStaff ? 'text-orange-600' : 'text-green-600',
    lightTextSecondary: isStaff ? 'text-orange-700' : 'text-green-700',
    backgroundGradient: isStaff ? 'from-orange-50 to-orange-100' : 'from-green-50 to-green-100'
  };
  
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty[]>([]);
  const [contentName, setContentName] = useState<ContentName[]>([]);
  const [selectedSubContents, setSelectedSubContents] = useState<SubContentName[]>([]);
  const [courseLevel, setCourseLevel] = useState<CourseLevel[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState(false);
  const [failedQuestionsData, setFailedQuestionsData] = useState<{
    blob: ImportFailedQuestionsBlob;
    summary: { totalCount: number; successCount: number; failedCount: number };
  } | null>(null);
  
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

  // Static mapping between ContentName and SubContentName based on backend enum
  const CONTENT_TO_SUBCONTENT_MAPPING: Record<ContentName, SubContentName[]> = {
    [ContentName.Kanji]: [SubContentName.Mondai1, SubContentName.Mondai2],
    [ContentName.Vocabulary]: [SubContentName.Mondai3, SubContentName.Mondai4],
    [ContentName.Grammar]: [SubContentName.Mondai5, SubContentName.Mondai6, SubContentName.Mondai7],
    [ContentName.Reading]: [SubContentName.Mondai8, SubContentName.Mondai9, SubContentName.Mondai10],
    [ContentName.Listening]: [SubContentName.Mondai11, SubContentName.Mondai12, SubContentName.Mondai13, SubContentName.Mondai14]
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

  // Helper function to fetch questions with attachments
  const fetchQuestionsWithAttachments = async (questionList: QuestionDto[]): Promise<QuestionDto[]> => {
    return await Promise.all(
      questionList.map(async (question) => {
        try {
          const questionWithAttachments = await getQuestionById(question.id);
          return questionWithAttachments;
        } catch (error) {
          console.error(`Error fetching attachments for question ${question.id}:`, error);
          return question;
        }
      })
    );
  };

  // Fetch questions with client-side filtering (từ code cũ - hoạt động tốt)
  useEffect(() => {
    // Don't fetch questions when in quiz mode
    if (!quizMode) {
      fetchQuestions();
    }
  }, [difficulty, selectedSubContents, courseLevel, contentName, isStaff]); // Removed quizMode from dependency

  // Handler for difficulty filter changes (đơn giản hóa từ code cũ)
  const handleDifficultyChange = (value: QuestionDifficulty, isChecked: boolean) => {
    if (isChecked) {
      setDifficulty(prev => [...prev, value]);
    } else {
      setDifficulty(prev => prev.filter(d => d !== value));
    }
  };

  // Handler for course level filter changes
  const handleCourseLevelChange = (value: CourseLevel, isChecked: boolean) => {
    if (isChecked) {
      setCourseLevel(prev => [...prev, value]);
    } else {
      setCourseLevel(prev => prev.filter(l => l !== value));
    }
  };

  // Handler for content name filter changes
  const handleContentNameChange = (value: ContentName, isChecked: boolean) => {
    if (isChecked) {
      setContentName(prev => [...prev, value]);
    } else {
      setContentName(prev => prev.filter(c => c !== value));
      
      // Also remove all subcontent filters for this content
      const subContents = CONTENT_TO_SUBCONTENT_MAPPING[value] || [];
      setSelectedSubContents(prev => prev.filter(sc => !subContents.includes(sc)));
    }
  };

  // Handler for subcontent filter changes
  const handleSubContentChange = (value: SubContentName, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSubContents(prev => [...prev, value]);
    } else {
      setSelectedSubContents(prev => prev.filter(sc => sc !== value));
    }
  };

  // Handler to clear all filters (đơn giản hóa từ code cũ)
  const handleClearAllFilters = () => {
    setDifficulty([]);
    setCourseLevel([]);
    setContentName([]);
    setSelectedSubContents([]);
  };

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
    console.log("🎯 handleStartQuiz called with questions:", questions);
    console.log("🎯 questions.length:", questions.length);
    console.log("🎯 isStaff:", isStaff);
    console.log("🎯 userInfo.roleName:", userInfo?.roleName);
    
    try {
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setSelectedChoice(null);
      setShowAnswer(false);
      setQuizMode(true);
      
      console.log("🎯 Quiz mode set to true, fetching choices...");
      
      // Fetch choices for all questions
      const allChoices: ChoiceReadDto[][] = [];
      for (const question of questions) {
        const choices = await getChoicesByQuestionId(question.id);
        allChoices.push(choices);
      }
      setQuizChoices(allChoices);
      console.log("🎯 All choices fetched:", allChoices);
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
    console.log("🚪 handleExitQuiz called");
    setQuizMode(false);
    setQuizQuestions([]);
    setQuizChoices([]);
    setCurrentQuestionIndex(0);
    setSelectedChoice(null);
    setShowAnswer(false);
  };

  // Main function to fetch questions with filtering
  const fetchQuestions = async () => {
    setLoading(true);
    try {      
      // Students only see active questions, staff see all questions
      const fetchFunction = isStaff ? getAllQuestions : getActiveQuestions;
      
      // Nếu không có filter nào được chọn, lấy tất cả
      if (difficulty.length === 0 && selectedSubContents.length === 0 && courseLevel.length === 0 && contentName.length === 0) {
        const data = await fetchFunction();
        const questionsWithAttachments = await fetchQuestionsWithAttachments(data);
        setQuestions(questionsWithAttachments);
      } else {
        // Nếu có filter, sử dụng client-side filtering
        const allQuestions = await fetchFunction();
        const allQuestionsWithAttachments = await fetchQuestionsWithAttachments(allQuestions);
        let filteredQuestions = allQuestionsWithAttachments;
        
        // Filter theo difficulty
        if (difficulty.length > 0) {
          filteredQuestions = filteredQuestions.filter(q => difficulty.includes(q.difficulty));
          console.log(`After difficulty filter: ${filteredQuestions.length} questions`);
        }
        
        // Filter theo courseLevel (level) - sửa để so sánh với string values từ backend
        if (courseLevel.length > 0) {
          console.log('=== COURSE LEVEL FILTER DEBUG ===');
          console.log('Selected courseLevel filters:', courseLevel);
          console.log('Sample question level values:', filteredQuestions.slice(0, 3).map(q => ({ id: q.id, level: q.level, levelType: typeof q.level })));
          
          filteredQuestions = filteredQuestions.filter(q => {
            // Backend trả về string (vd: "N5"), so sánh với enum labels
            const matches = courseLevel.some(level => {
              const levelLabel = COURSE_LEVEL_LABELS[level]; // Vd: "N5"
              return levelLabel === (q.level as any); // Cast to any để tránh type error
            });
            if (!matches) {
              console.log(`Question ${q.id} level "${q.level}" does not match any of`, courseLevel.map(l => COURSE_LEVEL_LABELS[l]));
            }
            return matches;
          });
          console.log(`After courseLevel filter: ${filteredQuestions.length} questions`);
        }
        
        // Filter theo contentName - sửa để so sánh với string values từ backend
        if (contentName.length > 0) {
          console.log('=== CONTENT NAME FILTER DEBUG ===');
          console.log('Selected contentName filters:', contentName);
          console.log('Sample question contentName values:', filteredQuestions.slice(0, 3).map(q => ({ id: q.id, contentName: q.contentName, contentType: typeof q.contentName })));
          
          filteredQuestions = filteredQuestions.filter(q => {
            // Backend trả về string (vd: "Kanji"), so sánh trực tiếp
            const matches = contentName.some(cn => {
              const enumKey = ContentName[cn]; // Vd: "Kanji" 
              return (q.contentName as any) === enumKey;
            });
            if (!matches) {
              console.log(`Question ${q.id} contentName "${q.contentName}" does not match any of`, contentName.map(c => ContentName[c]));
            }
            return matches;
          });
          console.log(`After contentName filter: ${filteredQuestions.length} questions`);
        }
        
        // Filter theo subContentName (selectedSubContents) - sửa để so sánh với string values từ backend
        if (selectedSubContents.length > 0) {
          console.log('=== SUBCONTENT FILTER DEBUG ===');
          console.log('Selected subContent filters:', selectedSubContents);
          console.log('Sample question subContentName values:', filteredQuestions.slice(0, 3).map(q => ({ id: q.id, subContentName: q.subContentName, subContentType: typeof q.subContentName })));
          
          filteredQuestions = filteredQuestions.filter(q => {
            // Backend trả về string (vd: "Mondai1"), so sánh trực tiếp
            const matches = selectedSubContents.some(scn => {
              const enumKey = SubContentName[scn]; // Vd: "Mondai1"
              return (q.subContentName as any) === enumKey;
            });
            if (!matches) {
              console.log(`Question ${q.id} subContentName "${q.subContentName}" does not match any of`, selectedSubContents.map(sc => SubContentName[sc]));
            }
            return matches;
          });
          console.log(`After subContent filter: ${filteredQuestions.length} questions`);
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

  const handleImportSuccess = async (result?: ImportQuestionsResultDto, failedBlob?: ImportFailedQuestionsBlob) => {
    setShowImportModal(false);
    
    // Show detailed import results
    if (result) {
      // All questions imported successfully (JSON response)
      const totalCount = result.successCount + result.failedCount;
      if (result.failedCount === 0) {
        success(`🎉 Import thành công: ${result.successCount}/${totalCount} câu hỏi!`);
      } else {
        success(`✅ Import hoàn tất: ${result.successCount}/${totalCount} câu hỏi thành công, ${result.failedCount} thất bại`);
      }
    } else if (failedBlob && failedBlob.importSummary) {
      // Has failed questions (blob response)
      const summary = failedBlob.importSummary;
      const totalCount = summary.successCount + summary.failedCount;
      
      // Store failed questions data for download modal
      setFailedQuestionsData({
        blob: failedBlob,
        summary: summary
      });
      
      if (summary.successCount > 0) {
        // Mixed results - some success, some failed
        success(`⚠️ Import hoàn tất: ${summary.successCount}/${totalCount} câu hỏi thành công, ${summary.failedCount} thất bại.`);
      } else {
        // All failed
        error(`❌ Import thất bại: 0/${totalCount} câu hỏi thành công, tất cả ${summary.failedCount} câu hỏi đều bị lỗi.`);
      }
      
      // Show confirmation modal for downloading failed questions
      setShowDownloadConfirmModal(true);
      
    } else {
      // Fallback message
      success('Import câu hỏi hoàn tất! Danh sách câu hỏi đã được cập nhật.');
    }
    
    // Reload questions after import (both success and partial success)
    await fetchQuestions();
  };

  const handleDownloadConfirm = () => {
    if (failedQuestionsData) {
      const { blob, summary } = failedQuestionsData;
      
      // Download the failed questions file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `import_failed_questions_${timestamp}_${summary.failedCount}errors.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success notification
      success(`📁 Tệp lỗi đã được tải xuống: import_failed_questions_${timestamp}_${summary.failedCount}errors.json`);
      
      // Close modal and reset data
      setShowDownloadConfirmModal(false);
      setFailedQuestionsData(null);
    }
  };

  const handleDownloadCancel = () => {
    if (failedQuestionsData?.summary.successCount && failedQuestionsData.summary.successCount > 0) {
      success(`✅ ${failedQuestionsData.summary.successCount} câu hỏi đã import thành công!`);
    }
    
    // Close modal and reset data
    setShowDownloadConfirmModal(false);
    setFailedQuestionsData(null);
  };

  return (
    <div className={`min-h-screen flex bg-gradient-to-br ${colorScheme.backgroundGradient} font-inter relative`}>
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
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar filter */}
      <aside className={`w-80 bg-white shadow-xl border-r ${colorScheme.primaryBorder} p-6 flex flex-col gap-6 rounded-r-2xl`}>
        {isStaff && (
          <button
            onClick={() => navigate(paths.staff_sub_content_management)}
            className={`flex items-center gap-3 mb-4 px-4 py-3 bg-gradient-to-r ${colorScheme.primaryGradient} text-white rounded-xl ${colorScheme.primaryHover} font-semibold transition-all shadow-lg transform hover:scale-105`}
          >
            <span>📊 Quản lý cấu trúc câu hỏi</span>
          </button>
        )}
        
        <div className={`bg-gradient-to-r ${colorScheme.lightBg} p-4 rounded-xl shadow-sm`}>
          <h3 className={`text-lg font-bold mb-4 ${colorScheme.lightText} flex items-center gap-2`}>
            <span>🎯</span> Lọc theo độ khó
          </h3>
          <div className="flex flex-col gap-3">
            {Object.keys(QuestionDifficulty)
              .filter(k => isNaN(Number(k)))
              .map((key) => {
                const value = QuestionDifficulty[key as keyof typeof QuestionDifficulty] as unknown as QuestionDifficulty;
                return (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={difficulty.includes(value)}
                      onChange={(e) => handleDifficultyChange(value, e.target.checked)}
                      className={`w-4 h-4 ${colorScheme.checkboxText} bg-white border-2 ${colorScheme.checkboxBorder} rounded ${colorScheme.focusRing} focus:ring-2`}
                    />
                    <span className={`${colorScheme.lightTextSecondary} ${colorScheme.lightHoverText} font-medium`}>{DIFFICULTY_LABELS[value]}</span>
                  </label>
                );
              })}
            <label className="flex items-center gap-3 cursor-pointer group border-t border-green-200 pt-2 mt-2">
              <input 
                type="checkbox" 
                checked={difficulty.length === 0} 
                onChange={() => difficulty.length > 0 && handleClearAllFilters()} 
                className="w-4 h-4 text-green-600 bg-white border-2 border-green-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="text-green-600 group-hover:text-green-700 font-semibold">✨ Tất cả</span>
            </label>
          </div>
        </div>
        
        <div className={`bg-gradient-to-r ${colorScheme.lightBg} p-4 rounded-xl shadow-sm`}>
          <h3 className={`text-lg font-bold mb-4 ${colorScheme.lightText} flex items-center gap-2`}>
            <span>📚</span> Lọc theo cấp độ
          </h3>
          <div className="flex flex-col gap-3 mb-4">
            {Object.keys(CourseLevel)
              .filter(k => isNaN(Number(k)))
              .map((key) => {
                const value = CourseLevel[key as keyof typeof CourseLevel] as unknown as CourseLevel;
                return (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={courseLevel.includes(value)}
                      onChange={(e) => handleCourseLevelChange(value, e.target.checked)}
                      className={`w-4 h-4 ${colorScheme.checkboxText} bg-white border-2 ${colorScheme.checkboxBorder} rounded ${colorScheme.focusRing} focus:ring-2`}
                    />
                    <span className={`${colorScheme.lightTextSecondary} ${colorScheme.lightHoverText} font-medium`}>{COURSE_LEVEL_LABELS[value]}</span>
                  </label>
                );
              })}
            <label className={`flex items-center gap-3 cursor-pointer group border-t border-${colorScheme.primary}-200 pt-2 mt-2`}>
              <input 
                type="checkbox" 
                checked={courseLevel.length === 0} 
                onChange={() => courseLevel.length > 0 && handleClearAllFilters()} 
                className={`w-4 h-4 ${colorScheme.checkboxText} bg-white border-2 ${colorScheme.checkboxBorder} rounded ${colorScheme.focusRing} focus:ring-2`}
              />
              <span className={`${colorScheme.primaryText} ${colorScheme.lightHoverText} font-semibold`}>✨ Tất cả</span>
            </label>
          </div>
          
          <h4 className={`text-md font-semibold mb-3 ${colorScheme.lightText} flex items-center gap-2`}>
            <span>📖</span> Lọc theo nội dung
          </h4>
          {/* ContentName and SubContentName filter with hierarchy */}
          {Object.keys(ContentName)
            .filter(k => isNaN(Number(k)))
            .map((key) => {
              const value = ContentName[key as keyof typeof ContentName] as unknown as ContentName;
              const isContentSelected = contentName.includes(value);
              const subContents = CONTENT_TO_SUBCONTENT_MAPPING[value] || [];
              
              return (
                <div key={key} className={`mb-4 bg-white p-3 rounded-lg border-l-4 border-${colorScheme.primary}-400 shadow-sm hover:shadow-md transition-shadow`}>
                  {/* Content Name Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer font-medium mb-3 group">
                    <input
                      type="checkbox"
                      checked={isContentSelected}
                      onChange={(e) => handleContentNameChange(value, e.target.checked)}
                      className={`w-4 h-4 ${colorScheme.checkboxText} bg-white border-2 ${colorScheme.checkboxBorder} rounded ${colorScheme.focusRing} focus:ring-2`}
                    />
                    <span className={`${colorScheme.lightTextSecondary} ${colorScheme.lightHoverText} font-semibold flex items-center gap-2`}>
                      <span>📚</span> {CONTENT_NAME_LABELS[value]}
                    </span>
                  </label>

                  {/* SubContent checkboxes */}
                  <div className={`ml-7 space-y-2 bg-gradient-to-r from-${colorScheme.primary}-25 to-${colorScheme.primary}-50 p-2 rounded-lg`}>
                    {subContents.map((subContentValue) => {
                      const isSubContentSelected = selectedSubContents.includes(subContentValue);
                      
                      return (
                        <label key={subContentValue} className="flex items-center gap-2 cursor-pointer text-sm group">
                          <input
                            type="checkbox"
                            checked={isSubContentSelected}
                            onChange={(e) => handleSubContentChange(subContentValue, e.target.checked)}
                            className={`w-3 h-3 text-${colorScheme.primary}-500 bg-white border border-${colorScheme.primary}-300 rounded focus:ring-${colorScheme.primary}-400 focus:ring-1`}
                          />
                          <span className={`text-${colorScheme.primary}-600 group-hover:text-${colorScheme.primary}-700`}>
                            • {SUBCONTENT_NAME_LABELS[subContentValue]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          
          {/* Clear all filters */}
          <div className="mt-4 pt-4 border-t-2 border-gradient-to-r from-green-200 to-purple-200">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={contentName.length === 0 && selectedSubContents.length === 0} 
                onChange={() => {
                  if (contentName.length > 0 || selectedSubContents.length > 0) {
                    handleClearAllFilters();
                  }
                }} 
                className="w-4 h-4 text-red-600 bg-white border-2 border-red-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <span className="text-red-600 group-hover:text-red-700 font-semibold flex items-center gap-2">
                <span>🗑️</span> Xóa tất cả bộ lọc nội dung
              </span>
            </label>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8 bg-gradient-to-br from-green-25 to-green-50">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-green-100">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate(isStaff ? paths.staff_home : paths.student_home)} 
              className="flex items-center gap-3 text-green-600 hover:text-green-700 font-medium bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition-all transform hover:scale-105"
            >
              <FaArrowLeft className="text-lg" /> 
              Quay lại trang chủ
            </button>
            <div className="flex gap-3">
              {(() => {
                console.log("🐛 Debug render conditions:", { 
                  isStaff, 
                  questionsLength: questions.length, 
                  shouldShowButton: !isStaff && questions.length > 0,
                  userRoleName: userInfo?.roleName
                });
                return null;
              })()}
              {!isStaff && questions.length > 0 && (
                <button
                  onClick={() => handleStartQuiz(questions)}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg transform hover:scale-105"
                >
                  <span>🎯</span>
                  <span>Bắt đầu làm bài</span>
                </button>
              )}
              {isStaff && (
                <>
                  <button
                    onClick={handleCreateQuestion}
                    className={`flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${colorScheme.primaryGradient} text-white rounded-xl ${colorScheme.primaryHover} font-semibold transition-all shadow-lg transform hover:scale-105`}
                  >
                    <FaPlus className="text-lg" />
                    Tạo câu hỏi mới
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg transform hover:scale-105"
                  >
                    <FaUpload className="text-lg" />
                    Import câu hỏi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <div className={`bg-gradient-to-r ${colorScheme.primaryGradient} rounded-2xl shadow-xl p-6 mb-8 text-white`}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>📚</span>
            {isStaff ? "Quản lý câu hỏi" : "Xem câu hỏi"}
          </h1>
          <p className={`text-${colorScheme.primary}-100 mt-2 text-lg`}>
            {isStaff ? "Quản lý và chỉnh sửa ngân hàng câu hỏi" : "Khám phá và luyện tập với ngân hàng câu hỏi"}
          </p>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className={`animate-spin rounded-full h-12 w-12 border-4 border-${colorScheme.primary}-500 border-t-transparent`}></div>
              <span className={`${colorScheme.primaryText} text-lg font-medium`}>Đang tải câu hỏi...</span>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-xl font-medium">Không có câu hỏi nào.</p>
            <p className="text-gray-400 mt-2">Hãy thử điều chỉnh bộ lọc hoặc thêm câu hỏi mới!</p>
          </div>
        ) : !quizMode ? (
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-${colorScheme.primary}-100`}>
            <div className={`bg-gradient-to-r ${colorScheme.primaryGradient} px-6 py-4`}>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📊</span> Danh sách câu hỏi ({questions.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-gradient-to-r ${colorScheme.lightBg}`}>
                  <tr>
                    <th className={`py-4 px-6 text-left ${colorScheme.lightText} font-semibold`}>📝 Nội dung</th>
                    <th className={`py-4 px-6 text-left ${colorScheme.lightText} font-semibold`}>🎯 Độ khó</th>
                    <th className={`py-4 px-6 text-left ${colorScheme.lightText} font-semibold`}>📚 Loại câu hỏi</th>
                    <th className={`py-4 px-6 text-left ${colorScheme.lightText} font-semibold`}>⭐ Điểm</th>
                    <th className={`py-4 px-6 text-left ${colorScheme.lightText} font-semibold`}>🔊 Audio</th>
                    {isStaff && <th className={`py-4 px-6 text-center ${colorScheme.lightText} font-semibold`}>📊 Trạng thái</th>}
                    {isStaff && <th className={`py-4 px-6 text-center ${colorScheme.lightText} font-semibold`}>⚙️ Hành động</th>}
                  </tr>
                </thead>
                <tbody className={`divide-y divide-${colorScheme.primary}-100`}>
                  {questions.map((q, index) => (
                    <tr 
                      key={q.id} 
                      className={`transition-all hover:bg-gradient-to-r hover:from-${colorScheme.primary}-25 hover:to-${colorScheme.primary}-50 ${
                        !isStaff ? 'cursor-pointer hover:shadow-md' : ''
                      } ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}
                      onClick={!isStaff ? () => handleStartQuiz([q]) : undefined}
                    >
                      <td className="py-4 px-6 max-w-xs">
                        <div className="truncate text-gray-800 font-medium" title={q.content}>
                          {q.content}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          q.difficulty === 0 ? 'bg-green-100 text-green-800' :
                          q.difficulty === 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {DIFFICULTY_LABELS[q.difficulty]}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`bg-${colorScheme.primary}-100 text-${colorScheme.primary}-800 px-3 py-1 rounded-full text-sm font-bold`}>
                          {q.points} điểm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {/* Audio Player */}
                        {q.questionAttachments && q.questionAttachments.length > 0 && 
                         q.questionAttachments.some(att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/')) ? (
                          <div className="flex items-center space-x-2">
                            <audio 
                              controls 
                              className="h-8 w-36 rounded-lg"
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
                          <span className="text-gray-400 text-sm bg-gray-100 px-2 py-1 rounded-lg">
                            🔇 Không có audio
                          </span>
                        )}
                      </td>
                      {isStaff && (
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            q.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {q.isActive ? '✅ Hoạt động' : '❌ Vô hiệu'}
                          </span>
                        </td>
                      )}
                      {isStaff && (
                        <td className="py-4 px-6 text-center">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestion(q);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                            >
                              ✏️ Sửa
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActiveStatus(q.id, q.isActive);
                              }}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                                q.isActive 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {q.isActive ? '⏸️ Vô hiệu' : '▶️ Kích hoạt'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        
        {/* Quiz Interface (for Student role) */}
        {quizMode && quizQuestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex justify-between items-center text-white">
                <button
                  onClick={handleExitQuiz}
                  className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-all"
                >
                  <FaArrowLeft />
                  Quay lại danh sách
                </button>
                <div className="text-lg font-semibold bg-white bg-opacity-20 px-4 py-2 rounded-xl">
                  📝 Câu hỏi {currentQuestionIndex + 1} / {quizQuestions.length}
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
                  disabled={currentQuestionIndex === quizQuestions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-medium"
                >
                  <span>Tiếp →</span>
                </button>
              </div>

              {quizQuestions[currentQuestionIndex] && quizChoices[currentQuestionIndex] && (
                <div className="space-y-8">
                  {/* Question */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <span>❓</span> Câu hỏi {currentQuestionIndex + 1}
                    </h3>
                    <p className="text-gray-800 text-xl leading-relaxed font-medium">
                      {quizQuestions[currentQuestionIndex].content}
                    </p>
                  </div>

                  {/* Choices */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <span>📝</span> Chọn đáp án:
                    </h4>
                    {quizChoices[currentQuestionIndex].map((choice, index) => {
                      const isSelected = selectedChoice === choice.choiceId;
                      const isCorrect = choice.isCorrect;
                      let choiceStyle = "p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 cursor-pointer transition-all transform hover:scale-102 shadow-md hover:shadow-lg";
                      
                      if (showAnswer) {
                        if (isCorrect) {
                          choiceStyle = "p-6 border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl transition-all shadow-lg";
                        } else if (isSelected && !isCorrect) {
                          choiceStyle = "p-6 border-2 border-red-500 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl transition-all shadow-lg";
                        } else {
                          choiceStyle = "p-6 border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl opacity-60 transition-all";
                        }
                      } else if (isSelected) {
                        choiceStyle = "p-6 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl transition-all shadow-lg transform scale-102";
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
                                : (isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-500')
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
                              <span className="font-bold text-blue-600">{String.fromCharCode(65 + index)}.</span> {choice.content}
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
                          {selectedChoice === quizChoices[currentQuestionIndex].find(c => c.isCorrect)?.choiceId ? "🎉" : "❌"}
                        </div>
                        <p className="text-blue-800 font-bold text-lg">
                          {selectedChoice === quizChoices[currentQuestionIndex].find(c => c.isCorrect)?.choiceId
                            ? "Chính xác! Bạn đã trả lời đúng."
                            : "Sai rồi! Hãy thử lại hoặc xem đáp án đúng."
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Download Failed Questions Confirmation Modal */}
      {showDownloadConfirmModal && failedQuestionsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-200">
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {failedQuestionsData.summary.successCount > 0 ? 'Import hoàn tất với lỗi' : 'Import thất bại'}
              </h3>

              {/* Content */}
              <div className="text-gray-600 mb-6 space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-gray-500 block">Tổng số</span>
                      <div className="font-bold text-lg text-gray-900">{failedQuestionsData.summary.totalCount}</div>
                      <div className="text-xs text-gray-400">câu hỏi</div>
                    </div>
                    {failedQuestionsData.summary.successCount > 0 && (
                      <div className="text-center">
                        <span className="text-gray-500 block">Thành công</span>
                        <div className="font-bold text-lg text-green-600">{failedQuestionsData.summary.successCount}</div>
                        <div className="text-xs text-green-500">câu hỏi</div>
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-gray-500 block">Thất bại</span>
                      <div className="font-bold text-lg text-red-600">{failedQuestionsData.summary.failedCount}</div>
                      <div className="text-xs text-red-500">câu hỏi</div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">
                  Bạn có muốn tải xuống tệp chứa danh sách câu hỏi bị lỗi để kiểm tra và sửa chữa không?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDownloadCancel}
                  className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Không, cảm ơn
                </button>
                <button
                  onClick={handleDownloadConfirm}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tải xuống
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagementPage;