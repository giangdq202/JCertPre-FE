import React, { useState, useEffect } from 'react';
import { FaTrash, FaCheck } from 'react-icons/fa';
import { ChoiceCreateDto, validateChoiceCreateDto, CHOICE_VALIDATION_RULES } from '../../types/choice.types';

interface ChoiceInputProps {
  choice: ChoiceCreateDto;
  index: number;
  isCorrect: boolean;
  onUpdate: (index: number, choice: ChoiceCreateDto) => void;
  onRemove: (index: number) => void;
  onCorrectChange: (index: number) => void;
  showValidation?: boolean;
}

const ChoiceInput: React.FC<ChoiceInputProps> = ({
  choice,
  index,
  isCorrect,
  onUpdate,
  onRemove,
  onCorrectChange,
  showValidation = false
}) => {
  const [content, setContent] = useState(choice.content);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setContent(choice.content);
  }, [choice.content]);

  const handleContentChange = (value: string) => {
    setContent(value);
    onUpdate(index, { ...choice, content: value });
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleBlur = () => {
    if (showValidation && content.trim()) {
      const validation = validateChoiceCreateDto({ ...choice, content });
      if (!validation.isValid) {
        setValidationError(validation.message || '');
      } else {
        setValidationError('');
      }
    }
  };

  const getCharacterCountColor = () => {
    const length = content.length;
    if (length === 0) return 'text-gray-400';
    if (length > CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH * 0.8) return 'text-yellow-500';
    if (length > CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white">
      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
        {String.fromCharCode(65 + index)}
      </span>
      
      <div className="flex-1">
        <input
          type="text"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={`Lựa chọn ${index + 1}`}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            validationError ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH}
        />
        
        {showValidation && (
          <div className="mt-1 flex items-center justify-between">
            {validationError && (
              <span className="text-xs text-red-500">{validationError}</span>
            )}
            <span className={`text-xs ${getCharacterCountColor()}`}>
              {content.length}/{CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH}
            </span>
          </div>
        )}
      </div>
      
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="correctAnswer"
          checked={isCorrect}
          onChange={() => onCorrectChange(index)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <FaCheck size={12} />
          Đúng
        </span>
      </label>
      
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-500 hover:text-red-700 p-1"
        title="Xóa lựa chọn"
      >
        <FaTrash size={14} />
      </button>
    </div>
  );
};

export default ChoiceInput;
