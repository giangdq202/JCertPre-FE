import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { ChoiceCreateDto } from '../../types/choice.types';
import ChoiceInput from './ChoiceInput';

interface ChoiceListProps {
  choices: ChoiceCreateDto[];
  onChoicesChange: (choices: ChoiceCreateDto[]) => void;
  showValidation?: boolean;
  minChoices?: number;
  maxChoices?: number;
}

const ChoiceList: React.FC<ChoiceListProps> = ({
  choices,
  onChoicesChange,
  showValidation = false,
  minChoices = 2,
  maxChoices = 6
}) => {
  const addChoice = () => {
    if (choices.length < maxChoices) {
      const newChoices = [...choices, { content: '', isCorrect: false }];
      onChoicesChange(newChoices);
    }
  };

  const removeChoice = (index: number) => {
    if (choices.length > minChoices) {
      const newChoices = choices.filter((_, i) => i !== index);
      // Ensure at least one choice is marked as correct
      if (!newChoices.some(c => c.isCorrect) && newChoices.length > 0) {
        newChoices[0].isCorrect = true;
      }
      onChoicesChange(newChoices);
    }
  };

  const updateChoice = (index: number, choice: ChoiceCreateDto) => {
    const newChoices = [...choices];
    newChoices[index] = choice;
    onChoicesChange(newChoices);
  };

  const updateChoiceCorrect = (index: number) => {
    const newChoices = choices.map((choice, i) => ({
      ...choice,
      isCorrect: i === index
    }));
    onChoicesChange(newChoices);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Các lựa chọn ({choices.length})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addChoice}
            disabled={choices.length >= maxChoices}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaPlus size={12} />
            Thêm
          </button>
          <button
            type="button"
            onClick={() => removeChoice(choices.length - 1)}
            disabled={choices.length <= minChoices}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            <FaTrash size={12} />
            Xóa
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <ChoiceInput
            key={index}
            choice={choice}
            index={index}
            isCorrect={choice.isCorrect}
            onUpdate={updateChoice}
            onRemove={removeChoice}
            onCorrectChange={updateChoiceCorrect}
            showValidation={showValidation}
          />
        ))}
      </div>
      
      {choices.length < minChoices && (
        <p className="text-sm text-red-500">
          Cần ít nhất {minChoices} lựa chọn
        </p>
      )}
      
      {choices.length > maxChoices && (
        <p className="text-sm text-red-500">
          Tối đa {maxChoices} lựa chọn
        </p>
      )}
    </div>
  );
};

export default ChoiceList;
