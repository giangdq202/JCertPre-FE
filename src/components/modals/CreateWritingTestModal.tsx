import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { ContentName, SubContentName, CourseLevel, QuestionDifficulty } from '../../types/question.types';
import { CreateQuestionDto } from '../../types/question.types';
import { CreateTestDto, TestType } from '../../services/testService';
import { createQuestion } from '../../services/questionService';
import { createWritingByLessonId } from '../../services/testService';
import { addQuestionsCustomManual } from '../../services/testQuestionService';
import { useNotification } from '../notifications';
import { useAuth } from '../../auth/AuthContext';

export interface CreateWritingTestModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  lessonId: string;
  courseLevel: CourseLevel;
  courseStartDate?: string;
  courseEndDate?: string;
}

interface WritingQuestionForm {
  id: string; // temporary ID for form management
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
}

const CreateWritingTestModal: React.FC<CreateWritingTestModalProps> = ({
  isVisible,
  onCancel,
  onSuccess,
  lessonId,
  courseLevel,
  courseStartDate,
  courseEndDate,
}) => {
  const { success: showSuccess, error: showError, warning: showWarning } = useNotification();
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Test form data
  const [testForm, setTestForm] = useState<CreateTestDto>({
    title: '',
    description: '',
    testType: TestType.WrittenManual,
    courseLevel: courseLevel,
    durationMinutes: 60,
    availableFrom: courseStartDate,
    availableTo: courseEndDate,
    maxAttempts: 1,
    passingPercentage: 60,
  });

  // Questions form data
  const [questions, setQuestions] = useState<WritingQuestionForm[]>([
    {
      id: '1',
      content: '',
      explanation: '',
      points: 10,
      difficulty: QuestionDifficulty.Easy,
      isActive: true,
    }
  ]);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>('1');

  useEffect(() => {
    if (isVisible) {
      // Debug log để kiểm tra course dates
      console.log('Course dates:', { courseStartDate, courseEndDate });
      
      // Reset form when modal opens
      const now = new Date().toISOString();
      const formData = {
        title: '',
        description: '',
        testType: TestType.WrittenManual,
        courseLevel: courseLevel,
        durationMinutes: 60,
        availableFrom: courseStartDate || now,
        availableTo: courseEndDate || now,
        maxAttempts: 1,
        passingPercentage: 60,
      };
      
      console.log('Setting form data:', formData);
      setTestForm(formData);
      
      setQuestions([
        {
          id: '1',
          content: '',
          explanation: '',
          points: 10,
          difficulty: QuestionDifficulty.Easy,
          isActive: true,
        }
      ]);
      
      setEditingQuestionId('1');
    }
  }, [isVisible, courseLevel, courseStartDate, courseEndDate]);

  const addNewQuestion = () => {
    const newId = (questions.length + 1).toString();
    const newQuestion: WritingQuestionForm = {
      id: newId,
      content: '',
      explanation: '',
      points: 10,
      difficulty: QuestionDifficulty.Easy,
      isActive: true,
    };
    
    setQuestions([...questions, newQuestion]);
    setEditingQuestionId(newId);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      showWarning('Cảnh báo', 'Cần có ít nhất một câu hỏi');
      return;
    }
    
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    
    if (editingQuestionId === questionId) {
      setEditingQuestionId(updatedQuestions[0]?.id || null);
    }
  };

  const updateQuestion = (questionId: string, field: keyof WritingQuestionForm, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const validateForm = (): boolean => {
    if (!testForm.title.trim()) {
      showError('Lỗi', 'Vui lòng nhập tiêu đề bài kiểm tra');
      return false;
    }
    
    if (testForm.durationMinutes <= 0) {
      showError('Lỗi', 'Thời gian làm bài phải lớn hơn 0');
      return false;
    }
    
    if (testForm.maxAttempts <= 0) {
      showError('Lỗi', 'Số lần làm bài phải lớn hơn 0');
      return false;
    }
    
    if (testForm.passingPercentage < 0 || testForm.passingPercentage > 100) {
      showError('Lỗi', 'Điểm đạt phải từ 0 đến 100');
      return false;
    }
    
    for (const question of questions) {
      if (!question.content.trim()) {
        showError('Lỗi', 'Tất cả câu hỏi phải có nội dung');
        return false;
      }
      
      if (question.points <= 0) {
        showError('Lỗi', 'Điểm số câu hỏi phải lớn hơn 0');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Step 1: Create writing questions
      const createdQuestionIds: string[] = [];
      
      for (const question of questions) {
        const questionData: CreateQuestionDto = {
          content: question.content,
          explanation: question.explanation || '',
          points: question.points,
          difficulty: question.difficulty,
          isActive: question.isActive,
          contentName: ContentName.Writing,
          level: courseLevel,
          subContentName: SubContentName.Mondai15, // Writing subcontent
        };
        
        const createdQuestion = await createQuestion(questionData);
        createdQuestionIds.push(createdQuestion.id);
      }
      
      // Step 2: Create writing test
      const userId = userInfo?.id || '';
      if (!userId) {
        showError('Lỗi', 'Không thể xác định người dùng hiện tại');
        return;
      }
      
      // Debug log để kiểm tra testForm trước khi gửi
      console.log('Test form before API call:', testForm);
      
      const createdTest = await createWritingByLessonId(userId, lessonId, testForm);
      
      // Step 3: Add questions to test
      const testQuestionPairs = createdQuestionIds.map(questionId => ({
        testId: createdTest.testId,
        questionId: questionId,
      }));
      
      await addQuestionsCustomManual(testQuestionPairs);
      
      showSuccess('Thành công', 'Tạo bài kiểm tra viết thành công!');
      onSuccess();
      onCancel();
      
    } catch (error: any) {
      console.error('Error creating writing test:', error);
      showError(
        'Lỗi',
        error?.response?.data?.message || 'Có lỗi xảy ra khi tạo bài kiểm tra viết'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions.find(q => q.id === editingQuestionId);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Tạo bài kiểm tra viết mới
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content - flex-1 để chiếm không gian còn lại */}
        <div className="flex flex-1 min-h-0">
          {/* Left Panel - Test Information */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin bài kiểm tra</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề bài kiểm tra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mô tả bài kiểm tra"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút) *
                  </label>
                  <input
                    type="number"
                    value={testForm.durationMinutes}
                    onChange={(e) => setTestForm({ ...testForm, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lần làm bài *
                  </label>
                  <input
                    type="number"
                    value={testForm.maxAttempts}
                    onChange={(e) => setTestForm({ ...testForm, maxAttempts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm đạt (%) *
                </label>
                <input
                  type="number"
                  value={testForm.passingPercentage}
                  onChange={(e) => setTestForm({ ...testForm, passingPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Questions List */}
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">
              Câu hỏi ({questions.length})
            </h3>
            
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    editingQuestionId === question.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setEditingQuestionId(question.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Câu {index + 1}: {question.content ? question.content.substring(0, 50) + (question.content.length > 50 ? '...' : '') : 'Chưa có nội dung'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingQuestionId(question.id);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(question.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        disabled={questions.length <= 1}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {question.points} điểm • {question.difficulty === QuestionDifficulty.Easy ? 'Dễ' : question.difficulty === QuestionDifficulty.Medium ? 'Trung bình' : 'Khó'}
                  </div>
                </div>
              ))}
            </div>
            
            {/* <button
              onClick={addNewQuestion}
              className="mt-3 w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2"
            >
              <FaPlus size={12} />
              Thêm câu hỏi
            </button> */}
          </div>

          {/* Right Panel - Question Editor */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {currentQuestion ? (
              <>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Chỉnh sửa câu hỏi {questions.findIndex(q => q.id === currentQuestion.id) + 1}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung câu hỏi *
                    </label>
                    <textarea
                      value={currentQuestion.content}
                      onChange={(e) => updateQuestion(currentQuestion.id, 'content', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập nội dung câu hỏi viết..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giải thích/Hướng dẫn
                    </label>
                    <textarea
                      value={currentQuestion.explanation || ''}
                      onChange={(e) => updateQuestion(currentQuestion.id, 'explanation', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập giải thích hoặc hướng dẫn cho câu hỏi..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Điểm số *
                      </label>
                      <input
                        type="number"
                        value={currentQuestion.points}
                        onChange={(e) => updateQuestion(currentQuestion.id, 'points', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Độ khó
                      </label>
                      <select
                        value={currentQuestion.difficulty}
                        onChange={(e) => updateQuestion(currentQuestion.id, 'difficulty', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={QuestionDifficulty.Easy}>Dễ</option>
                        <option value={QuestionDifficulty.Medium}>Trung bình</option>
                        <option value={QuestionDifficulty.Hard}>Khó</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={currentQuestion.isActive}
                      onChange={(e) => updateQuestion(currentQuestion.id, 'isActive', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Kích hoạt câu hỏi
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Chọn một câu hỏi để chỉnh sửa
              </div>
            )}
          </div>
        </div>

        {/* Footer - flex-shrink-0 để luôn hiển thị */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWritingTestModal;
