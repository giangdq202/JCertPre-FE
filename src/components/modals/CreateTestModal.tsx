import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaSave, FaExclamationCircle, FaSearch } from "react-icons/fa";
import { TestType, TestStatus, CourseLevel, CreateTestDto } from "../../services/testService";
import { CreateQuestionDto, QuestionDifficulty, ContentName, SubContentName, QuestionDto } from "../../types/question.types";
import { getQuestionsPagingDetails } from "../../services/questionService";

import { createByLessonId, updateTestStatus } from "../../services/testService";
import { addQuestionsCustomManual } from "../../services/testQuestionService";
import { getAllSubContents, SubContentDto } from "../../services/subContentService";
import { useAuth } from "../../auth/AuthContext";
import NotificationModal from "./NotificationModal";
import { ChoiceCreateDto } from '../../types/choice.types';

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  courseLevel: CourseLevel;
  courseStartDate: string;
  courseEndDate: string;
  onTestCreated?: () => void;
}

// Extend CreateQuestionDto to include choices for internal use
interface QuestionWithChoices extends Omit<CreateQuestionDto, 'subContentName'> {
  id?: string; // Add ID for existing questions
  subContentName?: SubContentName;
  choices?: ChoiceCreateDto[];
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  courseLevel,
  courseStartDate,
  courseEndDate,
  onTestCreated
}) => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  // Removed templateTypes state - not needed for CustomManual only
  const [error, setError] = useState<string>("");
  // Fixed to CustomManual - no longer need state for test type
  // const [selectedTestType, setSelectedTestType] = useState<TestType>(TestType.CustomManual);
  
  // SubContent state
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);

  const [testData, setTestData] = useState<CreateTestDto>({
    title: "",
    description: "",
    testType: TestType.CustomManual,
    courseLevel: courseLevel,
    durationMinutes: 30,
    maxAttempts: 3,
    passingPercentage: 70,
    availableFrom: courseStartDate,
    availableTo: courseEndDate,
  });

  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Omit<CreateQuestionDto, 'subContentName'> & { subContentName?: SubContentName }>({
    content: "",
    explanation: "",
    points: 1,
    difficulty: QuestionDifficulty.Easy,
    isActive: true,
    contentName: ContentName.Vocabulary,
    level: courseLevel,
    subContentName: undefined,
  });

  const [choices, setChoices] = useState<{ content: string; isCorrect: boolean }[]>([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);

  // Question search states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterContentName, setFilterContentName] = useState<string>("");
  const [filterSubContentName, setFilterSubContentName] = useState<string>("");
  const [filterCourseLevel, setFilterCourseLevel] = useState<string>("");
  const [availableQuestions, setAvailableQuestions] = useState<QuestionDto[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [filteredSubContentsForSearch, setFilteredSubContentsForSearch] = useState<SubContentDto[]>([]);

  // Load subcontents when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load all questions initially when modal opens for CustomManual (fixed type)
      searchAvailableQuestions();
    }
  }, [isOpen, courseLevel]);

  // Auto-search when filters change (but not on initial render)
  useEffect(() => {
    if (isOpen) {
      // Only auto-search if there are some criteria (to avoid empty searches)
      if (searchTerm.trim() || filterContentName || filterSubContentName) {
        // Add small delay to avoid too many API calls when typing
        const timeoutId = setTimeout(() => {
          searchAvailableQuestions();
        }, 300);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [filterContentName, filterSubContentName, searchTerm]);

  // Update filtered subcontents for search when contentName filter changes
  useEffect(() => {
    const updateFilteredSubContentsForSearch = async () => {
      if (filterContentName) {
        try {
          const contentNameEnum = parseInt(filterContentName) as ContentName;
          // Giống như CreateQuestionPage - chỉ truyền 3 tham số đầu
          const data = await getAllSubContents(undefined, courseLevel, contentNameEnum);
          setFilteredSubContentsForSearch(data.items || []);
        } catch (error) {
          console.error("Error fetching filtered subcontents for search:", error);
          setFilteredSubContentsForSearch([]);
        }
      } else {
        setFilteredSubContentsForSearch([]);
      }
      // Reset sub content filter when content changes
      setFilterSubContentName("");
    };
    
    updateFilteredSubContentsForSearch();
  }, [filterContentName, courseLevel]);

  // Update test dates when course dates change
  useEffect(() => {
    setTestData(prev => ({
      ...prev,
      availableFrom: courseStartDate,
      availableTo: courseEndDate,
    }));
  }, [courseStartDate, courseEndDate]);

  // Fetch subcontents when contentName changes
  useEffect(() => {
    const fetchSubContents = async () => {
      if (currentQuestion.contentName !== undefined) {
        try {
          const data = await getAllSubContents(undefined, courseLevel, currentQuestion.contentName);
          setSubContents(data.items);
        } catch (error) {
          console.error("Error fetching subcontents:", error);
          setSubContents([]);
        }
      } else {
        setSubContents([]);
      }
    };
    
    fetchSubContents();
  }, [currentQuestion.contentName]);

  // Reset subContentName when contentName changes
  useEffect(() => {
    setCurrentQuestion(prev => ({
      ...prev,
      subContentName: undefined // Reset to undefined when contentName changes
    }));
  }, [currentQuestion.contentName]);

  // Question search functions
  const searchAvailableQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const params = {
        pageIndex: 1,
        pageSize: 100,
        search: searchTerm.trim() || undefined,
        contentName: filterContentName || undefined, // Keep as string - backend will parse
        subContentName: filterSubContentName || undefined, // Keep as string - backend will parse  
        courseLevel: [courseLevel], // Filter by course level of the course
        isActive: true // Only get active questions
      };
      
      console.log("Search params:", params); // Debug log
      const result = await getQuestionsPagingDetails(params);
      setAvailableQuestions(result.items);
    } catch (error) {
      console.error("Error searching questions:", error);
      showNotification("Lỗi", "Không thể tải danh sách câu hỏi", "error");
      setAvailableQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const addSelectedQuestions = () => {
    const selectedQuestions = availableQuestions.filter(q => selectedQuestionIds.includes(q.id));
    const questionsToAdd: QuestionWithChoices[] = selectedQuestions.map(q => ({
      id: q.id, // Include the question ID
      content: q.content,
      explanation: q.explanation || "",
      points: q.points,
      difficulty: q.difficulty,
      isActive: q.isActive,
      contentName: q.contentName,
      level: q.level,
      subContentName: q.subContentName,
      choices: q.choices?.map(choice => ({
        content: choice.content,
        isCorrect: choice.isCorrect
      })) || []
    }));

    setQuestions(prev => [...prev, ...questionsToAdd]);
    setSelectedQuestionIds([]);
    showNotification("Thành công", `Đã thêm ${selectedQuestions.length} câu hỏi vào test`, "success");
  };

  const getFilterSubContentOptions = () => {
    if (!filterContentName) return [];
    
    return filteredSubContentsForSearch.map(sc => ({
      // API trả về string name "Mondai1", convert thành number 0
      value: SubContentName[sc.subContentName as keyof typeof SubContentName].toString(),
      label: sc.subContentNameDescription
    }));
  };

  const handleTestDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: name === 'durationMinutes' || name === 'maxAttempts' || name === 'passingPercentage' 
        ? parseInt(value) 
        : value
    }));
  };

  // ======== DEPRECATED: Manual Question Creation Functions ========
  // These functions are no longer used as we now search existing questions
  // TODO: Remove these after confirming the new search functionality works

  const createTest = async () => {
    if (!userInfo?.id) {
      showNotification("Chưa đăng nhập", "Vui lòng đăng nhập để tạo test", "error");
      return;
    }

    if (!testData.title.trim() || !testData.description?.trim()) {
      showNotification("Thiếu thông tin", "Vui lòng điền đầy đủ tiêu đề và mô tả test", "warning");
      return;
    }

    // For CustomManual (our fixed type), require at least one question
    if (questions.length === 0) {
      showNotification("Thiếu câu hỏi", "Cần ít nhất 1 câu hỏi để tạo test", "warning");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Prepare test data with all required fields (CustomManual only)
      const testDataToSend = {
        title: testData.title.trim(),
        description: testData.description?.trim() || "",
        testType: TestType.CustomManual,
        courseLevel: courseLevel,
        durationMinutes: testData.durationMinutes,
        maxAttempts: testData.maxAttempts,
        passingPercentage: testData.passingPercentage,
        availableFrom: testData.availableFrom || new Date().toISOString(),
        availableTo: testData.availableTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      console.log("Sending test data:", testDataToSend);
      console.log("Selected test type: CustomManual (fixed)");
      console.log("Course level:", courseLevel);
      console.log("Questions count:", questions.length);

      // Create test using CustomManual type only
      const createdTest = await createByLessonId(userInfo?.id || "", lessonId, testDataToSend);
      console.log("Test created successfully:", createdTest);
      
      // Add questions to test (CustomManual only)
      const questionIds: string[] = questions
        .map(q => q.id)
        .filter((id): id is string => id !== undefined); // Type guard to filter out undefined

      // Thêm câu hỏi vào test
      const testQuestionPairs = questionIds.map(questionId => ({
        testId: createdTest.testId,
        questionId: questionId
      }));

      await addQuestionsCustomManual(testQuestionPairs);

      // Update test status to open
      await updateTestStatus(createdTest.testId, TestStatus.Open);

      showNotification("Tạo test thành công!", "Test đã được tạo và sẵn sàng sử dụng", "success");
      onTestCreated?.();
      handleClose();
    } catch (error: any) {
      console.error("Error creating test:", error);
      console.error("Error response:", error?.response?.data);
      
      // Handle specific error cases (simplified for CustomManual only)
      if (error?.response?.data?.errorCode === "NO_QUESTIONS_FOUND") {
        setError("Không tìm thấy câu hỏi phù hợp. Vui lòng kiểm tra lại cấu hình.");
      } else if (error?.response?.data?.errorCode === "TEST_SERVICE_ERROR") {
        setError("Lỗi tạo test: " + (error?.response?.data?.message || "Lỗi không xác định"));
      } else if (error?.response?.data?.errorCode === "SUBCONTENT_NOT_FOUND") {
        setError("Loại bài (SubContent) không tồn tại cho loại nội dung và cấp độ này. Vui lòng chọn loại bài khác.");
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.join(', ');
            }
            return `${field}: ${messages}`;
          })
          .join('; ');
        setError(`Lỗi validation: ${errorMessages}`);
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Có lỗi xảy ra khi tạo test. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const resetForm = () => {
    setTestData({
      title: "",
      description: "",
      testType: TestType.CustomManual,
      courseLevel: courseLevel,
      durationMinutes: 30,
      maxAttempts: 3,
      passingPercentage: 70,
      availableFrom: courseStartDate,
      availableTo: courseEndDate,
    });
    setQuestions([]);
    setError("");
    setLoading(false);
    setSearchTerm("");
    setFilterContentName("");
    setFilterSubContentName("");
    setAvailableQuestions([]);
    setSelectedQuestionIds([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({
      isOpen: true,
      title,
      message,
      type
    });
  };

  return (
    <>
      {notification && (
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification(null)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      )}
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 font-inter">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4 p-6">
          <h3 className="text-xl font-semibold text-gray-800">Tạo Test cho Bài học</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm flex items-center">
                <FaExclamationCircle className="mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Template Types Info section removed - only using CustomManual */}

          {/* Test Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin Test</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Test</label>
                <input
                  type="text"
                  name="title"
                  value={testData.title}
                  onChange={handleTestDataChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập tiêu đề test"
                />
              </div>
              {/* Test Type is now fixed to CustomManual - showing form fields directly */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={testData.durationMinutes}
                  onChange={handleTestDataChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  min={5}
                  max={180}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lần thử tối đa</label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={testData.maxAttempts}
                  onChange={handleTestDataChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ đỗ (%)</label>
                <input
                  type="number"
                  name="passingPercentage"
                  value={testData.passingPercentage}
                  onChange={handleTestDataChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                name="description"
                value={testData.description}
                onChange={handleTestDataChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Nhập mô tả test"
              />
            </div>
          </div>

          {/* Add Questions Section - Always show for CustomManual */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Thêm Câu hỏi</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm câu hỏi</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Nhập nội dung câu hỏi để tìm kiếm... (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại nội dung</label>
                    <select
                      value={filterContentName}
                      onChange={(e) => setFilterContentName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Tất cả loại nội dung</option>
                      <option value={ContentName.Vocabulary}>Từ vựng</option>
                      <option value={ContentName.Grammar}>Ngữ pháp</option>
                      <option value={ContentName.Reading}>Đọc hiểu</option>
                      <option value={ContentName.Listening}>Nghe hiểu</option>
                      <option value={ContentName.Kanji}>Chữ Hán</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài</label>
                    <select
                      value={filterSubContentName}
                      onChange={(e) => setFilterSubContentName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      disabled={!filterContentName}
                    >
                      <option value="">Tất cả loại bài</option>
                      {getFilterSubContentOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Button and Clear */}
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={searchAvailableQuestions}
                    disabled={loadingQuestions}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      loadingQuestions 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FaSearch size={14} />
                    {loadingQuestions ? 'Đang tìm kiếm...' : 'Tìm kiếm ngay'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterContentName("");
                      setFilterSubContentName("");
                      // Trigger search with cleared filters to show all questions
                      setTimeout(() => searchAvailableQuestions(), 100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FaTimes size={14} />
                    Xóa bộ lọc
                  </button>
                </div>

                {/* Info message */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Mẹo:</strong> Bạn có thể tìm kiếm chỉ bằng Loại nội dung hoặc Loại bài mà không cần nhập từ khóa. 
                    Hệ thống sẽ tự động tìm kiếm khi bạn thay đổi bộ lọc.
                  </p>
                </div>

                {/* Available Questions List */}
                {availableQuestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-md font-semibold text-gray-700 mb-3">Câu hỏi có sẵn ({availableQuestions.length})</h5>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {availableQuestions.map((question) => (
                        <div
                          key={question.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedQuestionIds.includes(question.id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => toggleQuestionSelection(question.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 mb-1">
                                {question.content.length > 100 
                                  ? question.content.substring(0, 100) + '...' 
                                  : question.content}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {ContentName[question.contentName]}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                  {SubContentName[question.subContentName]}
                                </span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                  {question.points} điểm
                                </span>
                              </div>
                            </div>
                            <div className="ml-2">
                              <input
                                type="checkbox"
                                checked={selectedQuestionIds.includes(question.id)}
                                onChange={() => toggleQuestionSelection(question.id)}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Selected Questions Button */}
                    {selectedQuestionIds.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={addSelectedQuestions}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaPlus size={14} />
                          Thêm {selectedQuestionIds.length} câu hỏi đã chọn
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* No questions found message */}
                {availableQuestions.length === 0 && !loadingQuestions && (
                  <div className="text-center py-4 text-gray-500">
                    {searchTerm || filterContentName || filterSubContentName ? (
                      <div>
                        <p>Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.</p>
                        <p className="text-sm mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
                      </div>
                    ) : (
                      <div>
                        <p>Chưa có câu hỏi nào để hiển thị.</p>
                        <p className="text-sm mt-1">Hãy thử tìm kiếm hoặc chọn bộ lọc.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* Questions List - Always show when have questions */}
          {questions.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-800 mb-3">Danh sách câu hỏi ({questions.length})</h5>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{question.content}</p>
                      <p className="text-sm text-gray-600">
                        Điểm: {question.points} | Độ khó: {QuestionDifficulty[question.difficulty]}
                      </p>
                    </div>
                    <button
                      onClick={() => setQuestions(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={createTest}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  Tạo Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateTestModal; 