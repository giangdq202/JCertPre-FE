import React from 'react';
import { HiOutlineUser, HiOutlineArrowLeft } from 'react-icons/hi2';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  avatar?: string;
  isOnline?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  theme?: 'green' | 'orange';
  additionalActions?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatar,
  isOnline = true,
  showBackButton = false,
  onBackClick,
  theme = 'green',
  additionalActions
}) => {
  console.log('ChatHeader additionalActions:', additionalActions);
  const getStatusColor = () => {
    return theme === 'green' ? 'text-green-600' : 'text-orange-600';
  };

  const getAvatarBg = () => {
    return theme === 'green' ? 'bg-green-500' : 'bg-orange-500';
  };

  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && onBackClick && (
            <button
              onClick={onBackClick}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className={`w-10 h-10 ${getAvatarBg()} rounded-full flex items-center justify-center`}>
                <HiOutlineUser className="text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {additionalActions}
          {isOnline && (
            <div className="text-sm text-gray-500">
              <span className={`flex items-center gap-1 ${getStatusColor()}`}>
                <div className={`w-2 h-2 ${theme === 'green' ? 'bg-green-500' : 'bg-orange-500'} rounded-full`}></div>
                Đang hoạt động
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
