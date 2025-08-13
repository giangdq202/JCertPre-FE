import React from 'react';
import { MdOutlineSend } from 'react-icons/md';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  placeholder?: string;
  theme?: 'green' | 'orange';
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  placeholder = "Nhập tin nhắn...",
  theme = 'green'
}) => {
  const getThemeClasses = () => {
    return theme === 'green' 
      ? 'focus:ring-green-500 focus:border-transparent' 
      : 'focus:ring-orange-500 focus:border-transparent';
  };

  const getButtonClasses = () => {
    const baseClasses = "text-white p-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors";
    return theme === 'green'
      ? `bg-green-500 hover:bg-green-600 ${baseClasses}`
      : `bg-orange-500 hover:bg-orange-600 ${baseClasses}`;
  };

  return (
    <div className="p-6 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 ${getThemeClasses()}`}
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          className={getButtonClasses()}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <MdOutlineSend className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Nhấn Enter để gửi, Shift + Enter để xuống dòng
      </p>
    </div>
  );
};

export default ChatInput;
