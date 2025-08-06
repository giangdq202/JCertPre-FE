import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FiCreditCard } from 'react-icons/fi';
import paths from '../routes/path';

interface CreditDisplayProps {
  showPurchaseButton?: boolean;
  showHistoryButton?: boolean;
  className?: string;
  compact?: boolean;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  showPurchaseButton = true,
  showHistoryButton = true,
  className = '',
  compact = false
}) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = () => {
    navigate(paths.credit_purchase);
  };

  const handleHistory = () => {
    navigate(paths.credit_history);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <FiCreditCard className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">Credit:</span>
        <span className="text-sm font-bold text-green-900">
          {userInfo?.credit || 0}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200 ${className}`}>
      <div className="flex items-center gap-2">
        <FiCreditCard className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">Credit:</span>
        <span className="text-lg font-bold text-green-900">
          {userInfo?.credit || 0}
        </span>
      </div>
      
      {(showHistoryButton || showPurchaseButton) && (
        <div className="flex gap-1">
          {showHistoryButton && (
            <button
              onClick={handleHistory}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition duration-200"
            >
              Lịch sử
            </button>
          )}
          {showPurchaseButton && (
            <button
              onClick={handlePurchase}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition duration-200"
            >
              Nạp tiền
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditDisplay; 