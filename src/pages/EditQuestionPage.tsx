import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaTimes } from "react-icons/fa";
import { useNotification } from "../components/notifications";
import {
  QuestionDto,
  QuestionDifficulty,
  ContentName,
  SubContentName,
  CourseLevel,
} from "../types/question.types";
import { ChoiceReadDto } from "../types/choice.types";
import {
  getQuestionById,
  updateQuestion,
  updateChoice,
  getChoicesByQuestionId,
} from "../services/questionService";
import {
  getAllSubContents,
  SubContentDto,
} from "../services/subContentService";
import paths from "../routes/path";

const EditQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId: string }>();
  const { success, error } = useNotification();

  // Question states
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [choices, setChoices] = useState<ChoiceReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Store display descriptions from API response
  const [contentNameDescription, setContentNameDescription] = useState<string>("");
  const [levelDescription, setLevelDescription] = useState<string>("");
  const [subContentNameDescription, setSubContentNameDescription] = useState<string>("");

  // Form states
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(QuestionDifficulty.Easy);
  const [isActive, setIsActive] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(CourseLevel.N5);
  const [selectedContentName, setSelectedContentName] = useState<ContentName>(ContentName.Kanji);
  const [selectedSubContentName, setSelectedSubContentName] = useState<SubContentName | null>(null);

  // SubContent states
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);
  const [availableSubContents, setAvailableSubContents] = useState<SubContentDto[]>([]);

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

  // Fetch subContents on mount
  useEffect(() => {
    const fetchSubContents = async () => {
      try {
        const data = await getAllSubContents();
        setSubContents(data.items || []);
      } catch (err) {
        console.error("Error fetching subContents:", err);
        error("Không thể tải danh sách nội dung con");
      }
    };
    fetchSubContents();
  }, []);

  // Fetch question data on mount
  useEffect(() => {
    if (!questionId) {
      error("ID câu hỏi không hợp lệ");
      navigate(paths.question_management);
      return;
    }

    const fetchQuestionData = async () => {
      setLoading(true);
      try {
        const [questionData, choicesData] = await Promise.all([
          getQuestionById(questionId),
          getChoicesByQuestionId(questionId),
        ]);

        setQuestion(questionData);
        setChoices(choicesData);

        // Set form values
        setContent(questionData.content);
        setExplanation(questionData.explanation || "");
        setPoints(questionData.points);
        setDifficulty(questionData.difficulty);
        setIsActive(questionData.isActive);
        
        // Convert values from API to enum values (handle both string and enum cases)
        const levelValue = typeof questionData.level === 'string' 
          ? stringToCourseLevel(questionData.level) 
          : questionData.level;
        const contentNameValue = typeof questionData.contentName === 'string'
          ? stringToContentName(questionData.contentName)
          : questionData.contentName;
        const subContentNameValue = typeof questionData.subContentName === 'string'
          ? stringToSubContentName(questionData.subContentName)
          : questionData.subContentName;
        
        setSelectedLevel(levelValue);
        setSelectedContentName(contentNameValue);
        setSelectedSubContentName(subContentNameValue);
        
        // Store the display descriptions for dropdown (from API response)
        setContentNameDescription((questionData as any).contentNameDescription || "");
        setLevelDescription((questionData as any).levelDescription || "");
        setSubContentNameDescription((questionData as any).subContentNameDescription || "");

      } catch (err) {
        console.error("Error fetching question data:", err);
        error("Không thể tải thông tin câu hỏi");
        navigate(paths.question_management);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [questionId]);

  // Update available subContents when level or contentName changes
  useEffect(() => {
    if (subContents.length > 0) {
      const filtered = subContents.filter(
        (sc) =>
          parseInt(sc.level) === selectedLevel &&
          parseInt(sc.contentName) === selectedContentName
      );
      setAvailableSubContents(filtered);

      // Reset selected subContentName if not available in new filtered list
      if (selectedSubContentName !== null) {
        const isAvailable = filtered.some(
          (sc) => parseInt(sc.subContentName) === selectedSubContentName
        );
        if (!isAvailable) {
          setSelectedSubContentName(null);
        }
      }
    }
  }, [selectedLevel, selectedContentName, subContents, selectedSubContentName]);

  // Fetch subContents for current level and contentName
  useEffect(() => {
    if (selectedLevel !== null && selectedContentName !== null) {
      const fetchSubContentsForSelection = async () => {
        try {
          const data = await getAllSubContents();
          const filtered = data.items?.filter(
            (sc) =>
              parseInt(sc.level) === selectedLevel &&
              parseInt(sc.contentName) === selectedContentName
          ) || [];
          setAvailableSubContents(filtered);
        } catch (err) {
          console.error("Error fetching subContents for selection:", err);
        }
      };
      fetchSubContentsForSelection();
    }
  }, [selectedLevel, selectedContentName]);

  // Helper function to get subContent options with proper labels
  const getSubContentOptions = () => {
    if (selectedLevel === null || selectedContentName === null) return [];
    
    const options = availableSubContents.map(sc => {
      // Use descriptions from API response for proper display
      return `${sc.contentNameDescription} - ${sc.subContentNameDescription}`;
    });
    
    return [...new Set(options)]; // Remove duplicates
  };

  // Helper functions to convert string values from API to enum values
  const stringToContentName = (str: string): ContentName => {
    switch (str) {
      case "Kanji": return ContentName.Kanji;
      case "Vocabulary": return ContentName.Vocabulary;
      case "Grammar": return ContentName.Grammar;
      case "Reading": return ContentName.Reading;
      case "Listening": return ContentName.Listening;
      default: return ContentName.Kanji;
    }
  };

  const stringToCourseLevel = (str: string): CourseLevel => {
    switch (str) {
      case "N5": return CourseLevel.N5;
      case "N4": return CourseLevel.N4;
      case "N3": return CourseLevel.N3;
      case "N2": return CourseLevel.N2;
      case "N1": return CourseLevel.N1;
      default: return CourseLevel.N5;
    }
  };

  const stringToSubContentName = (str: string): SubContentName => {
    switch (str) {
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

  // Helper function to get the display text for selected subContent
  const getSelectedSubContentDisplayText = () => {
    if (selectedSubContentName === null) return "";
    
    // Use stored descriptions from API response
    if (contentNameDescription && subContentNameDescription) {
      return `${contentNameDescription} - ${subContentNameDescription}`;
    }
    
    // Fallback: Find the subContent that matches the selected enum value
    const subContent = availableSubContents.find(sc => 
      parseInt(sc.subContentName) === selectedSubContentName
    );
    
    if (subContent) {
      return `${subContent.contentNameDescription} - ${subContent.subContentNameDescription}`;
    }
    
    return "";
  };

  // Handle choice content change
  const handleChoiceChange = (index: number, newContent: string) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = { ...updatedChoices[index], content: newContent };
    setChoices(updatedChoices);
  };

  // Handle correct choice change
  const handleCorrectChoiceChange = (selectedIndex: number) => {
    const updatedChoices = choices.map((choice, index) => ({
      ...choice,
      isCorrect: index === selectedIndex,
    }));
    setChoices(updatedChoices);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubContentName) {
      error("Vui lòng chọn nội dung con");
      return;
    }

    if (choices.length === 0) {
      error("Vui lòng thêm ít nhất một đáp án");
      return;
    }

    const hasCorrectChoice = choices.some((choice) => choice.isCorrect);
    if (!hasCorrectChoice) {
      error("Vui lòng chọn đáp án đúng");
      return;
    }

    setSaving(true);
    try {
      // Update question
      await updateQuestion(questionId!, {
        content,
        explanation,
        points,
        difficulty,
        isActive,
        contentName: selectedContentName,
        level: selectedLevel,
        subContentName: selectedSubContentName,
      });

      // Update choices
      for (const choice of choices) {
        await updateChoice(choice.choiceId, {
          content: choice.content,
          isCorrect: choice.isCorrect,
        });
      }

      success("Cập nhật câu hỏi thành công!");
      navigate(paths.question_management);
    } catch (err: any) {
      console.error("Error updating question:", err);
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
        error("Có lỗi xảy ra khi cập nhật câu hỏi");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-green-500 border-opacity-25 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(paths.question_management)}
            className="flex items-center text-gray-600 hover:text-green-700 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Chỉnh sửa câu hỏi
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Question Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung câu hỏi *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Nhập nội dung câu hỏi..."
                required
              />
            </div>

            {/* Audio Files Display */}
            {question?.questionAttachments && question.questionAttachments.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File âm thanh hiện tại
                </label>
                <div className="space-y-2">
                  {question.questionAttachments
                    .filter(att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/'))
                    .map((att, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-blue-600 text-lg">🔊</span>
                        <audio controls className="h-8">
                          <source src={att.mediaUrl} type="audio/mpeg" />
                          Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                        <span className="text-sm text-gray-500">Audio file</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Question Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ *
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(parseInt(e.target.value) as CourseLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {Object.keys(CourseLevel)
                    .filter((k) => isNaN(Number(k)))
                    .map((key) => {
                      const value = CourseLevel[key as keyof typeof CourseLevel];
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
                  value={selectedContentName}
                  onChange={(e) => setSelectedContentName(parseInt(e.target.value) as ContentName)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {Object.keys(ContentName)
                    .filter((k) => isNaN(Number(k)))
                    .map((key) => {
                      const value = ContentName[key as keyof typeof ContentName];
                      return (
                        <option key={key} value={value}>
                          {CONTENT_NAME_LABELS[value]}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Sub Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung con *
                </label>
                <select
                  value={getSelectedSubContentDisplayText()}
                                     onChange={(e) => {
                     // Find the corresponding subContent from availableSubContents
                     const selectedOption = e.target.value;
                     const subContent = availableSubContents.find(sc => {
                       const optionText = `${sc.contentNameDescription} - ${sc.subContentNameDescription}`;
                       return optionText === selectedOption;
                     });
                     
                     if (subContent) {
                       setSelectedSubContentName(parseInt(subContent.subContentName) as SubContentName);
                       // Update stored descriptions
                       setContentNameDescription(subContent.contentNameDescription);
                       setSubContentNameDescription(subContent.subContentNameDescription);
                     }
                   }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ khó *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value) as QuestionDifficulty)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {Object.keys(QuestionDifficulty)
                    .filter((k) => isNaN(Number(k)))
                    .map((key) => {
                      const value = QuestionDifficulty[key as keyof typeof QuestionDifficulty];
                      return (
                        <option key={key} value={value}>
                          {DIFFICULTY_LABELS[value]}
                        </option>
                      );
                    })}
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
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
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

            {/* Explanation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giải thích (tùy chọn)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Nhập giải thích cho câu hỏi..."
              />
            </div>

            {/* Choices */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Đáp án *
              </label>
              <div className="space-y-4">
                {choices.map((choice, index) => (
                  <div key={choice.choiceId} className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={choice.isCorrect}
                      onChange={() => handleCorrectChoiceChange(index)}
                      className="mt-2"
                    />
                    
                    <div className="flex-1">
                      <textarea
                        value={choice.content}
                        onChange={(e) => handleChoiceChange(index, e.target.value)}
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

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(paths.question_management)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Cập nhật câu hỏi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionPage;
