import React from 'react';
import { HiOutlineClock } from 'react-icons/hi2';

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  senderName?: string;
  messageTheme?: 'green' | 'orange';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  content, 
  timestamp, 
  isOwnMessage, 
  senderName,
  messageTheme = 'green' 
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getThemeClasses = () => {
    if (isOwnMessage) {
      return messageTheme === 'green' 
        ? 'bg-green-500 text-white'
        : 'bg-orange-500 text-white';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getTimeClasses = () => {
    if (isOwnMessage) {
      return messageTheme === 'green' 
        ? 'text-green-100'
        : 'text-orange-100';
    }
    return 'text-gray-500';
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${getThemeClasses()}`}>
        {!isOwnMessage && senderName && (
          <p className="text-xs font-medium mb-1 opacity-75">{senderName}</p>
        )}
        <p className="text-sm">{content}</p>
        <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${getTimeClasses()}`}>
          <HiOutlineClock className="w-3 h-3" />
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
