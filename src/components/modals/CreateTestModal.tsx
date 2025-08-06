import React, { useState } from "react";
import { FaTimes, FaPlus, FaTrash, FaSave } from "react-icons/fa";
import { TestType, TestStatus, CourseLevel, CreateTestDto } from "../../services/testService";
import { QuestionDto, CreateQuestionDto, QuestionDifficulty, ContentName, SubContentName } from "../../services/questionService";
import { AddTestQuestionManualDto } from "../../services/testQuestionService";
import { createByLessonId, updateTestStatus } from "../../services/testService";
import { addQuestionsCustomManual } from "../../services/testQuestionService";
import { createQuestion } from "../../services/questionService";
import { useAuth } from "../../auth/AuthContext";

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  courseLevel: CourseLevel;
  onTestCreated?: () => void;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  courseLevel,
  onTestCreated
}) => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [testData, setTestData] = useState<CreateTestDto>({
    title: "",
    description: "",
    testType: TestType.CustomManual,
    courseLevel: courseLevel,
    durationMinutes: 30,
    maxAttempts: 3,
    passingPercentage: 70,
  });

  const [questions, setQuestions] = useState<CreateQuestionDto[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionDto>({
    content: "",
    explanation: "",
    points: 1,
    difficulty: QuestionDifficulty.Easy,
    isActive: true,
    contentName: ContentName.Vocabulary,
    level: courseLevel,
    subContentName: SubContentName.Mondai1,
  });

  const [choices, setChoices] = useState<{ content: string; isCorrect: boolean }[]>([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);

  const handleTestDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: name === 'durationMinutes' || name === 'maxAttempts' || name === 'passingPercentage' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: name === 'points' || name === 'difficulty' || name === 'contentName' || name === 'subContentName'
        ? parseInt(value)
        : value
    }));
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

  const addQuestion = () => {
    if (!currentQuestion.content.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    if (choices.filter(c => c.content.trim()).length < 2) {
      alert("Cần ít nhất 2 lựa chọn");
      return;
    }

    if (!choices.some(c => c.isCorrect)) {
      alert("Cần ít nhất 1 đáp án đúng");
      return;
    }

    const questionWithChoices = {
      ...currentQuestion,
      choices: choices.filter(c => c.content.trim())
    };

    setQuestions(prev => [...prev, questionWithChoices]);
    setCurrentQuestion({
      content: "",
      explanation: "",
      points: 1,
      difficulty: QuestionDifficulty.Easy,
      isActive: true,
      contentName: ContentName.Vocabulary,
      level: courseLevel,
      subContentName: SubContentName.Mondai1,
    });
    setChoices([
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const createTest = async () => {
    if (!userInfo?.id) {
      alert("Vui lòng đăng nhập để tạo test");
      return;
    }

    if (!testData.title.trim() || !testData.description.trim()) {
      alert("Vui lòng điền đầy đủ thông tin test");
      return;
    }

    if (questions.length === 0) {
      alert("Cần ít nhất 1 câu hỏi");
      return;
    }

    setLoading(true);
    try {
      // B1: Tạo test với status closed
      const createdTest = await createByLessonId(userInfo?.id || "", lessonId, testData);

      // B2: Tạo các câu hỏi và thêm vào test
      const questionIds: string[] = [];
      for (const question of questions) {
        const createdQuestion = await createQuestion(question);
        questionIds.push(createdQuestion.id);
      }

      // Thêm câu hỏi vào test
      const testQuestionPairs: AddTestQuestionManualDto[] = questionIds.map(questionId => ({
        testId: createdTest.testId,
        questionId: questionId
      }));

      await addQuestionsCustomManual(testQuestionPairs);

      // B3: Cập nhật status test thành open
      await updateTestStatus(createdTest.testId, TestStatus.Open);

      alert("Tạo test thành công!");
      onTestCreated?.();
      onClose();
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Có lỗi xảy ra khi tạo test. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 font-inter">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4 p-6">
          <h3 className="text-xl font-semibold text-gray-800">Tạo Test cho Bài học</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
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

          {/* Add Questions */}
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

          {/* Questions List */}
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
  );
};

export default CreateTestModal; 