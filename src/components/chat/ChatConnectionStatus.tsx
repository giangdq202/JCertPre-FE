import React from 'react';
import { HiWifi, HiNoSymbol } from 'react-icons/hi2';

interface ChatConnectionStatusProps {
  isConnected: boolean;
  theme?: 'green' | 'orange';
}

const ChatConnectionStatus: React.FC<ChatConnectionStatusProps> = ({ 
  isConnected, 
  theme = 'green' 
}) => {
  const getStatusClasses = () => {
    if (isConnected) {
      return theme === 'green' 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-orange-50 border-orange-200 text-orange-700';
    }
    return 'bg-red-50 border-red-200 text-red-700';
  };

  const getIconClasses = () => {
    if (isConnected) {
      return theme === 'green' 
        ? 'text-green-500' 
        : 'text-orange-500';
    }
    return 'text-red-500';
  };

  if (!isConnected) {
    return (
      <div className={`px-3 py-1 text-xs border rounded-full flex items-center gap-1 ${getStatusClasses()}`}>
        <HiNoSymbol className={`w-3 h-3 ${getIconClasses()}`} />
        Mất kết nối real-time
      </div>
    );
  }

  return (
    <div className={`px-3 py-1 text-xs border rounded-full flex items-center gap-1 ${getStatusClasses()}`}>
      <HiWifi className={`w-3 h-3 ${getIconClasses()}`} />
      Kết nối real-time
    </div>
  );
};

export default ChatConnectionStatus;
