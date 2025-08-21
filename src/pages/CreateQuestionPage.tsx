import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaMusic, FaRobot } from 'react-icons/fa';
import { 
  QuestionDifficulty, 
  ContentName, 
  CourseLevel, 
  SubContentName,
  CreateQuestionDto,
  GenerateQuestionRequestDto,
  ExplanationRequestDto,
} from '../types/question.types';
import { 
  createQuestion,
  createChoice,
  generateQuestionWithAI,
  generateExplanation,
} from '../services/questionService';
import { 
  ChoiceCreateDto,
  validateChoiceCreateDto,
} from '../types/choice.types';
import { getAllSubContents, SubContentDto } from '../services/subContentService';
import { useNotification } from '../components/notifications';
import paths from '../routes/path';

const CreateQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, warning } = useNotification();
  
  // Form states
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | null>(null);
  const [courseLevel, setCourseLevel] = useState<CourseLevel | null>(null);
  const [contentName, setContentName] = useState<ContentName | null>(null);
  const [selectedSubContent, setSelectedSubContent] = useState<string>("");
  const [points, setPoints] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true); // Default to active
  
  // Question content
  const [questionContent, setQuestionContent] = useState("");
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [showQuestionExplanation, setShowQuestionExplanation] = useState(false);
  
  // Audio file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  
  // Choices
  const [choices, setChoices] = useState([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);
  
  // SubContent options
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);
  const [loading, setLoading] = useState(false);
  
  // AI Generation states
  const [aiGenerating, setAiGenerating] = useState(false);
  const [explanationGenerating, setExplanationGenerating] = useState(false);
  
  // Mapping functions for AI API
  const mapContentNameToEnglish = (contentName: ContentName): string => {
    switch (contentName) {
      case ContentName.Kanji: return "Kanji";
      case ContentName.Vocabulary: return "Vocabulary";
      case ContentName.Grammar: return "Grammar";
      case ContentName.Reading: return "Reading";
      case ContentName.Listening: return "Reading"; // Listening maps to Reading for AI API
      default: return "Reading";
    }
  };
  
  const getDescriptionFromSubContentDisplay = (subContentDisplay: string): string => {
    // Extract description after " - " 
    const parts = subContentDisplay.split(" - ");
    return parts.length > 1 ? parts[1] : subContentDisplay;
  };
  
  // Check if current selection is valid for AI generation
  const canGenerateWithAI = (): boolean => {
    return courseLevel !== null && 
           contentName !== null && 
           contentName !== ContentName.Listening && // AI doesn't support Listening
           selectedSubContent !== "";
  };
  
  // Labels
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
  
  // Reset selectedSubContent when contentName changes
  useEffect(() => {
    setSelectedSubContent("");
  }, [contentName]);
  
  // Fetch subcontents when courseLevel and contentName change
  useEffect(() => {
    const fetchSubContents = async () => {
      if (courseLevel !== null && contentName !== null) {
        try {
          const data = await getAllSubContents(undefined, courseLevel, contentName);
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
  }, [courseLevel, contentName]);
  
  const addChoice = () => {
    if (choices.length < 6) {
      setChoices([...choices, { content: '', isCorrect: false }]);
    }
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      const newChoices = choices.filter((_, i) => i !== index);
      setChoices(newChoices);
    }
  };

  const updateChoiceContent = (index: number, content: string) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], content };
    setChoices(newChoices);
  };

  const updateChoiceCorrect = (index: number) => {
    const newChoices = choices.map((choice, i) => ({
      ...choice,
      isCorrect: i === index
    }));
    setChoices(newChoices);
  };

  const validateChoices = (): { isValid: boolean; message?: string } => {
    if (choices.length < 2) {
      return { isValid: false, message: "Phải có ít nhất 2 lựa chọn" };
    }

    const validChoices = choices.filter(c => c.content.trim());
    if (validChoices.length < 2) {
      return { isValid: false, message: "Cần ít nhất 2 lựa chọn có nội dung" };
    }

    // Validate each choice according to backend rules
    for (let i = 0; i < validChoices.length; i++) {
      const choice = validChoices[i];
      const validation = validateChoiceCreateDto(choice);
      if (!validation.isValid) {
        return { isValid: false, message: `Lựa chọn ${i + 1}: ${validation.message}` };
      }
    }

    if (!validChoices.some(c => c.isCorrect)) {
      return { isValid: false, message: "Cần ít nhất 1 đáp án đúng" };
    }

    return { isValid: true };
  };

  // Handle audio file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if contentName is Listening
      if (contentName !== ContentName.Listening) {
        warning("Chỉ có thể thêm file âm thanh cho câu hỏi loại 'Nghe hiểu'");
        e.target.value = ''; // Reset file input
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        warning("Vui lòng chọn file audio hợp lệ");
        e.target.value = ''; // Reset file input
        return;
      }
      
      // Validate file size (e.g., max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        warning("File audio không được vượt quá 10MB");
        e.target.value = ''; // Reset file input
        return;
      }
      
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  // Remove audio file
  const removeAudioFile = () => {
    setAudioFile(null);
    setAudioFileName("");
  };

  // Handle AI generation
  const handleGenerateWithAI = async () => {
    if (!canGenerateWithAI()) {
      error("Vui lòng chọn đầy đủ Cấp độ, Loại câu hỏi và Nội dung con để tạo câu hỏi bằng AI");
      return;
    }

    setAiGenerating(true);
    try {
      const requestDto: GenerateQuestionRequestDto = {
        level: COURSE_LEVEL_LABELS[courseLevel!],
        contentName: mapContentNameToEnglish(contentName!),
        description: getDescriptionFromSubContentDisplay(selectedSubContent)
      };

      const response = await generateQuestionWithAI(requestDto);
      
      // Fill form with AI generated data
      setQuestionContent(response.questionText);
      
      // Fill explanation from AI response
      if (response.explanation) {
        setQuestionExplanation(response.explanation);
        setShowQuestionExplanation(true); // Auto show explanation section when AI generates it
      }
      
      // Map AI choices to form choices
      const newChoices = response.choices.map(choice => ({
        content: choice.choiceText,
        isCorrect: choice.isCorrect
      }));
      
      // Ensure we have at least 4 choices (pad with empty if needed)
      while (newChoices.length < 4) {
        newChoices.push({ content: "", isCorrect: false });
      }
      
      setChoices(newChoices);
      
      success("🤖 Đã tạo câu hỏi bằng AI thành công! Vui lòng kiểm tra và chỉnh sửa nếu cần.");
      
    } catch (err: any) {
      console.error("Error generating question with AI:", err);
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo câu hỏi bằng AI";
      error(`❌ Lỗi tạo câu hỏi AI: ${errorMessage}`);
    } finally {
      setAiGenerating(false);
    }
  };
  
  // Handle AI explanation generation
  const handleGenerateExplanation = async () => {
    if (!questionContent.trim()) {
      warning("Vui lòng nhập nội dung câu hỏi trước khi tạo giải thích");
      return;
    }

    // Check if there's at least one non-empty choice
    const validChoices = choices.filter(choice => choice.content.trim() !== '');
    if (validChoices.length === 0) {
      warning("Vui lòng nhập ít nhất một lựa chọn để tạo giải thích");
      return;
    }

    setExplanationGenerating(true);
    try {
      const requestDto: ExplanationRequestDto = {
        questionText: questionContent,
        choices: validChoices.map((choice) => ({
          choiceText: choice.content,
          isCorrect: choice.isCorrect
        }))
      };

      const response = await generateExplanation(requestDto);
      
      // Fill explanation from AI response
      setQuestionExplanation(response.explanation);
      setShowQuestionExplanation(true); // Auto show explanation section

      success("🤖 Đã tạo giải thích bằng AI thành công! Vui lòng kiểm tra và chỉnh sửa nếu cần.");
      
    } catch (err: any) {
      console.error("Error generating explanation:", err);
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo giải thích bằng AI";
      error(`❌ Lỗi tạo giải thích AI: ${errorMessage}`);
    } finally {
      setExplanationGenerating(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug logs
    console.log("Form values:", {
      difficulty,
      courseLevel,
      contentName,
      selectedSubContent,
      questionContent: questionContent.trim(),
      points
    });
    
    if (!questionContent.trim()) {
      warning("Thiếu nội dung câu hỏi", "Vui lòng nhập nội dung câu hỏi");
      return;
    }

    if (questionContent.trim().length < 10) {
      warning("Nội dung quá ngắn", "Nội dung câu hỏi phải có ít nhất 10 ký tự");
      return;
    }

    if (contentName === undefined) {
      warning("Chưa chọn loại nội dung", "Vui lòng chọn loại nội dung");
      return;
    }

    if (courseLevel === undefined) {
      warning("Chưa chọn cấp độ", "Vui lòng chọn cấp độ");
      return;
    }

    if (selectedSubContent === undefined) {
      warning("Chưa chọn loại bài", "Vui lòng chọn loại bài");
      return;
    }

    // Validate choices
    const choiceValidation = validateChoices();
    if (!choiceValidation.isValid) {
      warning("Lựa chọn không hợp lệ", choiceValidation.message || "Vui lòng kiểm tra lại các lựa chọn");
      return;
    }
    
    // Validation
    if (difficulty === null || courseLevel === null || contentName === null || !selectedSubContent || !questionContent.trim()) {
      console.log("Validation failed:", {
        hasDifficulty: difficulty !== null,
        hasCourseLevel: courseLevel !== null,
        hasContentName: contentName !== null,
        hasSelectedSubContent: !!selectedSubContent,
        hasQuestionContent: !!questionContent.trim()
      });
      warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    setLoading(true);
    
    try {
      // Find the subContent that matches the selected option
      const selectedSubContentData = subContents.find(sc => 
        `${sc.contentNameDescription} - ${sc.subContentNameDescription}` === selectedSubContent
      );
      
      if (!selectedSubContentData) {
        warning("Không tìm thấy nội dung con được chọn");
        return;
      }
      
      // Map string to enum
      console.log("selectedSubContentData:", selectedSubContentData); // Debug
      console.log("subContentName from API:", selectedSubContentData.subContentName); // Debug
      
      // Map string to enum - handle both string and numeric values
      let subContentName: SubContentName | null = null;
      
      console.log("Available SubContentName keys:", Object.keys(SubContentName)); // Debug
      
      // Try to find by string key first
      const subContentNameKey = Object.keys(SubContentName).find(
        key => key === selectedSubContentData.subContentName
      );
      
      console.log("Found key:", subContentNameKey); // Debug
      
      if (subContentNameKey) {
        subContentName = SubContentName[subContentNameKey as keyof typeof SubContentName];
      } else {
        // If not found by string key, try to parse as number
        const numericValue = parseInt(selectedSubContentData.subContentName);
        console.log("Parsed numeric value:", numericValue); // Debug
        if (!isNaN(numericValue)) {
          subContentName = numericValue as SubContentName;
        }
      }
      
      console.log("Mapped subContentName:", subContentName); // Debug
      
      if (subContentName === null || subContentName === undefined) {
        warning("Không thể map subContentName");
        return;
      }
      
      // Create question
      const questionDto: CreateQuestionDto = {
        content: questionContent.trim(),
        explanation: questionExplanation.trim() || undefined,
        points: points,
        difficulty: difficulty,
        isActive: isActive,
        contentName: contentName,
        level: courseLevel,
        subContentName: subContentName,
        audioFile: audioFile || undefined, // Include audio file if selected
      };
      
      const createdQuestion = await createQuestion(questionDto);
      
      // Create choices
      for (const choice of choices) {
        const choiceDto: ChoiceCreateDto = {
          content: choice.content.trim(),
          isCorrect: choice.isCorrect,
        };
        
        await createChoice(createdQuestion.id, choiceDto);
      }
      
      success("Tạo câu hỏi thành công!");
      navigate(paths.question_management);
      
          } catch (err: any) {
        console.error("Error creating question:", err);
        
        // Handle backend validation errors
        if (err?.response?.status === 400 && err?.response?.data?.errors) {
          const validationErrors = err.response.data.errors;
          let errorMessage = "Lỗi validation:\n";
          
          Object.entries(validationErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessage += `- ${field}: ${messages.join(', ')}\n`;
            } else {
              errorMessage += `- ${field}: ${messages}\n`;
            }
          });
          
          error("Lỗi validation", errorMessage.trim());
        } else if (err?.response?.data?.message) {
          error("Lỗi", err.response.data.message);
        } else {
          error("Có lỗi xảy ra khi tạo câu hỏi");
        }
      } finally {
      setLoading(false);
    }
  };
  
  // Get available subcontent options
  const getSubContentOptions = () => {
    if (courseLevel === null || contentName === null) return [];
    
    console.log("subContents:", subContents); // Debug
    
    const options = subContents.map(sc => {
      console.log("Processing subContent:", sc); // Debug
      
      // Map the string enum names to their properly capitalized labels
      const contentNameKey = sc.contentName as keyof typeof ContentName;
      const subContentNameKey = sc.subContentName as keyof typeof SubContentName;
      
      const contentNameLabel = CONTENT_NAME_LABELS[ContentName[contentNameKey]];
      const subContentNameLabel = SUBCONTENT_NAME_LABELS[SubContentName[subContentNameKey]];
      
      return `${contentNameLabel} - ${subContentNameLabel}`;
    });
    
    console.log("Final options:", options); // Debug
    return [...new Set(options)]; // Remove duplicates
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(paths.question_management)}
            className="flex items-center text-gray-600 hover:text-green-700"
          >
            <FaArrowLeft className="mr-2" /> 
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Tạo câu hỏi mới</h1>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {/* Top section - Dropdowns and points */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó *
              </label>
              <select
                value={difficulty !== null ? difficulty : ""}
                onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Chọn độ khó</option>
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
            
            {/* Course Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ *
              </label>
              <select
                value={courseLevel !== null ? courseLevel : ""}
                onChange={(e) => setCourseLevel(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Chọn cấp độ</option>
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
            
            {/* Content Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại câu hỏi *
              </label>
              <select
                value={contentName !== null ? contentName : ""}
                onChange={(e) => setContentName(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Chọn loại câu hỏi</option>
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
            
            {/* SubContent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung con *
              </label>
              <select
                value={selectedSubContent}
                onChange={(e) => setSelectedSubContent(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  courseLevel === null || contentName === null ? 'bg-gray-100 text-gray-500' : ''
                }`}
                disabled={courseLevel === null || contentName === null}
                required
              >
                <option value="">Chọn nội dung con</option>
                {getSubContentOptions().map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Vô hiệu</option>
              </select>
            </div>
          </div>
          
          {/* AI Generation Button */}
          {canGenerateWithAI() && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FaRobot className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Tạo câu hỏi bằng AI</h3>
                    <p className="text-xs text-gray-600">
                      Sử dụng AI để tạo câu hỏi cho {COURSE_LEVEL_LABELS[courseLevel!]} - {CONTENT_NAME_LABELS[contentName!]}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={aiGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all transform hover:scale-105"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <FaRobot className="text-sm" />
                      <span className="text-sm">Tạo bằng AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Question Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung câu hỏi *
            </label>
            <div className="relative">
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Nhập nội dung câu hỏi..."
                required
              />
              <button
                type="button"
                onClick={() => setShowQuestionExplanation(!showQuestionExplanation)}
                className="absolute top-2 right-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Giải thích
              </button>
            </div>
            
            {showQuestionExplanation && (
              <div className="mt-2 relative">
                <textarea
                  value={questionExplanation}
                  onChange={(e) => setQuestionExplanation(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Nhập giải thích cho câu hỏi (tùy chọn)..."
                />
                {/* Generate Explanation Button */}
                <button
                  type="button"
                  onClick={handleGenerateExplanation}
                  disabled={explanationGenerating}
                  className="absolute top-2 right-2 p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Tạo giải thích bằng AI"
                >
                  <FaRobot className={`w-4 h-4 ${explanationGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
          
          {/* Audio File Upload - Only show for Listening content */}
          {contentName === ContentName.Listening && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File âm thanh (tùy chọn)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {audioFileName && (
                  <div className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    <FaMusic className="mr-1" /> {audioFileName}
                    <button
                      type="button"
                      onClick={removeAudioFile}
                      className="ml-2 text-green-800 hover:text-green-900"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Chỉ câu hỏi loại "Nghe hiểu" mới có thể thêm file âm thanh
              </p>
            </div>
          )}
          
          {/* Choices */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Đáp án *
            </label>
            <div className="space-y-4">
              {choices.map((choice, index) => (
                <div key={index} className="flex items-start gap-3">
                  {/* Radio button */}
                  <input
                    type="radio"
                    name="correctChoice"
                    checked={choice.isCorrect}
                    onChange={() => updateChoiceCorrect(index)}
                    className="mt-2"
                  />
                  
                  {/* Choice content */}
                  <div className="flex-1 relative">
                    <textarea
                      value={choice.content}
                      onChange={(e) => updateChoiceContent(index, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder={`Đáp án ${index + 1}...`}
                      required
                    />
                  </div>
                  
                  {/* Choice explanation */}
                  {/* Removed explanation functionality */}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => removeChoice(choices.length - 1)}
              className="mt-4 ml-2 flex items-center text-red-600 hover:text-red-700"
            >
              <FaTrash className="mr-2" /> Xóa đáp án
            </button>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Tạo câu hỏi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionPage; 