import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaExclamationCircle, FaSearch } from 'react-icons/fa';
import { 
  updateQuestion,
  createChoice,
  updateChoice,
  deleteChoice,
  getQuestionById,
  getChoicesByQuestionId,
  getQuestionsPagingDetails,
} from '../../services/questionService';
import {
  QuestionDifficulty, 
  ContentName, 
  CourseLevel, 
  SubContentName,
  UpdateQuestionDto,
  QuestionDto,
} from '../../types/question.types';
import { 
  ChoiceReadDto,
  ChoiceCreateDto,
  ChoiceUpdateDto,
  validateChoiceCreateDto,
  validateChoiceUpdateDto,
  CHOICE_VALIDATION_RULES
} from '../../types/choice.types';
import { addQuestionsCustomManual, getQuestionsByTestId, deleteTestQuestion } from '../../services/testQuestionService';
import { getAllSubContents, SubContentDto } from '../../services/subContentService';
import { TestDto, TestType, updateTest } from '../../services/testService';
import NotificationModal from './NotificationModal';

interface EditTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: TestDto | null;
  courseStartDate?: string;
  courseEndDate?: string;
  onTestUpdated: () => void;
}

interface EditTestFormState {
  title: string;
  description: string;
  durationMinutes: number;
  maxAttempts: number;
  passingPercentage: number;
}

interface ExistingQuestionWithChoices extends QuestionDto {
  testQuestionId: string;
  questionNumber: number;
  choices: ChoiceReadDto[];
}

interface EditQuestionFormState {
  content: string;
  explanation: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  newAudioFile?: File;
}

interface ExistingQuestionItemProps {
  question: ExistingQuestionWithChoices;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: UpdateQuestionDto) => void;
  onDelete: () => void;
  showNotification: (title: string, message: string, type: 'success' | 'error' | 'warning') => void;
}

const ExistingQuestionItem: React.FC<ExistingQuestionItemProps> = ({
  question,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  showNotification
}) => {
  const [editForm, setEditForm] = useState<EditQuestionFormState>({
    content: question.content,
    explanation: question.explanation || '',
    points: question.points,
    difficulty: question.difficulty,
    isActive: question.isActive,
    newAudioFile: undefined
  });

  const [editChoices, setEditChoices] = useState<Array<ChoiceReadDto & { isNew?: boolean }>>([]);
  const [loading, setLoading] = useState(false);

  // Initialize edit choices when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditChoices([...question.choices]);
    }
  }, [isEditing, question.choices]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate choices according to backend rules
      if (editChoices.length < 2) {
        showNotification('Thiếu lựa chọn', 'Phải có ít nhất 2 lựa chọn', 'warning');
        return;
      }
      
      if (!editChoices.some(choice => choice.isCorrect)) {
        showNotification('Thiếu đáp án đúng', 'Phải có ít nhất 1 đáp án đúng', 'warning');
        return;
      }
      
      // Validate each choice content
      for (let i = 0; i < editChoices.length; i++) {
        const choice = editChoices[i];
        if (!choice.content.trim()) {
          showNotification('Lựa chọn trống', `Lựa chọn ${i + 1} phải có nội dung`, 'warning');
          return;
        }
        
        // Validate choice content according to backend rules
        if (choice.content.length > CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH) {
          showNotification('Lựa chọn quá dài', `Lựa chọn ${i + 1}: ${CHOICE_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE}`, 'warning');
          return;
        }
      }

      // Handle choices first
      await updateChoices();
      
      // Update question
      const updateData: UpdateQuestionDto = {
        content: editForm.content,
        explanation: editForm.explanation,
        points: editForm.points,
        difficulty: editForm.difficulty,
        isActive: editForm.isActive,
        audioFile: editForm.newAudioFile
      };
      
      await onSave(updateData);
    } catch (error) {
      console.error('Error saving question:', error);
      showNotification('Lỗi', 'Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateChoices = async () => {
    // Get current choices for comparison
    const currentChoices = question.choices;
    
    // Update existing choices
    for (const choice of editChoices) {
      if (!choice.isNew && choice.choiceId) {
        const originalChoice = currentChoices.find(c => c.choiceId === choice.choiceId);
        if (originalChoice && (
          originalChoice.content !== choice.content || 
          originalChoice.isCorrect !== choice.isCorrect
        )) {
          const updateData: ChoiceUpdateDto = {
            content: choice.content,
            isCorrect: choice.isCorrect
          };
          
          // Validate update data
          const validation = validateChoiceUpdateDto(updateData);
          if (!validation.isValid) {
            throw new Error(`Choice update validation failed: ${validation.message}`);
          }
          
          await updateChoice(choice.choiceId, updateData);
        }
      }
    }

    // Create new choices
    for (const choice of editChoices) {
      if (choice.isNew) {
        const createData: ChoiceCreateDto = {
          content: choice.content,
          isCorrect: choice.isCorrect
        };
        
        // Validate create data
        const validation = validateChoiceCreateDto(createData);
        if (!validation.isValid) {
          throw new Error(`Choice creation validation failed: ${validation.message}`);
        }
        
        await createChoice(question.id, createData);
      }
    }

    // Delete removed choices
    const editChoiceIds = editChoices.filter(c => !c.isNew).map(c => c.choiceId);
    const deletedChoices = currentChoices.filter(c => !editChoiceIds.includes(c.choiceId));
    for (const choice of deletedChoices) {
      await deleteChoice(choice.choiceId);
    }
  };

  const addChoice = () => {
    setEditChoices(prev => [...prev, {
      choiceId: `temp-${Date.now()}`,
      questionId: question.id,
      content: '',
      isCorrect: false,
      isNew: true
    }]);
  };

  const removeChoice = (index: number) => {
    if (editChoices.length > 2) { // Keep at least 2 choices
      setEditChoices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateChoiceContent = (index: number, content: string) => {
    setEditChoices(prev => prev.map((choice, i) => 
      i === index ? { ...choice, content } : choice
    ));
  };

  const updateChoiceCorrect = (index: number) => {
    setEditChoices(prev => prev.map((choice, i) => ({
      ...choice,
      isCorrect: i === index
    })));
  };

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600">
            Câu {question.questionNumber} (Đang chỉnh sửa)
          </span>
                      <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`${loading ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800'}`}
              title={loading ? 'Đang lưu...' : 'Lưu'}
            >
              <FaSave size={16} />
            </button>
            <button
              onClick={onCancelEdit}
              disabled={loading}
              className={`${loading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
              title="Hủy"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung câu hỏi
            </label>
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm(prev => ({...prev, content: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <span>Giải thích đáp án</span>
                <span className="text-xs text-gray-500">(tuỳ chọn)</span>
              </div>
            </label>
            <textarea
              value={editForm.explanation}
              onChange={(e) => setEditForm(prev => ({...prev, explanation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Nhập giải thích chi tiết về đáp án đúng để giúp học viên hiểu rõ hơn..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm
              </label>
              <input
                type="number"
                value={editForm.points}
                onChange={(e) => setEditForm(prev => ({...prev, points: parseInt(e.target.value) || 1}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Độ khó
              </label>
              <select
                value={editForm.difficulty}
                onChange={(e) => setEditForm(prev => ({...prev, difficulty: parseInt(e.target.value) as QuestionDifficulty}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={QuestionDifficulty.Easy}>Dễ</option>
                <option value={QuestionDifficulty.Medium}>Trung bình</option>
                <option value={QuestionDifficulty.Hard}>Khó</option>
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={editForm.isActive ? '1' : '0'}
                onChange={(e) => setEditForm(prev => ({...prev, isActive: e.target.value === '1'}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Hoạt động</option>
                <option value="0">Không hoạt động</option>
              </select>
            </div>
          </div>

          {/* Choices Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Lựa chọn ({editChoices.length})
              </label>
              <button
                type="button"
                onClick={addChoice}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                <FaPlus size={10} />
                Thêm
              </button>
            </div>
            
            <div className="space-y-2">
              {editChoices.map((choice, index) => (
                <div key={choice.choiceId} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <input
                    type="text"
                    value={choice.content}
                    onChange={(e) => updateChoiceContent(index, e.target.value)}
                    placeholder={`Lựa chọn ${index + 1}`}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={choice.isCorrect}
                      onChange={() => updateChoiceCorrect(index)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">Đúng</span>
                  </label>
                  {editChoices.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeChoice(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Xóa lựa chọn"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Existing Audio Files */}
          {question.questionAttachments && question.questionAttachments.length > 0 && 
           question.questionAttachments.some(att => att.mediaType === 'audio') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File âm thanh hiện tại
              </label>
              <div className="space-y-2">
                {question.questionAttachments
                  .filter(att => att.mediaType === 'audio')
                  .map((att, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="text-blue-600">🔊</span>
                      <audio controls className="h-8">
                        <source src={att.mediaUrl} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                      <span className="text-xs text-gray-500">Audio file</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* New Audio File Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tải lên tệp âm thanh mới (tùy chọn)
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setEditForm(prev => ({ ...prev, newAudioFile: file }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ: MP3, WAV, OGG. Kích thước tối đa: 10MB. Để trống nếu không muốn thay đổi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            Câu {question.questionNumber}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            question.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {question.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {question.difficulty === QuestionDifficulty.Easy ? 'Dễ' :
             question.difficulty === QuestionDifficulty.Medium ? 'Trung bình' : 'Khó'}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            {question.points} điểm
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
            title="Xóa"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <h4 className="font-medium text-gray-800">{question.content}</h4>
        </div>
        
        {question.explanation && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-sm font-medium text-blue-800">Giải thích đáp án</span>
            </div>
            <p className="text-sm text-blue-700 pl-6 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        <div>
          <span className="text-sm text-gray-600">Loại: </span>
          <span className="text-sm text-gray-700">
            {ContentName[question.contentName]} - {SubContentName[question.subContentName]}
          </span>
        </div>

        {question.choices && question.choices.length > 0 && (
          <div>
            <span className="text-sm text-gray-600 block mb-1">Lựa chọn:</span>
            <div className="space-y-1">
              {question.choices.map((choice, index) => (
                <div 
                  key={choice.choiceId} 
                  className={`flex items-center gap-2 text-sm ${
                    choice.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{choice.content}</span>
                  {choice.isCorrect && (
                    <span className="text-green-600 text-xs">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Attachments */}
        {question.questionAttachments && question.questionAttachments.length > 0 && (
          <div>
            <span className="text-sm text-gray-600 block mb-1">Tệp đính kèm:</span>
            <div className="space-y-2">
              {question.questionAttachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2">
                  {attachment.mediaType === 'audio' && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="text-blue-600">🔊</span>
                      <audio controls className="h-8">
                        <source src={attachment.mediaUrl} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                      <span className="text-xs text-gray-500">Audio file</span>
                    </div>
                  )}
                  {attachment.mediaType === 'image' && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="text-green-600">🖼️</span>
                      <img 
                        src={attachment.mediaUrl} 
                        alt="Question attachment" 
                        className="h-16 w-auto rounded border"
                      />
                      <span className="text-xs text-gray-500">Image file</span>
                    </div>
                  )}
                  {attachment.mediaType !== 'audio' && attachment.mediaType !== 'image' && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <span className="text-purple-600">📎</span>
                      <a 
                        href={attachment.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Xem tệp đính kèm
                      </a>
                      <span className="text-xs text-gray-500">Other file</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditTestModal: React.FC<EditTestModalProps> = ({
  isOpen,
  onClose,
  test,
  courseStartDate,
  courseEndDate,
  onTestUpdated
}) => {
  const [formState, setFormState] = useState<EditTestFormState>({
    title: '',
    description: '',
    durationMinutes: 30,
    maxAttempts: 3,
    passingPercentage: 70
  });
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [existingQuestions, setExistingQuestions] = useState<ExistingQuestionWithChoices[]>([]);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Question search states
  const [availableQuestions, setAvailableQuestions] = useState<QuestionDto[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loadingAvailableQuestions, setLoadingAvailableQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContentName, setFilterContentName] = useState<ContentName | ''>('');
  const [filterSubContentName, setFilterSubContentName] = useState<SubContentName | ''>('');

  // Initialize form when test data changes
  useEffect(() => {
    if (test) {
      setFormState({
        title: test.title || '',
        description: test.description || '',
        durationMinutes: test.durationMinutes || 30,
        maxAttempts: test.maxAttempts || 3,
        passingPercentage: 70 // Default value since it's not in TestDto
      });
      
      setError('');
      loadSubContents();
    }
  }, [test, courseStartDate, courseEndDate]);

  // Load subcontents and existing questions when test changes
  useEffect(() => {
    if (test && isOpen) {
      loadExistingQuestions();
    }
  }, [test, isOpen]);

  const loadSubContents = async () => {
    if (!test) return;
    try {
      // Load all subcontents for the test's course level
      const data = await getAllSubContents(undefined, test.courseLevel);
      setSubContents(data.items);
    } catch (error) {
      console.error('Failed to load subcontents:', error);
      setSubContents([]);
    }
  };

  const loadExistingQuestions = async () => {
    if (!test) return;
    setLoadingQuestions(true);
    try {
      const testQuestions = await getQuestionsByTestId(test.testId);
      const questionsWithDetails = await Promise.all(
        testQuestions.map(async (tq) => {
          const questionDetail = await getQuestionById(tq.questionId);
          const choices = await getChoicesByQuestionId(tq.questionId);
          return {
            ...questionDetail,
            testQuestionId: tq.testQuestionId,
            questionNumber: tq.questionNumber,
            choices: choices
          } as ExistingQuestionWithChoices;
        })
      );
      setExistingQuestions(questionsWithDetails.sort((a, b) => a.questionNumber - b.questionNumber));
    } catch (error) {
      console.error('Failed to load existing questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Search for available questions
  const searchAvailableQuestions = async () => {
    if (!test) return;
    
    try {
      setLoadingAvailableQuestions(true);
      const searchParams = {
        pageIndex: 1,
        pageSize: 50,
        search: searchTerm.trim() || undefined,
        contentName: filterContentName ? (filterContentName as ContentName) : undefined, 
        subContentName: filterSubContentName ? (filterSubContentName as SubContentName) : undefined,
        courseLevel: [test.courseLevel], // Filter by course level of the test
        isActive: true // Only get active questions
      };

      const response = await getQuestionsPagingDetails(searchParams);
      if (response && response.items) {
        // Filter out questions that are already in the test
        const existingQuestionIds = new Set(existingQuestions.map(q => q.id));
        const newQuestions = response.items.filter((q: QuestionDto) => !existingQuestionIds.has(q.id));
        setAvailableQuestions(newQuestions);
      }
    } catch (error) {
      console.error('Error searching questions:', error);
      setError('Không thể tìm kiếm câu hỏi');
    } finally {
      setLoadingAvailableQuestions(false);
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Add selected questions to test
  const addSelectedQuestions = async () => {
    if (!test || selectedQuestionIds.length === 0) {
      setError('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare test-question pairs for the API
      const testQuestionPairs = selectedQuestionIds.map(questionId => ({
        testId: test.testId,
        questionId: questionId
      }));
      
      // Add questions to test using the service
      await addQuestionsCustomManual(testQuestionPairs);
      
      // Reload existing questions to reflect changes
      await loadExistingQuestions();
      
      // Clear selections and reset search
      setSelectedQuestionIds([]);
      setAvailableQuestions([]);
      setSearchTerm('');
      setFilterContentName('');
      setFilterSubContentName('');
      
      showNotification('Thành công', 'Đã thêm câu hỏi vào bài test', 'success');
    } catch (error) {
      console.error('Error adding questions to test:', error);
      setError('Không thể thêm câu hỏi vào bài test');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: keyof EditTestFormState) => (value: number) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteExistingQuestion = async (testQuestionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    
    try {
      await deleteTestQuestion(testQuestionId);
      setExistingQuestions(prev => prev.filter(q => q.testQuestionId !== testQuestionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
      setError('Không thể xóa câu hỏi. Vui lòng thử lại.');
    }
  };

  const handleUpdateExistingQuestion = async (questionId: string, updates: UpdateQuestionDto) => {
    try {
      await updateQuestion(questionId, updates);
      setEditingQuestionId(null);
      // Reload the questions to get updated data
      await loadExistingQuestions();
    } catch (error: any) {
      console.error('Failed to update question:', error);
      
      // Handle backend validation errors
      if (error?.response?.status === 400 && error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        let errorMessage = "Lỗi validation:\n";
        
        Object.entries(validationErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessage += `- ${field}: ${messages.join(', ')}\n`;
          } else {
            errorMessage += `- ${field}: ${messages}\n`;
          }
        });
        
        showNotification('Lỗi validation', errorMessage.trim(), 'error');
      } else if (error?.response?.data?.message) {
        showNotification('Lỗi', error.response.data.message, 'error');
      } else {
        showNotification('Lỗi', 'Không thể cập nhật câu hỏi. Vui lòng thử lại.', 'error');
      }
      throw error; // Re-throw so ExistingQuestionItem can handle it
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;

    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formState.title.trim()) {
        throw new Error('Tiêu đề test không được để trống');
      }
      if (!formState.description.trim()) {
        throw new Error('Mô tả test không được để trống');
      }
      // Only validate durationMinutes for CustomManual tests
      if (test.testType === TestType.CustomManual && formState.durationMinutes <= 0) {
        throw new Error('Thời gian làm bài phải lớn hơn 0');
      }
      if (formState.maxAttempts <= 0) {
        throw new Error('Số lần thử phải lớn hơn 0');
      }
      // Only validate passingPercentage if test is closed
      if (test.status === 1 && (formState.passingPercentage < 0 || formState.passingPercentage > 100)) {
        throw new Error('Tỷ lệ đạt phải từ 0 đến 100%');
      }

      // Check if test has existing questions to determine what can be updated
      
      // Prepare update data based on business rules
      const updateData: any = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        maxAttempts: formState.maxAttempts
      };

      // Use course dates for test availability (auto-sync with course schedule)
      if (courseStartDate && courseStartDate.trim()) {
        try {
          updateData.availableFrom = new Date(courseStartDate).toISOString();
        } catch (error) {
          console.warn('Invalid courseStartDate:', courseStartDate);
        }
      }
      
      if (courseEndDate && courseEndDate.trim()) {
        try {
          updateData.availableTo = new Date(courseEndDate).toISOString();
        } catch (error) {
          console.warn('Invalid courseEndDate:', courseEndDate);
        }
      }

      // Only include durationMinutes for CustomManual tests
      if (test.testType === TestType.CustomManual) {
        updateData.durationMinutes = formState.durationMinutes;
      }

      // Only include passingPercentage if test is closed (status = 1)
      if (test.status === 1) {
        updateData.passingPercentage = formState.passingPercentage;
      }

      // NEVER include testType or courseLevel in updates to avoid complex BE logic issues
      // These should be handled separately if needed

      // Debug logging
      console.log('===== UPDATE TEST DEBUG =====');
      console.log('Update data being sent:', JSON.stringify(updateData, null, 2));
      console.log('Test info:', {
        testId: test.testId,
        testType: test.testType,
        status: test.status,
        courseLevel: test.courseLevel,
      });
      console.log('==============================');

      // Update test
      await updateTest(test.testId, updateData);

      onTestUpdated();
    } catch (error: any) {
      console.error('Error updating test:', error);
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật test');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !test) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa Test</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <FaExclamationCircle className="text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Test Info Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Thông tin Test</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Removed Test Type display - fixed to CustomManual */}
              <div>
                <span className="font-medium">Cấp độ:</span>
                <span className="ml-2 text-gray-600">
                  {test.courseLevel === CourseLevel.N5 ? 'N5' :
                   test.courseLevel === CourseLevel.N4 ? 'N4' :
                   test.courseLevel === CourseLevel.N3 ? 'N3' :
                   test.courseLevel === CourseLevel.N2 ? 'N2' :
                   test.courseLevel === CourseLevel.N1 ? 'N1' : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span>
                <span className={`ml-2 ${test.status === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {test.status === 0 ? 'Mở' : 'Đóng'}
                </span>
              </div>
            </div>
            
            {/* Business Rules Notice */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-xs font-medium text-blue-800 mb-1">Lưu ý về chỉnh sửa:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Tỷ lệ đạt chỉ có thể sửa khi test đã đóng</li>
              </ul>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề test *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Nhập tiêu đề test"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả test *
              </label>
              <textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Nhập mô tả test"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian làm bài (phút) *
                {test.testType !== TestType.CustomManual && (
                  <span className="text-xs text-red-500 ml-1">(Chỉ có thể sửa với Custom Manual)</span>
                )}
              </label>
              <input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                value={formState.durationMinutes}
                onChange={(e) => handleNumberChange('durationMinutes')(parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 ${
                  test.testType !== TestType.CustomManual ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                min="1"
                required
                disabled={test.testType !== TestType.CustomManual}
                readOnly={test.testType !== TestType.CustomManual}
              />
            </div>

            {/* Max Attempts */}
            <div>
              <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-2">
                Số lần thử tối đa *
              </label>
              <input
                type="number"
                id="maxAttempts"
                name="maxAttempts"
                value={formState.maxAttempts}
                onChange={(e) => handleNumberChange('maxAttempts')(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                min="1"
                required
              />
            </div>

            {/* Passing Percentage */}
            <div>
              <label htmlFor="passingPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                Tỷ lệ đạt (%) *
                {test.status !== 1 && (
                  <span className="text-xs text-red-500 ml-1">(Chỉ có thể sửa khi test đã đóng)</span>
                )}
              </label>
              <input
                type="number"
                id="passingPercentage"
                name="passingPercentage"
                value={formState.passingPercentage}
                onChange={(e) => handleNumberChange('passingPercentage')(parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 ${
                  test.status !== 1 ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                min="0"
                max="100"
                required
                disabled={test.status !== 1}
                readOnly={test.status !== 1}
              />
            </div>

            {/* Available From - Auto from Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Có hiệu lực từ (Tự động từ khóa học)
              </label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                {courseStartDate ? new Date(courseStartDate).toLocaleString('vi-VN') : 'Chưa có thông tin'}
              </div>
            </div>

            {/* Available To - Auto from Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Có hiệu lực đến (Tự động từ khóa học)
              </label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                {courseEndDate ? new Date(courseEndDate).toLocaleString('vi-VN') : 'Chưa có thông tin'}
              </div>
            </div>
          </div>

          {/* Existing Questions Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Câu hỏi hiện có ({existingQuestions.length})
              </h3>
              {loadingQuestions && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
            </div>

            {existingQuestions.length === 0 && !loadingQuestions ? (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có câu hỏi nào trong test này</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {existingQuestions.map((question, index) => (
                  <div key={question.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <ExistingQuestionItem
                        question={question}
                        isEditing={editingQuestionId === question.id}
                        onEdit={() => setEditingQuestionId(question.id)}
                        onCancelEdit={() => setEditingQuestionId(null)}
                        onSave={(updates) => handleUpdateExistingQuestion(question.id, updates)}
                        onDelete={() => handleDeleteExistingQuestion(question.testQuestionId)}
                        showNotification={showNotification}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Questions Section */}
          <div className="border-t border-gray-200 pt-6">
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
                      onChange={(e) => setFilterContentName(e.target.value as ContentName | '')}
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
                      onChange={(e) => setFilterSubContentName(e.target.value as SubContentName | '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      disabled={!filterContentName}
                    >
                      <option value="">Tất cả loại bài</option>
                      {subContents.map((sub) => (
                        <option key={`${sub.subContentName}-${sub.contentName}`} value={sub.subContentName}>
                          {SubContentName[sub.subContentName as keyof typeof SubContentName]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Button and Clear */}
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={searchAvailableQuestions}
                    disabled={loadingAvailableQuestions}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      loadingAvailableQuestions 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FaSearch size={14} />
                    {loadingAvailableQuestions ? 'Đang tìm kiếm...' : 'Tìm kiếm ngay'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterContentName("");
                      setFilterSubContentName("");
                      setAvailableQuestions([]);
                      setSelectedQuestionIds([]);
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
                {availableQuestions.length === 0 && !loadingAvailableQuestions && searchTerm && (
                  <div className="text-center py-4 text-gray-500">
                    <div>
                      <p>Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.</p>
                      <p className="text-sm mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          

           

           {/* Action Buttons */}
           <div className="flex gap-3 pt-6 border-t border-gray-200">
             <button
               type="submit"
               disabled={loading}
               className={`flex items-center px-6 py-3 rounded-lg shadow-md transition-all duration-200 text-white font-semibold
                 ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
               `}
             >
               <FaSave className="mr-2" />
               {loading ? "Đang cập nhật..." : "Cập nhật Test"}
             </button>
             <button
               type="button"
               onClick={onClose}
               className="flex items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-semibold"
             >
               <FaTimes className="mr-2" />
               Hủy
             </button>
           </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default EditTestModal; 