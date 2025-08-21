import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTimes, FaRobot } from "react-icons/fa";
import { useNotification } from "../components/notifications";
import {
  QuestionDto,
  QuestionDifficulty,
  ContentName,
  SubContentName,
  CourseLevel,
  ExplanationRequestDto,
} from "../types/question.types";
import { ChoiceReadDto } from "../types/choice.types";
import {
  getQuestionById,
  updateQuestion,
  updateChoice,
  getChoicesByQuestionId,
  generateExplanation,
} from "../services/questionService";
import paths from "../routes/path";

const EditQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId: string }>();
  const { success, error, warning } = useNotification();

  // Question states
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [choices, setChoices] = useState<ChoiceReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [explanationGenerating, setExplanationGenerating] = useState(false);
  
  // Store display descriptions from API response
  const [levelDescription, setLevelDescription] = useState<string>("");

  // Form states
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(QuestionDifficulty.Easy);
  const [isActive, setIsActive] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(CourseLevel.N5);
  const [selectedContentName, setSelectedContentName] = useState<ContentName>(ContentName.Kanji);
  const [selectedSubContentName, setSelectedSubContentName] = useState<SubContentName | null>(null);

  // Audio states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeCurrentAudio, setRemoveCurrentAudio] = useState(false);

  // SubContent states
  // Note: Now using static mapping instead of API data

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

  // Static mapping between ContentName and SubContentName based on backend enum
  const CONTENT_TO_SUBCONTENT_MAPPING: Record<ContentName, SubContentName[]> = {
    [ContentName.Kanji]: [SubContentName.Mondai1, SubContentName.Mondai2],
    [ContentName.Vocabulary]: [SubContentName.Mondai3, SubContentName.Mondai4],
    [ContentName.Grammar]: [SubContentName.Mondai5, SubContentName.Mondai6, SubContentName.Mondai7],
    [ContentName.Reading]: [SubContentName.Mondai8, SubContentName.Mondai9, SubContentName.Mondai10],
    [ContentName.Listening]: [SubContentName.Mondai11, SubContentName.Mondai12, SubContentName.Mondai13, SubContentName.Mondai14]
  };

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
        setLevelDescription((questionData as any).levelDescription || "");

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

  // Reset selected subContentName when contentName changes to ensure valid selection
  useEffect(() => {
    if (selectedContentName !== null) {
      const availableOptions = CONTENT_TO_SUBCONTENT_MAPPING[selectedContentName] || [];
      
      // Reset if current selection is not available for the new content type
      if (selectedSubContentName !== null && !availableOptions.includes(selectedSubContentName)) {
        setSelectedSubContentName(null);
      }
    }
  }, [selectedContentName, selectedSubContentName]);

  // Helper function to get subContent options with proper labels
  const getSubContentOptions = () => {
    if (selectedContentName === null) return [];
    
    // Use static mapping instead of API data
    const availableSubContents = CONTENT_TO_SUBCONTENT_MAPPING[selectedContentName] || [];
    
    return availableSubContents.map(subContentEnum => {
      const contentLabel = CONTENT_NAME_LABELS[selectedContentName];
      const subContentLabel = SUBCONTENT_NAME_LABELS[subContentEnum];
      return {
        value: subContentEnum,
        label: `${contentLabel} - ${subContentLabel}`
      };
    });
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

  // Handle explanation generation
  const handleGenerateExplanation = async () => {
    if (!content.trim()) {
      warning("Vui lòng nhập nội dung câu hỏi trước khi tạo giải thích");
      return;
    }

    // Check if there's at least one non-empty choice
    const validChoices = choices.filter(choice => choice.content.trim() !== '');
    if (validChoices.length === 0) {
      warning("Vui lòng nhập ít nhất một lựa chọn để tạo giải thích");
      return;
    }

    try {
      setExplanationGenerating(true);
      const requestDto: ExplanationRequestDto = {
        questionText: content,
        choices: validChoices.map(choice => ({
          choiceText: choice.content,
          isCorrect: choice.isCorrect
        }))
      };

      const explanationResponse = await generateExplanation(requestDto);
      setExplanation(explanationResponse.explanation);
      success("🤖 Đã tạo giải thích bằng AI thành công! Vui lòng kiểm tra và chỉnh sửa nếu cần.");
    } catch (err) {
      console.error("Error generating explanation:", err);
      const errorMessage = (err as any).response?.data?.message || (err as any).message || "Có lỗi xảy ra khi tạo giải thích bằng AI";
      error(`❌ Lỗi tạo giải thích AI: ${errorMessage}`);
    } finally {
      setExplanationGenerating(false);
    }
  };

  // Audio handling functions
  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        error('Vui lòng chọn file audio hợp lệ!');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        error('File audio không được vượt quá 10MB!');
        return;
      }

      setAudioFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveNewAudio = () => {
    setAudioFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleToggleRemoveCurrentAudio = () => {
    setRemoveCurrentAudio(!removeCurrentAudio);
  };

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      // Update question with audio file if provided
      const updateData: any = {
        content,
        explanation,
        points,
        difficulty,
        isActive,
        contentName: selectedContentName,
        level: selectedLevel,
        subContentName: selectedSubContentName,
      };

      // Add audio file if a new one is selected
      if (audioFile) {
        updateData.audioFile = audioFile;
      }

      await updateQuestion(questionId!, updateData);

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

            {/* Audio Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cập nhật audio
              </label>
              
              {/* Check if question has existing audio */}
              {question?.questionAttachments?.some(att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/')) && (
                <div className="mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={removeCurrentAudio}
                      onChange={handleToggleRemoveCurrentAudio}
                      className="mr-2"
                    />
                    <span className="text-sm text-red-600">Xóa audio hiện tại</span>
                  </label>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  disabled={saving}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500">
                  Hỗ trợ các định dạng: MP3, WAV, M4A. Tối đa 10MB.
                </p>

                {/* Preview new audio */}
                {previewUrl && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border">
                    <span className="text-blue-600 text-lg">🔊</span>
                    <audio controls className="h-8">
                      <source src={previewUrl} type={audioFile?.type} />
                      Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                    <span className="text-sm text-blue-600">Audio mới (xem trước)</span>
                    <button
                      type="button"
                      onClick={handleRemoveNewAudio}
                      className="text-red-500 hover:text-red-700"
                      title="Xóa audio mới"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>

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
                  value={selectedSubContentName || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setSelectedSubContentName(parseInt(value) as SubContentName);
                    } else {
                      setSelectedSubContentName(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn nội dung con</option>
                  {getSubContentOptions().map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
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
              <div className="relative">
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Nhập giải thích cho câu hỏi..."
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
