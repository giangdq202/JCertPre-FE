import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-4xl" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 text-4xl" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 ${colors.bg} ${colors.border} border`}>
        <div className="p-6">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="text-center">
            {getIcon()}
            <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={onClose}
              className={`px-6 py-2 text-white rounded-lg transition-colors ${colors.button}`}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
