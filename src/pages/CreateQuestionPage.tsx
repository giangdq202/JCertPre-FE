import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { createQuestion, createChoice, CreateQuestionDto, ChoiceCreateDto, QuestionDifficulty, ContentName, SubContentName, CourseLevel } from "../services/questionService";
import { getAllSubContents, SubContentDto } from "../services/subContentService";
import paths from "../routes/path";

const CreateQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  
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
    [ContentName.Vocabulary]: "Từ vựng",
    [ContentName.Grammar]: "Ngữ pháp",
    [ContentName.Reading]: "Đọc hiểu",
    [ContentName.Listening]: "Nghe hiểu",
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
  
  // Update choices
  const updateChoice = (index: number, field: string, value: any) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setChoices(newChoices);
  };
  
  // Toggle choice explanation
  const toggleChoiceExplanation = (index: number) => {
    // Removed explanation functionality
  };
  
  // Handle form submission
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
    
    // Validation
    if (difficulty === null || courseLevel === null || contentName === null || !selectedSubContent || !questionContent.trim()) {
      console.log("Validation failed:", {
        hasDifficulty: difficulty !== null,
        hasCourseLevel: courseLevel !== null,
        hasContentName: contentName !== null,
        hasSelectedSubContent: !!selectedSubContent,
        hasQuestionContent: !!questionContent.trim()
      });
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    const hasCorrectChoice = choices.some(choice => choice.isCorrect);
    if (!hasCorrectChoice) {
      alert("Vui lòng chọn ít nhất một đáp án đúng");
      return;
    }
    
    const hasChoiceContent = choices.every(choice => choice.content.trim() !== "");
    if (!hasChoiceContent) {
      alert("Vui lòng điền đầy đủ nội dung các đáp án");
      return;
    }
    
    setLoading(true);
    
    try {
      // Parse selectedSubContent to get subContentName
      const subContentNameStr = selectedSubContent.split(" - ")[1]; // Lấy phần thứ 2 sau dấu " - "
      
      // Find the subContent that matches the selected option
      const selectedSubContentData = subContents.find(sc => 
        `${sc.contentNameDescription} - ${sc.subContentNameDescription}` === selectedSubContent
      );
      
      if (!selectedSubContentData) {
        alert("Không tìm thấy nội dung con được chọn");
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
        alert("Không thể map subContentName");
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
      
      alert("Tạo câu hỏi thành công!");
      navigate(paths.question_management);
      
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Có lỗi xảy ra khi tạo câu hỏi");
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
      
      // Use descriptions directly from API response
      const contentNameLabel = sc.contentNameDescription;
      const subContentNameLabel = sc.subContentNameDescription;
      
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
              <div className="mt-2">
                <textarea
                  value={questionExplanation}
                  onChange={(e) => setQuestionExplanation(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Nhập giải thích cho câu hỏi (tùy chọn)..."
                />
              </div>
            )}
          </div>
          
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
                    onChange={() => {
                      const newChoices = choices.map((c, i) => ({
                        ...c,
                        isCorrect: i === index
                      }));
                      setChoices(newChoices);
                    }}
                    className="mt-2"
                  />
                  
                  {/* Choice content */}
                  <div className="flex-1 relative">
                    <textarea
                      value={choice.content}
                      onChange={(e) => updateChoice(index, 'content', e.target.value)}
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