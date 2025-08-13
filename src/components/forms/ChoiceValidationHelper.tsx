import React from 'react';
import { 
  ChoiceCreateDto, 
  ChoiceUpdateDto,
  validateChoiceCreateDto, 
  validateChoiceUpdateDto,
  CHOICE_VALIDATION_RULES 
} from '../../types/choice.types';

interface ChoiceValidationHelperProps {
  choices: ChoiceCreateDto[];
  onValidationError: (message: string) => void;
}

export const validateChoicesForForm = (choices: ChoiceCreateDto[]): { isValid: boolean; message?: string } => {
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

export const validateSingleChoice = (choice: ChoiceCreateDto | ChoiceUpdateDto, index: number): { isValid: boolean; message?: string } => {
  if (choice.content !== undefined) {
    const validation = validateChoiceCreateDto(choice as ChoiceCreateDto);
    if (!validation.isValid) {
      return { isValid: false, message: `Lựa chọn ${index + 1}: ${validation.message}` };
    }
  }
  
  return { isValid: true };
};

export const ChoiceValidationHelper: React.FC<ChoiceValidationHelperProps> = ({ choices, onValidationError }) => {
  const validateAndShowErrors = () => {
    const validation = validateChoicesForForm(choices);
    if (!validation.isValid) {
      onValidationError(validation.message || "Lựa chọn không hợp lệ");
    }
    return validation.isValid;
  };

  return null; // This is a utility component, no UI needed
};

export default ChoiceValidationHelper;
