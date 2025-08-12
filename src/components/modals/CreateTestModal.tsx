import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaSave, FaExclamationCircle, FaMagic } from "react-icons/fa";
import { TestType, TestStatus, CourseLevel, CreateTestDto, CreateAutoTestInput, createAutoTest } from "../../services/testService";
import { CreateQuestionDto, QuestionDifficulty, ContentName, SubContentName } from "../../types/question.types";
import { createChoice } from "../../services/questionService";

import { createByLessonId, updateTestStatus } from "../../services/testService";
import { addQuestionsCustomManual } from "../../services/testQuestionService";
import { createQuestion } from "../../services/questionService";
import { getAllTestTemplateTypes, TestTemplateTypeDto } from "../../services/testTemplateTypeService";
import { getAllSubContents, SubContentDto } from "../../services/subContentService";
import { useAuth } from "../../auth/AuthContext";
import NotificationModal from "./NotificationModal";
import { 
  ChoiceCreateDto,
  validateChoiceCreateDto,
  CHOICE_VALIDATION_RULES
} from '../../types/choice.types';
import { useNotification } from '../notifications';

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
  const [templateTypes, setTemplateTypes] = useState<TestTemplateTypeDto[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedTestType, setSelectedTestType] = useState<TestType>(TestType.CustomManual);
  
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

  // Load available test template types when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplateTypes();
    }
  }, [isOpen, courseLevel]);

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

  const loadTemplateTypes = async () => {
    setLoadingTemplates(true);
    setError("");
    try {
      const response = await getAllTestTemplateTypes({
        level: courseLevel,
        isActive: true,
        pageSize: 100
      });
      setTemplateTypes(response.items);
    } catch (error) {
      console.error("Failed to load template types:", error);
      setError("Không thể tải danh sách template types. Vui lòng thử lại.");
    } finally {
      setLoadingTemplates(false);
    }
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

  const handleTestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTestType = parseInt(e.target.value) as TestType;
    setSelectedTestType(newTestType);
    setTestData(prev => ({
      ...prev,
      testType: newTestType
    }));
    
    // Reset questions for JLPT Auto since they will be auto-generated
    if (newTestType === TestType.JLPTAuto) {
      setQuestions([]);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log("handleQuestionChange:", { name, value, type: typeof value });
    
    setCurrentQuestion(prev => {
      let parsedValue: any = value;
      
      if (name === 'points' || name === 'difficulty' || name === 'contentName') {
        parsedValue = parseInt(value);
      } else if (name === 'subContentName') {
        parsedValue = value === "" ? undefined : value;
      }
      
      const updated = {
        ...prev,
        [name]: parsedValue
      };
      
      // Reset subContentName when contentName changes
      if (name === 'contentName') {
        updated.subContentName = undefined;
      }
      
      console.log("Updated currentQuestion:", updated);
      return updated;
    });
  };

  const handleChoiceChange = (index: number, field: 'content' | 'isCorrect', value: string | boolean) => {
    setChoices(prev => prev.map((choice, i) => 
      i === index ? { ...choice, [field]: value } : choice
    ));
  };

  const addChoice = () => {
    setChoices(prev => [...prev, { content: "", isCorrect: false }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const resetQuestionForm = () => {
    setCurrentQuestion({
      content: "",
      explanation: "",
      points: 1,
      difficulty: QuestionDifficulty.Easy,
      isActive: true,
      contentName: ContentName.Vocabulary,
      level: courseLevel,
      subContentName: undefined,
    });
    setChoices([
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ]);
  };

  const addQuestion = () => {
    if (!currentQuestion.content.trim()) {
      showNotification("Thiếu nội dung câu hỏi", "Vui lòng nhập nội dung câu hỏi", "warning");
      return;
    }

    if (currentQuestion.content.trim().length < 10) {
      showNotification("Nội dung quá ngắn", "Nội dung câu hỏi phải có ít nhất 10 ký tự", "warning");
      return;
    }

    if (currentQuestion.subContentName === undefined) {
      showNotification("Chưa chọn loại bài", "Vui lòng chọn loại bài cho câu hỏi", "warning");
      return;
    }

    if (choices.filter(c => c.content.trim()).length < 2) {
      showNotification("Thiếu lựa chọn", "Cần ít nhất 2 lựa chọn cho câu hỏi", "warning");
      return;
    }

    // Check if all choices have content
    const validChoices = choices.filter(c => c.content.trim());
    if (validChoices.length < 2) {
      showNotification("Lựa chọn không hợp lệ", "Cần ít nhất 2 lựa chọn có nội dung", "warning");
      return;
    }

    // Validate each choice according to backend rules
    for (let i = 0; i < validChoices.length; i++) {
      const choice = validChoices[i];
      const validation = validateChoiceCreateDto(choice);
      if (!validation.isValid) {
        showNotification("Lựa chọn không hợp lệ", `Lựa chọn ${i + 1}: ${validation.message}`, "warning");
        return;
      }
    }

    if (!choices.some(c => c.isCorrect)) {
      showNotification("Thiếu đáp án đúng", "Cần ít nhất 1 đáp án đúng cho câu hỏi", "warning");
      return;
    }

    const questionWithChoices: QuestionWithChoices = {
      ...currentQuestion,
      choices: choices.filter(c => c.content.trim())
    };

    setQuestions(prev => [...prev, questionWithChoices]);
    resetQuestionForm();
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Get available subcontent options
  const getSubContentOptions = () => {
    if (courseLevel === undefined || currentQuestion.contentName === undefined) return [];
    
    return subContents.map(sc => ({
      value: sc.subContentName,
      label: `${sc.contentNameDescription} - ${sc.subContentNameDescription}`
    }));
  };

  const createTest = async () => {
    if (!userInfo?.id) {
      showNotification("Chưa đăng nhập", "Vui lòng đăng nhập để tạo test", "error");
      return;
    }

    if (!testData.title.trim() || !testData.description?.trim()) {
      showNotification("Thiếu thông tin", "Vui lòng điền đầy đủ tiêu đề và mô tả test", "warning");
      return;
    }

    // For CustomManual, require at least one question
    if (selectedTestType === TestType.CustomManual && questions.length === 0) {
      showNotification("Thiếu câu hỏi", "Cần ít nhất 1 câu hỏi cho Custom Manual test", "warning");
      return;
    }

    // Check if there are available template types for JLPT Auto ONLY when JLPT Auto is selected
    if (selectedTestType === TestType.JLPTAuto) {
      const availableTemplates = templateTypes.filter(t => t.testType === TestType.JLPTAuto);
      if (availableTemplates.length === 0) {
        setError(`Không có template type nào khả dụng cho loại test JLPT Auto và cấp độ ${CourseLevel[courseLevel]}. Vui lòng liên hệ admin để tạo template type.`);
        return;
      }
    }

    // Check if there are available template types for Custom Auto ONLY when Custom Auto is selected
    if (selectedTestType === TestType.CustomAuto) {
      const availableTemplates = templateTypes.filter(t => t.testType === TestType.CustomAuto);
      if (availableTemplates.length === 0) {
        setError(`Không có template type nào khả dụng cho loại test Custom Auto và cấp độ ${CourseLevel[courseLevel]}. Vui lòng liên hệ admin để tạo template type.`);
        return;
      }
    }

    // Check if there are available template types for Entry Auto ONLY when Entry Auto is selected
    if (selectedTestType === TestType.EntryAuto) {
      const availableTemplates = templateTypes.filter(t => t.testType === TestType.EntryAuto);
      if (availableTemplates.length === 0) {
        setError(`Không có template type nào khả dụng cho loại test Entry Auto và cấp độ ${CourseLevel[courseLevel]}. Vui lòng liên hệ admin để tạo template type.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      // Prepare test data with all required fields
      const testDataToSend = {
        title: testData.title.trim(),
        description: testData.description?.trim() || "",
        testType: selectedTestType,
        courseLevel: courseLevel,
        durationMinutes: selectedTestType === TestType.CustomManual ? testData.durationMinutes : 0,
        maxAttempts: selectedTestType === TestType.CustomManual ? testData.maxAttempts : 3,
        passingPercentage: selectedTestType === TestType.CustomManual ? testData.passingPercentage : 70,
        availableFrom: testData.availableFrom || new Date().toISOString(),
        availableTo: testData.availableTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      console.log("Sending test data:", testDataToSend);
      console.log("Selected test type:", selectedTestType);
      console.log("Selected test type (number):", Number(selectedTestType));
      console.log("Course level:", courseLevel);
      console.log("Questions count:", questions.length);
      console.log("TestType enum values:", {
        CustomManual: TestType.CustomManual,
        CustomAuto: TestType.CustomAuto,
        JLPTAuto: TestType.JLPTAuto
      });

      // B1 & B2: Xử lý tạo test tùy theo loại test
      let createdTest: { testId: string };
      
      if (selectedTestType === TestType.JLPTAuto || selectedTestType === TestType.EntryAuto) {
        // Use new auto-create API for JLPTAuto and EntryAuto
        const autoTestInput: CreateAutoTestInput = {
          testType: selectedTestType,
          courseLevel: courseLevel
        };
        
        const autoTestResult = await createAutoTest(autoTestInput, userInfo.id);
        createdTest = { testId: autoTestResult.testId };
        console.log("Auto test created successfully:", autoTestResult);
      } else {
        // Original flow for CustomManual and CustomAuto
        createdTest = await createByLessonId(userInfo?.id || "", lessonId, testDataToSend);
        console.log("Test created successfully:", createdTest);
        if (selectedTestType === TestType.CustomManual) {
          // Tạo các câu hỏi thủ công và thêm vào test
          const questionIds: string[] = [];
          for (const question of questions) {
            try {
              // Validate subContentName before creating question
              if (question.subContentName === undefined || question.subContentName === null) {
                console.error("Invalid subContentName:", {
                  value: question.subContentName,
                  type: typeof question.subContentName
                });
                throw new Error("subContentName is required and must be a valid enum value. Please select a valid subcontent option.");
              }

              // Create question without choices first
              const questionData: CreateQuestionDto = {
                content: question.content,
                explanation: question.explanation || "",
                points: question.points,
                difficulty: question.difficulty,
                isActive: question.isActive,
                contentName: question.contentName,
                level: question.level,
                subContentName: question.subContentName! // Use non-null assertion since we validated above
              };

              console.log("Creating question:", questionData);
              console.log("Full question data:", JSON.stringify(questionData, null, 2));
              console.log("subContentName type:", typeof questionData.subContentName);
              console.log("subContentName value:", questionData.subContentName);
              console.log("subContentName enum value:", SubContentName[questionData.subContentName]);
              console.log("contentName enum value:", ContentName[questionData.contentName]);
              console.log("level enum value:", CourseLevel[questionData.level]);
              console.log("difficulty enum value:", QuestionDifficulty[questionData.difficulty]);
              const createdQuestion = await createQuestion(questionData);
              questionIds.push(createdQuestion.id);

              // Create choices for the question
              if (question.choices && question.choices.length > 0) {
                for (const choice of question.choices) {
                  await createChoice(createdQuestion.id, {
                    content: choice.content,
                    isCorrect: choice.isCorrect
                  });
                }
              }
            } catch (error: any) {
              console.error("Error creating question:", error);
              throw new Error(`Lỗi tạo câu hỏi: ${error.message || 'Lỗi không xác định'}`);
            }
          }

          // Thêm câu hỏi vào test
          const testQuestionPairs = questionIds.map(questionId => ({
            testId: createdTest.testId,
            questionId: questionId
          }));

          await addQuestionsCustomManual(testQuestionPairs);
        } else if (selectedTestType === TestType.CustomAuto) {
          // Tự động tạo câu hỏi Custom Auto (có thể cần thêm API call tương tự)
          // await addQuestionsCustomAuto(createdTest.testId);
          console.log("Custom Auto test created - questions will be auto-generated by backend");
        }

        // B3: Cập nhật status test thành open (only for non-auto tests)
        await updateTestStatus(createdTest.testId, TestStatus.Open);
      }

      showNotification("Tạo test thành công!", "Test đã được tạo và sẵn sàng sử dụng", "success");
      onTestCreated?.();
      onClose();
    } catch (error: any) {
      console.error("Error creating test:", error);
      console.error("Selected test type:", selectedTestType);
      console.error("Error response:", error?.response?.data);
      
      // Handle specific error cases
      if (error?.response?.data?.errorCode === "NO_TEMPLATE_TYPE_FOUND") {
        setError("Không tìm thấy template type phù hợp. Vui lòng liên hệ admin để tạo template type cho loại test này.");
      } else if (error?.response?.data?.errorCode === "NO_TEMPLATES_FOUND") {
        if (selectedTestType === TestType.CustomManual) {
          setError("Không tìm thấy templates phù hợp cho Custom Manual test. Vui lòng liên hệ admin.");
        } else if (selectedTestType === TestType.JLPTAuto) {
          setError("Không tìm thấy templates phù hợp cho JLPT Auto test. Vui lòng liên hệ admin.");
        } else if (selectedTestType === TestType.CustomAuto) {
          setError("Không tìm thấy templates phù hợp cho Custom Auto test. Vui lòng liên hệ admin.");
        } else if (selectedTestType === TestType.EntryAuto) {
          setError("Không tìm thấy templates phù hợp cho Entry Auto test. Vui lòng liên hệ admin.");
        } else {
          setError("Không tìm thấy templates phù hợp. Vui lòng liên hệ admin.");
        }
      } else if (error?.response?.data?.errorCode === "NO_QUESTIONS_FOUND") {
        if (selectedTestType === TestType.JLPTAuto) {
          setError("Không tìm thấy câu hỏi phù hợp cho JLPT Auto test. Vui lòng kiểm tra lại cấu hình.");
        } else if (selectedTestType === TestType.CustomAuto) {
          setError("Không tìm thấy câu hỏi phù hợp cho Custom Auto test. Vui lòng kiểm tra lại cấu hình.");
        } else if (selectedTestType === TestType.EntryAuto) {
          setError("Không tìm thấy câu hỏi phù hợp cho Entry Auto test. Vui lòng kiểm tra lại cấu hình.");
        } else {
          setError("Không tìm thấy câu hỏi phù hợp. Vui lòng kiểm tra lại cấu hình.");
        }
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
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

          {/* Template Types Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin Template Types</h4>
            {loadingTemplates ? (
              <p className="text-blue-800 text-sm">Đang tải danh sách template types...</p>
            ) : templateTypes.length > 0 ? (
              <div>
                <p className="text-blue-800 text-sm mb-2">
                  Các template types khả dụng cho cấp độ {CourseLevel[courseLevel]}:
                </p>
                <div className="space-y-1">
                  {templateTypes
                    .filter(template => {
                      // Chỉ hiển thị template phù hợp với loại test được chọn
                      if (selectedTestType === TestType.CustomManual) {
                        return template.testType === TestType.CustomManual;
                      } else if (selectedTestType === TestType.JLPTAuto) {
                        return template.testType === TestType.JLPTAuto;
                      } else if (selectedTestType === TestType.CustomAuto) {
                        return template.testType === TestType.CustomAuto;
                      } else if (selectedTestType === TestType.EntryAuto) {
                        return template.testType === TestType.EntryAuto;
                      }
                      return true; // Hiển thị tất cả nếu chưa chọn loại test
                    })
                    .map((template) => (
                      <div key={template.testTemplateTypeId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {template.typeName} ({TestType[template.testType]})
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {template.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    ))}
                </div>
                {templateTypes.filter(t => t.testType === selectedTestType).length === 0 && (
                  <p className="text-orange-800 text-sm mt-2">
                    ⚠️ Không có template type nào cho loại test {TestType[selectedTestType]} và cấp độ {CourseLevel[courseLevel]}.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-red-800 text-sm">
                Không có template types nào khả dụng cho cấp độ {CourseLevel[courseLevel]}. 
                Vui lòng liên hệ admin để tạo template types.
              </p>
            )}
          </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại Test</label>
                <select
                  name="testType"
                  value={selectedTestType}
                  onChange={handleTestTypeChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value={TestType.CustomManual}>Custom Manual</option>
                  <option value={TestType.CustomAuto}>Custom Auto</option>
                  <option value={TestType.JLPTAuto}>JLPT Auto</option>
                  <option value={TestType.EntryAuto}>Entry Auto</option>
                </select>
              </div>
              {selectedTestType === TestType.CustomManual && (
                <>
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
                </>
              )}
              {selectedTestType === TestType.JLPTAuto && (
                <div className="md:col-span-2">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMagic className="text-purple-600" />
                      <span className="font-medium text-purple-800">JLPT Auto Test</span>
                    </div>
                    <p className="text-purple-700 text-sm">
                      Test sẽ được tạo tự động với câu hỏi JLPT theo template type. 
                      Thời gian và cấu hình sẽ được tính toán tự động từ template.
                    </p>
                  </div>
                </div>
              )}
              {selectedTestType === TestType.EntryAuto && (
                <div className="md:col-span-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMagic className="text-blue-600" />
                      <span className="font-medium text-blue-800">Entry Auto Test</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Test sẽ được tạo tự động với câu hỏi Entry Auto theo template type. 
                      Thời gian và cấu hình sẽ được tính toán tự động từ template.
                    </p>
                  </div>
                </div>
              )}
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

          {/* Add Questions - Only show for Custom Manual */}
          {selectedTestType === TestType.CustomManual && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Thêm Câu hỏi</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                    <textarea
                      name="content"
                      value={currentQuestion.content}
                      onChange={handleQuestionChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Nhập nội dung câu hỏi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm</label>
                    <input
                      type="number"
                      name="points"
                      value={currentQuestion.points}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      min={1}
                      max={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại nội dung</label>
                    <select
                      name="contentName"
                      value={currentQuestion.contentName}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    >
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
                      name="subContentName"
                      value={currentQuestion.subContentName || ""}
                      onChange={handleQuestionChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 ${
                        courseLevel === undefined || currentQuestion.contentName === undefined ? 'bg-gray-100 text-gray-500' : ''
                      }`}
                      disabled={courseLevel === undefined || currentQuestion.contentName === undefined}
                    >
                      <option value="">Chọn loại bài</option>
                      {getSubContentOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Choices */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Các lựa chọn</label>
                  <div className="space-y-2">
                    {choices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={choice.content}
                          onChange={(e) => handleChoiceChange(index, 'content', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          placeholder={`Lựa chọn ${index + 1}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={choice.isCorrect}
                          onChange={() => {
                            setChoices(prev => prev.map((c, i) => ({
                              ...c,
                              isCorrect: i === index
                            })));
                          }}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600">Đúng</span>
                        {choices.length > 2 && (
                          <button
                            onClick={() => removeChoice(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addChoice}
                    className="mt-2 flex items-center gap-2 text-green-600 hover:text-green-700 text-sm"
                  >
                    <FaPlus size={14} />
                    Thêm lựa chọn
                  </button>
                </div>

                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaPlus size={14} />
                  Thêm câu hỏi
                </button>
              </div>
            </div>
          )}

          {/* Questions List - Only show for Custom Manual */}
          {selectedTestType === TestType.CustomManual && questions.length > 0 && (
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
                      onClick={() => removeQuestion(index)}
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
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={createTest}
              disabled={
                loading || 
                (selectedTestType === TestType.JLPTAuto && templateTypes.filter(t => t.testType === TestType.JLPTAuto).length === 0) ||
                (selectedTestType === TestType.CustomAuto && templateTypes.filter(t => t.testType === TestType.CustomAuto).length === 0) ||
                (selectedTestType === TestType.EntryAuto && templateTypes.filter(t => t.testType === TestType.EntryAuto).length === 0)
              }
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors ${
                loading || 
                (selectedTestType === TestType.JLPTAuto && templateTypes.filter(t => t.testType === TestType.JLPTAuto).length === 0) ||
                (selectedTestType === TestType.CustomAuto && templateTypes.filter(t => t.testType === TestType.CustomAuto).length === 0) ||
                (selectedTestType === TestType.EntryAuto && templateTypes.filter(t => t.testType === TestType.EntryAuto).length === 0)
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
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